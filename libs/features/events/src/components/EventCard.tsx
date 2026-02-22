import { Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight, Ticket } from 'lucide-react';
import { Card, CardContent, Badge } from '@ticketing/ui';
import { formatDate, formatCurrency, ROUTES } from '@ticketing/utils';
import type { Event } from '@ticketing/types';

interface EventCardProps {
  event: Event;
  variant?: 'default' | 'compact' | 'featured';
}

export function EventCard({ event, variant = 'default' }: EventCardProps) {
  const lowestPrice = Math.min(...event.ticketTiers.map((t) => t.price));
  const totalAvailable = event.ticketTiers.reduce(
    (sum, t) => sum + (t.quantityTotal - t.quantitySold - t.quantityHeld),
    0
  );
  const isSoldOut = totalAvailable <= 0;
  const isLowStock = totalAvailable > 0 && totalAvailable < 50;

  if (variant === 'featured') {
    return (
      <Link to={ROUTES.eventDetail(event.id)} className="group block">
        <Card className="overflow-hidden border-0 bg-transparent shadow-none h-full">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
            {event.imageUrl ? (
              <img
                src={event.imageUrl}
                alt={event.title}
                className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/20 to-primary/5 text-muted-foreground">
                <Ticket className="h-16 w-16 opacity-50" />
              </div>
            )}
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              {event.genre && (
                <Badge className="bg-white/90 text-foreground backdrop-blur-sm border-0 shadow-md">
                  {event.genre}
                </Badge>
              )}
              {isLowStock && !isSoldOut && (
                <Badge className="bg-amber-500 text-white border-0 shadow-md">Few Left</Badge>
              )}
              {isSoldOut && (
                <Badge variant="destructive" className="shadow-md">
                  Sold Out
                </Badge>
              )}
            </div>

            {/* Content overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h3
                className="text-xl font-bold mb-2 line-clamp-2 tracking-tight"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {event.title}
              </h3>

              <div className="flex items-center gap-4 text-sm text-white/80 mb-4">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {formatDate(event.startTime)}
                </span>
                {event.venue && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {event.venue.city}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-lg font-bold">
                  {isSoldOut ? 'Sold Out' : `From ${formatCurrency(lowestPrice)}`}
                </span>
                <span className="flex items-center gap-1 text-sm opacity-0 translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                  Get Tickets <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link to={ROUTES.eventDetail(event.id)} className="group block">
        <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 h-full">
          <div className="flex gap-4 p-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
              {event.imageUrl ? (
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-muted text-muted-foreground">
                  <Ticket className="h-8 w-8" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                {event.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">{formatDate(event.startTime)}</p>
              <p className="text-sm font-medium mt-2">
                {isSoldOut ? (
                  <span className="text-destructive">Sold Out</span>
                ) : (
                  `From ${formatCurrency(lowestPrice)}`
                )}
              </p>
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  // Default variant
  return (
    <Link to={ROUTES.eventDetail(event.id)} className="group block">
      <Card className="overflow-hidden transition-all duration-500 hover:shadow-xl hover:-translate-y-1 h-full border-0 shadow-md">
        <div className="aspect-[16/10] relative overflow-hidden">
          {event.imageUrl ? (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-muted to-muted/50 text-muted-foreground">
              <Ticket className="h-12 w-12 opacity-50" />
            </div>
          )}

          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {event.genre && (
              <Badge className="bg-white/95 text-foreground backdrop-blur-sm border-0 shadow-sm text-xs">
                {event.genre}
              </Badge>
            )}
          </div>

          {isSoldOut && (
            <Badge variant="destructive" className="absolute top-3 right-3 shadow-sm">
              Sold Out
            </Badge>
          )}

          {isLowStock && !isSoldOut && (
            <Badge className="absolute top-3 right-3 bg-amber-500 text-white border-0 shadow-sm text-xs">
              Few Left
            </Badge>
          )}
        </div>

        <CardContent className="p-5">
          <h3
            className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors duration-300"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {event.title}
          </h3>

          <div className="mt-3 space-y-1.5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 shrink-0" />
              <span>{formatDate(event.startTime)}</span>
            </div>

            {event.venue && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="line-clamp-1">
                  {event.venue.name}, {event.venue.city}
                </span>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
            <span className="text-lg font-bold">
              {isSoldOut ? (
                <span className="text-muted-foreground">Sold Out</span>
              ) : (
                `From ${formatCurrency(lowestPrice)}`
              )}
            </span>

            <span className="flex items-center gap-1 text-sm text-primary font-medium opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
              View <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
