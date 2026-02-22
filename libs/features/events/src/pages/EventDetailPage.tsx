import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, ArrowLeft, Share2 } from 'lucide-react';
import { Button, Badge, Skeleton, Separator } from '@ticketing/ui';
import { useEvent } from '@ticketing/data-access';
import { formatDate, formatTime, ROUTES } from '@ticketing/utils';
import { TicketSelector } from '../components/TicketSelector';

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: event, isLoading, error } = useEvent(id!);

  if (isLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-8 w-32 mb-4" />
        <Skeleton className="aspect-[21/9] w-full rounded-lg mb-8" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-2">Event not found</h1>
          <p className="text-muted-foreground mb-4">
            The event you're looking for doesn't exist or has been removed.
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
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-4">
        <Link to={ROUTES.events}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Link>
      </Button>

      {/* Hero Image */}
      <div className="aspect-[21/9] relative rounded-lg overflow-hidden bg-muted mb-8">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Calendar className="h-24 w-24 text-muted-foreground" />
          </div>
        )}
        {event.genre && (
          <Badge className="absolute top-4 left-4" variant="secondary">
            {event.genre}
          </Badge>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Event Details */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
            {event.status === 'cancelled' && (
              <Badge variant="destructive" className="mb-4">Cancelled</Badge>
            )}
          </div>

          <div className="flex flex-wrap gap-6 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <span>{formatDate(event.startTime)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span>{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
            </div>
            {event.venue && (
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span>{event.venue.name}, {event.venue.city}</span>
              </div>
            )}
          </div>

          <Separator />

          <div>
            <h2 className="text-xl font-semibold mb-4">About this event</h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              {event.description ? (
                <p className="whitespace-pre-wrap">{event.description}</p>
              ) : (
                <p className="text-muted-foreground">No description available.</p>
              )}
            </div>
          </div>

          {event.venue && (
            <>
              <Separator />
              <div>
                <h2 className="text-xl font-semibold mb-4">Venue</h2>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium">{event.venue.name}</h3>
                  <p className="text-muted-foreground">{event.venue.address}</p>
                  <p className="text-muted-foreground">{event.venue.city}, {event.venue.country}</p>
                </div>
              </div>
            </>
          )}

          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>

        {/* Ticket Selector */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          {event.status === 'published' ? (
            <TicketSelector eventId={event.id} tiers={event.ticketTiers} />
          ) : (
            <div className="p-6 border rounded-lg text-center">
              <p className="text-muted-foreground">
                Tickets are not available for this event.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
