import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@ticketing/ui';

export function CreateEventPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Create Event</h1>

      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
          <CardDescription>Fill in the details for your new event.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Event creation form will be implemented here with multi-step wizard.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Features: Basic details, Date/Time, Venue selection, Ticket tiers, Image upload.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
