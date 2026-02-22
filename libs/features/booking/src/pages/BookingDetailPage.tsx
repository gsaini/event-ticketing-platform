import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Ticket } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Skeleton, Separator } from '@ticketing/ui';
import { useBooking } from '@ticketing/data-access';
import { formatDateTime, formatCurrency, ROUTES, BOOKING_STATUS_LABELS } from '@ticketing/utils';

export function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: booking, isLoading, error } = useBooking(id!);

  if (isLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-8 w-32 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Booking not found</h1>
        <Button asChild className="mt-4">
          <Link to={ROUTES.bookings}>Back to Bookings</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-2xl">
      <Button variant="ghost" asChild className="mb-4">
        <Link to={ROUTES.bookings}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Bookings
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Booking Details</CardTitle>
              <p className="text-sm text-muted-foreground">#{booking.id.slice(0, 8)}</p>
            </div>
            <Badge variant={booking.status === 'confirmed' ? 'success' : 'secondary'}>
              {BOOKING_STATUS_LABELS[booking.status]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Booked on</p>
              <p className="font-medium">{formatDateTime(booking.createdAt)}</p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-4">Tickets ({booking.tickets.length})</h3>
            <div className="grid gap-4">
              {booking.tickets.map((ticket) => (
                <Card key={ticket.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Ticket className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Ticket #{ticket.id.slice(0, 8)}</p>
                          <p className="text-sm text-muted-foreground">
                            Status: {ticket.status}
                          </p>
                        </div>
                      </div>
                      {booking.status === 'confirmed' && (
                        <div className="p-2 bg-white rounded">
                          <QRCodeSVG value={ticket.qrCode} size={64} />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(booking.totalAmount - booking.discountAmount)}</span>
            </div>
            {booking.discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-{formatCurrency(booking.discountAmount)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatCurrency(booking.totalAmount)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
