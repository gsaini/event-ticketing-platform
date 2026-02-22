import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Button, Card, CardContent } from '@ticketing/ui';
import { ROUTES } from '@ticketing/utils';

export function PaymentSuccessPage() {
  return (
    <div className="container py-16">
      <Card className="max-w-md mx-auto text-center">
        <CardContent className="p-8 space-y-6">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          <div>
            <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-muted-foreground">
              Your booking has been confirmed. You'll receive a confirmation email shortly.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Button asChild>
              <Link to={ROUTES.bookings}>View My Bookings</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to={ROUTES.events}>Browse More Events</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
