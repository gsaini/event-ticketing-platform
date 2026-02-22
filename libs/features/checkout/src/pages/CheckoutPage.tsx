import { Card, CardContent, CardHeader, CardTitle, Separator, Button } from '@ticketing/ui';
import { useCartStore } from '@ticketing/data-access';
import { formatCurrency } from '@ticketing/utils';

export function CheckoutPage() {
  const { cart } = useCartStore();

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Stripe payment integration will be implemented here.
              </p>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">
                    Demo: In production, this would show Stripe Elements for secure payment processing.
                  </p>
                </div>
                <Button className="w-full" size="lg" disabled>
                  Pay Now (Demo)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span className="text-muted-foreground">
                    {item.tierName || 'Ticket'} x {item.quantity}
                  </span>
                  <span>{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(cart.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service Fee</span>
                <span>{formatCurrency(cart.total * 0.1)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatCurrency(cart.total * 1.1)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
