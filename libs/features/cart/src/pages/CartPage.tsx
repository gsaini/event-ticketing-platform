import { Link } from 'react-router-dom';
import { ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { Button, Card, CardContent, Separator, Skeleton } from '@ticketing/ui';
import { useCart, useRemoveFromCart, useCartStore } from '@ticketing/data-access';
import { formatCurrency, ROUTES } from '@ticketing/utils';

export function CartPage() {
  const { data: cart, isLoading } = useCart();
  const { cart: localCart } = useCartStore();
  const removeFromCartMutation = useRemoveFromCart();

  const displayCart = cart || localCart;

  if (isLoading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!displayCart?.items?.length) {
    return (
      <div className="container py-8">
        <div className="text-center py-16">
          <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">
            Looks like you haven't added any tickets yet.
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
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {displayCart.items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{item.eventTitle || 'Event Ticket'}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.tierName || 'Ticket'} x {item.quantity}
                  </p>
                  <p className="font-medium mt-1">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFromCartMutation.mutate(item.id)}
                  disabled={removeFromCartMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-semibold">Order Summary</h3>
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(displayCart.total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Service Fee</span>
                  <span>{formatCurrency(displayCart.total * 0.1)}</span>
                </div>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatCurrency(displayCart.total * 1.1)}</span>
              </div>
              <Button className="w-full" size="lg" asChild>
                <Link to={ROUTES.checkout}>
                  Checkout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
