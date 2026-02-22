import { Link } from 'react-router-dom';
import { Calendar, Ticket } from 'lucide-react';
import { Card, CardContent, Badge, Skeleton, Button } from '@ticketing/ui';
import { useMyBookings } from '@ticketing/data-access';
import { formatDateTime, formatCurrency, ROUTES, BOOKING_STATUS_LABELS } from '@ticketing/utils';

export function MyBookingsPage() {
  const { data, isLoading } = useMyBookings();

  if (isLoading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">My Bookings</h1>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!data?.bookings?.length) {
    return (
      <div className="container py-8">
        <div className="text-center py-16">
          <Ticket className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">No bookings yet</h1>
          <p className="text-muted-foreground mb-6">
            When you book tickets, they'll appear here.
          </p>
          <Button asChild>
            <Link to={ROUTES.events}>Browse Events</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">My Bookings</h1>

      <div className="space-y-4">
        {data.bookings.map((booking) => (
          <Link key={booking.id} to={ROUTES.bookingDetail(booking.id)}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Booking #{booking.id.slice(0, 8)}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatDateTime(booking.createdAt)}
                      </p>
                      <p className="text-sm">
                        {booking.tickets.length} ticket{booking.tickets.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={booking.status === 'confirmed' ? 'success' : 'secondary'}>
                      {BOOKING_STATUS_LABELS[booking.status]}
                    </Badge>
                    <p className="text-lg font-bold mt-2">
                      {formatCurrency(booking.totalAmount)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
