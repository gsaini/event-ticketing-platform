import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Music,
  Trophy,
  Theater,
  Laugh,
  Sparkles,
  Calendar,
  MapPin,
  Star,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { Button, Skeleton, Badge } from '@ticketing/ui';
import { useFeaturedEvents } from '@ticketing/data-access';
import { ROUTES, formatDate, formatCurrency } from '@ticketing/utils';
import type { Event } from '@ticketing/types';

const categories = [
  {
    name: 'Music',
    icon: Music,
    href: '/events?genre=music',
    gradient: 'from-violet-500 to-purple-600',
    description: 'Concerts & festivals',
    hue: 270,
  },
  {
    name: 'Sports',
    icon: Trophy,
    href: '/events?genre=sports',
    gradient: 'from-amber-500 to-orange-600',
    description: 'Games & matches',
    hue: 40,
  },
  {
    name: 'Theater',
    icon: Theater,
    href: '/events?genre=theater',
    gradient: 'from-rose-500 to-pink-600',
    description: 'Shows & performances',
    hue: 350,
  },
  {
    name: 'Comedy',
    icon: Laugh,
    href: '/events?genre=comedy',
    gradient: 'from-teal-500 to-cyan-600',
    description: 'Standup & improv',
    hue: 180,
  },
];

const stats = [
  { label: 'Events Hosted', value: '10K+', icon: Calendar },
  { label: 'Happy Attendees', value: '2M+', icon: Users },
  { label: 'Cities Worldwide', value: '150+', icon: MapPin },
];

// Sample featured events for visual demonstration
const sampleEvents: Partial<Event>[] = [
  {
    id: '1',
    title: 'Summer Music Festival 2024',
    genre: 'Music',
    imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&h=400&fit=crop',
    startTime: new Date('2024-07-15T19:00:00'),
    venue: { name: 'Central Park', city: 'New York', country: 'USA' } as Event['venue'],
    ticketTiers: [{ price: 75, quantityTotal: 1000, quantitySold: 800, quantityHeld: 50 }] as Event['ticketTiers'],
  },
  {
    id: '2',
    title: 'Broadway: The Phantom',
    genre: 'Theater',
    imageUrl: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=600&h=400&fit=crop',
    startTime: new Date('2024-06-20T20:00:00'),
    venue: { name: 'Majestic Theatre', city: 'New York', country: 'USA' } as Event['venue'],
    ticketTiers: [{ price: 150, quantityTotal: 500, quantitySold: 450, quantityHeld: 20 }] as Event['ticketTiers'],
  },
  {
    id: '3',
    title: 'Championship Finals',
    genre: 'Sports',
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&h=400&fit=crop',
    startTime: new Date('2024-08-10T15:00:00'),
    venue: { name: 'Madison Square Garden', city: 'New York', country: 'USA' } as Event['venue'],
    ticketTiers: [{ price: 200, quantityTotal: 2000, quantitySold: 1500, quantityHeld: 100 }] as Event['ticketTiers'],
  },
];

function FeaturedEventCard({ event, index }: { event: Partial<Event>; index: number }) {
  const lowestPrice = event.ticketTiers?.[0]?.price || 0;
  const delayClass = `stagger-${Math.min(index + 2, 8)}`;

  return (
    <Link
      to={ROUTES.eventDetail(event.id || '')}
      className={`group relative block overflow-hidden rounded-2xl bg-card shadow-lg transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 animate-fade-in-up ${delayClass}`}
    >
      {/* Image Container */}
      <div className="aspect-[4/3] overflow-hidden">
        <div
          className="h-full w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
          style={{ backgroundImage: `url(${event.imageUrl})` }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>

      {/* Genre Badge */}
      <Badge className="absolute top-4 left-4 bg-white/90 text-foreground backdrop-blur-sm border-0 shadow-md">
        {event.genre}
      </Badge>

      {/* Content Overlay */}
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
            {event.startTime ? formatDate(event.startTime) : 'TBA'}
          </span>
          {event.venue && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {event.venue.city}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold">From {formatCurrency(lowestPrice)}</span>
          <span className="flex items-center gap-1 text-sm opacity-0 translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
            Get Tickets <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 rounded-2xl ring-2 ring-primary/0 transition-all duration-300 group-hover:ring-primary/50" />
    </Link>
  );
}

function CategoryCard({
  category,
  index,
}: {
  category: (typeof categories)[0];
  index: number;
}) {
  const Icon = category.icon;
  const delayClass = `stagger-${Math.min(index + 1, 8)}`;

  return (
    <Link
      to={category.href}
      className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-500 hover:shadow-xl hover:-translate-y-1 animate-fade-in-up ${delayClass}`}
      style={{
        background: `linear-gradient(135deg, oklch(98% 0.02 ${category.hue}) 0%, oklch(95% 0.04 ${category.hue}) 100%)`,
      }}
    >
      {/* Decorative Circle */}
      <div
        className={`absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${category.gradient} opacity-20 blur-2xl transition-all duration-500 group-hover:opacity-40 group-hover:scale-150`}
      />

      {/* Icon Container */}
      <div
        className={`relative mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${category.gradient} text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
      >
        <Icon className="h-7 w-7" />
      </div>

      {/* Content */}
      <h3 className="relative text-xl font-bold text-foreground mb-1">{category.name}</h3>
      <p className="relative text-sm text-muted-foreground">{category.description}</p>

      {/* Arrow */}
      <div className="absolute bottom-6 right-6 opacity-0 translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
        <ArrowRight className="h-5 w-5 text-muted-foreground" />
      </div>
    </Link>
  );
}

export function HomePage() {
  const { data, isLoading } = useFeaturedEvents();
  const events = data?.events?.length ? data.events : sampleEvents;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 -z-10">
          {/* Gradient Base */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-background to-rose-50" />

          {/* Animated Blobs */}
          <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-violet-200/50 blur-3xl animate-blob" />
          <div
            className="absolute top-40 right-20 h-96 w-96 rounded-full bg-rose-200/40 blur-3xl animate-blob"
            style={{ animationDelay: '2s' }}
          />
          <div
            className="absolute -bottom-20 left-1/3 h-80 w-80 rounded-full bg-amber-200/30 blur-3xl animate-blob"
            style={{ animationDelay: '4s' }}
          />

          {/* Subtle Grid Pattern */}
          <div
            className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="container py-24 md:py-32 lg:py-40">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="max-w-2xl">
              {/* Eyebrow */}
              <div className="animate-fade-in-up stagger-1 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-6">
                <Sparkles className="h-4 w-4" />
                <span>Discover unforgettable experiences</span>
              </div>

              {/* Headline */}
              <h1 className="animate-fade-in-up stagger-2 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl mb-6">
                Find Your Next{' '}
                <span className="gradient-text">Amazing</span>{' '}
                Experience
              </h1>

              {/* Subheadline */}
              <p className="animate-fade-in-up stagger-3 text-xl text-muted-foreground mb-8 max-w-lg">
                From sold-out concerts to intimate theater performances. Book tickets to the events that move you.
              </p>

              {/* CTA Buttons */}
              <div className="animate-fade-in-up stagger-4 flex flex-wrap gap-4 mb-12">
                <Button
                  size="lg"
                  className="h-14 px-8 text-base shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
                  asChild
                >
                  <Link to={ROUTES.events}>
                    Explore Events
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 text-base" asChild>
                  <Link to={ROUTES.register}>Create Account</Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="animate-fade-in-up stagger-5 flex flex-wrap gap-8">
                {stats.map((stat) => (
                  <div key={stat.label} className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <stat.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Featured Event Cards Stack */}
            <div className="relative hidden lg:block">
              <div className="relative h-[500px]">
                {/* Floating Cards */}
                <div className="absolute top-0 right-0 w-72 animate-float">
                  <div className="overflow-hidden rounded-2xl bg-card shadow-2xl">
                    <div
                      className="h-40 bg-cover bg-center"
                      style={{
                        backgroundImage:
                          'url(https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400&h=300&fit=crop)',
                      }}
                    />
                    <div className="p-4">
                      <Badge className="mb-2">Music</Badge>
                      <h4 className="font-semibold">Electronic Nights</h4>
                      <p className="text-sm text-muted-foreground">Tonight at 9PM</p>
                    </div>
                  </div>
                </div>

                <div className="absolute top-32 left-0 w-64 animate-float-delayed">
                  <div className="overflow-hidden rounded-2xl bg-card shadow-2xl">
                    <div
                      className="h-36 bg-cover bg-center"
                      style={{
                        backgroundImage:
                          'url(https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=400&h=300&fit=crop)',
                      }}
                    />
                    <div className="p-4">
                      <Badge variant="secondary" className="mb-2">
                        Theater
                      </Badge>
                      <h4 className="font-semibold">Romeo & Juliet</h4>
                      <p className="text-sm text-muted-foreground">Classic revival</p>
                    </div>
                  </div>
                </div>

                <div
                  className="absolute bottom-0 right-12 w-60 animate-float"
                  style={{ animationDelay: '0.5s' }}
                >
                  <div className="overflow-hidden rounded-2xl bg-card shadow-2xl">
                    <div
                      className="h-32 bg-cover bg-center"
                      style={{
                        backgroundImage:
                          'url(https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=300&fit=crop)',
                      }}
                    />
                    <div className="p-4">
                      <Badge variant="outline" className="mb-2 border-amber-500 text-amber-600">
                        Sports
                      </Badge>
                      <h4 className="font-semibold">Championship Game</h4>
                      <p className="text-sm text-muted-foreground">Limited seats</p>
                    </div>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-20 left-20 h-20 w-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 opacity-80 blur-sm" />
                <div className="absolute bottom-32 right-32 h-16 w-16 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 opacity-80 blur-sm" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl mb-4">Explore by Category</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Whatever your passion, we've got the perfect event waiting for you
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <CategoryCard key={category.name} category={category} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-muted/50 to-background">
        <div className="container">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
            <div className="animate-fade-in-up">
              <div className="flex items-center gap-2 text-primary mb-2">
                <TrendingUp className="h-5 w-5" />
                <span className="text-sm font-medium uppercase tracking-wider">Trending Now</span>
              </div>
              <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">Featured Events</h2>
            </div>
            <Button variant="outline" className="animate-fade-in-up stagger-1 self-start sm:self-auto" asChild>
              <Link to={ROUTES.events}>
                View All Events
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(events as Partial<Event>[]).slice(0, 3).map((event, index) => (
                <FeaturedEventCard key={event.id} event={event} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-12 md:p-16 lg:p-20 animate-fade-in-up">
            {/* Background Decoration */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
              />
            </div>

            <div className="relative grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white mb-6">
                  <Zap className="h-4 w-4" />
                  <span>For Event Organizers</span>
                </div>

                <h2 className="text-4xl font-bold text-white sm:text-5xl mb-6">
                  Ready to Host Your Own Event?
                </h2>

                <p className="text-lg text-white/80 mb-8 max-w-lg">
                  Join thousands of organizers who trust us to bring their events to life. Powerful tools, beautiful
                  pages, and seamless ticketing.
                </p>

                <div className="flex flex-wrap gap-4">
                  <Button
                    size="lg"
                    className="h-14 px-8 text-base bg-white text-violet-600 hover:bg-white/90 shadow-lg"
                    asChild
                  >
                    <Link to={ROUTES.register}>
                      Start for Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 px-8 text-base border-white/30 text-white hover:bg-white/10"
                    asChild
                  >
                    <Link to={ROUTES.events}>Learn More</Link>
                  </Button>
                </div>
              </div>

              {/* Feature List */}
              <div className="grid gap-4">
                {[
                  { icon: Star, title: 'Beautiful Event Pages', desc: 'Stunning, customizable pages that convert' },
                  { icon: Users, title: 'Attendee Management', desc: 'Easy check-in and communication tools' },
                  { icon: TrendingUp, title: 'Real-time Analytics', desc: 'Track sales and engagement instantly' },
                ].map((feature) => (
                  <div
                    key={feature.title}
                    className="flex items-start gap-4 rounded-2xl bg-white/10 backdrop-blur-sm p-5 transition-colors hover:bg-white/20"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{feature.title}</h4>
                      <p className="text-sm text-white/70">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-12 border-t border-border">
        <div className="container">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-center text-muted-foreground">
            <span className="text-sm font-medium uppercase tracking-wider">Trusted by event-goers worldwide</span>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
              ))}
              <span className="ml-2 font-semibold text-foreground">4.9/5</span>
              <span className="ml-1">from 10,000+ reviews</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
