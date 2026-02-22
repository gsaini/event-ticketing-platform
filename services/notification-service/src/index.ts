import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import nodemailer from 'nodemailer';
import { Kafka, Consumer } from 'kafkajs';
import pino from 'pino';

const logger = pino({ level: process.env.LOG_LEVEL || 'info', base: { service: 'notification-service' } });
const app = express();
const port = parseInt(process.env.PORT || '3006', 10);

// ── SMTP Transport (Mailhog in dev) ─────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '1025', 10),
  secure: false,
  ignoreTLS: true,
});

const FROM_ADDRESS = process.env.SMTP_FROM || 'noreply@eventtickets.local';

// ── Email Templates ─────────────────────────────────────────────────────────
const templates: Record<string, (data: any) => { subject: string; html: string }> = {
  'booking.confirmed': (data) => ({
    subject: `🎫 Booking Confirmed — ${data.bookingId?.substring(0, 8)}`,
    html: `<h2>Your booking is confirmed!</h2><p>Booking ID: <strong>${data.bookingId}</strong></p><p>Amount: <strong>$${data.amount}</strong></p><p>Check your account for your digital tickets and QR codes.</p>`,
  }),
  'booking.cancelled': (data) => ({
    subject: `❌ Booking Cancelled — ${data.bookingId?.substring(0, 8)}`,
    html: `<h2>Booking Cancelled</h2><p>Booking ID: <strong>${data.bookingId}</strong></p><p>If you didn't request this, please contact support.</p>`,
  }),
  'payment.success': (data) => ({
    subject: `✅ Payment Received — $${data.amount}`,
    html: `<h2>Payment Successful</h2><p>Payment ID: <strong>${data.paymentId}</strong></p><p>Amount: <strong>$${data.amount}</strong></p>`,
  }),
  'payment.failed': (data) => ({
    subject: `⚠️ Payment Failed`,
    html: `<h2>Payment Failed</h2><p>Your payment for booking <strong>${data.bookingId}</strong> could not be processed. Please try again.</p>`,
  }),
};

async function sendEmail(to: string, topic: string, data: any) {
  const template = templates[topic];
  if (!template) { logger.warn({ topic }, 'No email template for topic'); return; }
  const { subject, html } = template(data);
  try {
    await transporter.sendMail({ from: FROM_ADDRESS, to, subject, html });
    logger.info({ to, topic }, 'Email sent');
  } catch (err) {
    logger.error({ err, to, topic }, 'Email send failed');
  }
}

// ── Kafka Consumer ──────────────────────────────────────────────────────────
const kafka = new Kafka({
  clientId: 'notification-service',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
  retry: { retries: 10, initialRetryTime: 3000 },
});

async function startConsumer() {
  const consumer = kafka.consumer({ groupId: 'notification-consumer' });
  await consumer.connect();
  await consumer.subscribe({
    topics: ['booking.confirmed', 'booking.cancelled', 'payment.success', 'payment.failed'],
    fromBeginning: false,
  });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      try {
        const data = JSON.parse(message.value?.toString() || '{}');
        logger.info({ topic, data }, 'Notification event received');

        // In a real system, we'd look up the user's email from the user-service
        // For now, we log the notification and send to a default address
        await sendEmail('user@eventtickets.local', topic, data);
      } catch (err) {
        logger.error({ err, topic }, 'Failed to process notification');
      }
    },
  });

  logger.info('Kafka consumer started (notification-consumer)');
}

// ── Express ─────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'healthy', service: 'notification-service', timestamp: new Date().toISOString() });
});

// Manual notification trigger (dev convenience)
app.post('/api/v1/notifications/send', async (req, res) => {
  const { to, topic, data } = req.body;
  await sendEmail(to || 'user@eventtickets.local', topic, data);
  res.json({ status: 'sent' });
});

const server = app.listen(port, async () => {
  startConsumer().catch((err) => logger.warn({ err }, 'Kafka consumer will retry'));
  logger.info({ port }, 'Notification service started');
});

process.on('SIGTERM', () => { server.close(() => process.exit(0)); });
process.on('SIGINT', () => { server.close(() => process.exit(0)); });

export default app;
