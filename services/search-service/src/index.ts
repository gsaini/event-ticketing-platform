import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { Client } from '@elastic/elasticsearch';
import { Kafka, Consumer } from 'kafkajs';
import pino from 'pino';

const logger = pino({ level: process.env.LOG_LEVEL || 'info', base: { service: 'search-service' } });
const app = express();
const port = parseInt(process.env.PORT || '3005', 10);

// ── Elasticsearch ───────────────────────────────────────────────────────────
const esClient = new Client({ node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200' });

const INDEX_NAME = 'events';
const INDEX_MAPPING = {
  mappings: {
    properties: {
      title: { type: 'text' as const, analyzer: 'standard', fields: { keyword: { type: 'keyword' as const } } },
      description: { type: 'text' as const },
      genre: { type: 'keyword' as const },
      status: { type: 'keyword' as const },
      city: { type: 'keyword' as const },
      start_time: { type: 'date' as const },
      end_time: { type: 'date' as const },
      location: { type: 'geo_point' as const },
      min_price: { type: 'float' as const },
      max_price: { type: 'float' as const },
      tiers: {
        type: 'nested' as const,
        properties: {
          name: { type: 'keyword' as const },
          price: { type: 'float' as const },
          quantity_total: { type: 'integer' as const },
        },
      },
    },
  },
};

async function ensureIndex() {
  const exists = await esClient.indices.exists({ index: INDEX_NAME });
  if (!exists) {
    await esClient.indices.create({ index: INDEX_NAME, body: INDEX_MAPPING });
    logger.info('Elasticsearch index created');
  }
}

// ── Kafka Consumer (Indexer) ────────────────────────────────────────────────
const kafka = new Kafka({
  clientId: 'search-service',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
  retry: { retries: 10, initialRetryTime: 3000 },
});

let consumer: Consumer;

async function startConsumer() {
  consumer = kafka.consumer({ groupId: 'search-indexer' });
  await consumer.connect();
  await consumer.subscribe({ topics: ['event.created', 'event.updated', 'event.published', 'event.cancelled'], fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      try {
        const data = JSON.parse(message.value?.toString() || '{}');
        const eventId = data.event_id || data.eventId;
        if (!eventId) return;

        if (topic === 'event.cancelled') {
          await esClient.delete({ index: INDEX_NAME, id: eventId }).catch(() => {});
          logger.info({ eventId }, 'Event removed from index');
        } else {
          await esClient.index({
            index: INDEX_NAME,
            id: eventId,
            body: {
              title: data.title,
              genre: data.genre,
              city: data.city,
              status: data.status,
              start_time: data.start_time,
              end_time: data.end_time,
              tiers: data.tiers || [],
              min_price: data.tiers?.length ? Math.min(...data.tiers.map((t: any) => t.price)) : null,
              max_price: data.tiers?.length ? Math.max(...data.tiers.map((t: any) => t.price)) : null,
            },
          });
          logger.info({ eventId, topic }, 'Event indexed');
        }
      } catch (err) {
        logger.error({ err, topic }, 'Failed to process message');
      }
    },
  });
  logger.info('Kafka consumer started');
}

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'healthy', service: 'search-service' });
});

// ── Search Routes ───────────────────────────────────────────────────────────
app.get('/api/v1/search/events', async (req, res) => {
  try {
    const { q, genre, city, min_price, max_price, from_date, to_date, limit = '20', offset = '0' } = req.query;

    const must: any[] = [];
    const filter: any[] = [];

    if (q) must.push({ multi_match: { query: q as string, fields: ['title^3', 'description'], fuzziness: 'AUTO' } });
    if (genre) filter.push({ term: { genre } });
    if (city) filter.push({ term: { city } });
    if (min_price || max_price) {
      const range: any = {};
      if (min_price) range.gte = parseFloat(min_price as string);
      if (max_price) range.lte = parseFloat(max_price as string);
      filter.push({ range: { min_price: range } });
    }
    if (from_date || to_date) {
      const range: any = {};
      if (from_date) range.gte = from_date;
      if (to_date) range.lte = to_date;
      filter.push({ range: { start_time: range } });
    }

    filter.push({ term: { status: 'published' } });

    const body: any = {
      query: { bool: { must: must.length ? must : [{ match_all: {} }], filter } },
      sort: [{ start_time: 'asc' }],
      from: parseInt(offset as string, 10),
      size: parseInt(limit as string, 10),
    };

    const result = await esClient.search({ index: INDEX_NAME, body });
    const hits = result.hits.hits.map((h: any) => ({ id: h._id, score: h._score, ...h._source }));

    res.json({
      events: hits,
      total: typeof result.hits.total === 'number' ? result.hits.total : result.hits.total?.value || 0,
    });
  } catch (err) {
    logger.error({ err }, 'Search failed');
    res.status(500).json({ error: 'Search failed' });
  }
});

app.get('/api/v1/search/suggest', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) { res.json({ suggestions: [] }); return; }

    const result = await esClient.search({
      index: INDEX_NAME,
      body: {
        query: { match_phrase_prefix: { title: { query: q as string, max_expansions: 10 } } },
        _source: ['title', 'genre', 'start_time'],
        size: 5,
      },
    });

    res.json({ suggestions: result.hits.hits.map((h: any) => ({ id: h._id, ...h._source })) });
  } catch (err) {
    res.status(500).json({ error: 'Suggestion failed' });
  }
});

// ── Start ───────────────────────────────────────────────────────────────────
async function start() {
  await ensureIndex();
  startConsumer().catch((err) => logger.warn({ err }, 'Kafka consumer will retry'));

  app.listen(port, () => logger.info({ port }, 'Search service started'));
}

start();
