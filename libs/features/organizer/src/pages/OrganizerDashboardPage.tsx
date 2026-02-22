import { Link } from 'react-router-dom';
import { Plus, Calendar, DollarSign, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, Skeleton } from '@ticketing/ui';
import { useMyEvents } from '@ticketing/data-access';
import { formatCurrency, ROUTES } from '@ticketing/utils';

export function OrganizerDashboardPage() {
  const { data, isLoading } = useMyEvents();

  const stats = [
    { label: 'Total Events', value: data?.events?.length || 0, icon: Calendar },
    { label: 'Total Revenue', value: formatCurrency(12500), icon: DollarSign },
    { label: 'Tickets Sold', value: 342, icon: Users },
    { label: 'Conversion Rate', value: '68%', icon: TrendingUp },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your event overview.</p>
        </div>
        <Button asChild>
          <Link to={ROUTES.createEvent}>
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Events</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : data?.events?.length ? (
            <div className="space-y-4">
              {data.events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h3 className="font-semibold">{event.title}</h3>
                    <p className="text-sm text-muted-foreground">{event.status}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Manage
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No events yet</p>
              <Button asChild>
                <Link to={ROUTES.createEvent}>Create Your First Event</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
