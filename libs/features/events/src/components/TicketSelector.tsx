import { useState } from 'react';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { Button, Card, CardContent, toast } from '@ticketing/ui';
import { formatCurrency } from '@ticketing/utils';
import { useAddToCart, useAuthStore } from '@ticketing/data-access';
import { useNavigate } from 'react-router-dom';
import type { TicketTier } from '@ticketing/types';

interface TicketSelectorProps {
  eventId: string;
  tiers: TicketTier[];
}

interface Selection {
  tierId: string;
  quantity: number;
  price: number;
}

export function TicketSelector({ eventId, tiers }: TicketSelectorProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const addToCartMutation = useAddToCart();
  const [selections, setSelections] = useState<Record<string, number>>({});

  const updateQuantity = (tierId: string, delta: number) => {
    setSelections((prev) => {
      const current = prev[tierId] || 0;
      const newQty = Math.max(0, Math.min(10, current + delta));
      if (newQty === 0) {
        const { [tierId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [tierId]: newQty };
    });
  };

  const getSubtotal = () => {
    return Object.entries(selections).reduce((sum, [tierId, qty]) => {
      const tier = tiers.find((t) => t.id === tierId);
      return sum + (tier?.price || 0) * qty;
    }, 0);
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const items = Object.entries(selections).map(([tierId, quantity]) => {
      const tier = tiers.find((t) => t.id === tierId)!;
      return { eventId, ticketTierId: tierId, quantity, price: tier.price };
    });

    try {
      for (const item of items) {
        await addToCartMutation.mutateAsync(item);
      }
      toast({ title: 'Added to cart', description: 'Tickets have been added to your cart.' });
      setSelections({});
    } catch {
      toast({
        title: 'Failed to add to cart',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const hasSelections = Object.keys(selections).length > 0;

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <h3 className="text-lg font-semibold">Select Tickets</h3>

        <div className="space-y-4">
          {tiers.map((tier) => {
            const available = tier.quantityTotal - tier.quantitySold - tier.quantityHeld;
            const isSoldOut = available <= 0;
            const quantity = selections[tier.id] || 0;

            return (
              <div
                key={tier.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <h4 className="font-medium">{tier.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {isSoldOut ? 'Sold out' : `${available} available`}
                  </p>
                  <p className="text-lg font-bold mt-1">{formatCurrency(tier.price)}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={isSoldOut || quantity === 0}
                    onClick={() => updateQuantity(tier.id, -1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={isSoldOut || quantity >= Math.min(10, available)}
                    onClick={() => updateQuantity(tier.id, 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {hasSelections && (
          <div className="pt-4 border-t space-y-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Subtotal</span>
              <span>{formatCurrency(getSubtotal())}</span>
            </div>
            <Button
              className="w-full"
              size="lg"
              onClick={handleAddToCart}
              disabled={addToCartMutation.isPending}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {addToCartMutation.isPending ? 'Adding...' : 'Add to Cart'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
