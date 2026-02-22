import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, X } from 'lucide-react';
import { Input, Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Badge } from '@ticketing/ui';
import { useEvents } from '@ticketing/data-access';
import { EVENT_GENRES } from '@ticketing/utils';
import { EventGrid } from '../components/EventGrid';

export function EventDiscoveryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  const genre = searchParams.get('genre') || undefined;
  const status = 'published';

  const { data, isLoading } = useEvents({ genre, status, limit: 20 });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery) {
      setSearchParams({ ...Object.fromEntries(searchParams), q: searchQuery });
    } else {
      searchParams.delete('q');
      setSearchParams(searchParams);
    }
  };

  const handleGenreChange = (value: string) => {
    if (value === 'all') {
      searchParams.delete('genre');
    } else {
      searchParams.set('genre', value);
    }
    setSearchParams(searchParams);
  };

  const clearFilters = () => {
    setSearchParams({});
    setSearchQuery('');
  };

  const hasFilters = genre || searchQuery;

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Discover Events</h1>
        <p className="text-muted-foreground">Find your next unforgettable experience</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit">Search</Button>
        </form>

        <div className="flex gap-2">
          <Select value={genre || 'all'} onValueChange={handleGenreChange}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {EVENT_GENRES.map((g) => (
                <SelectItem key={g} value={g}>
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2 mb-6">
          {genre && (
            <Badge variant="secondary" className="gap-1">
              {genre}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleGenreChange('all')}
              />
            </Badge>
          )}
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              Search: {searchQuery}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  setSearchQuery('');
                  searchParams.delete('q');
                  setSearchParams(searchParams);
                }}
              />
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear all
          </Button>
        </div>
      )}

      {/* Results Count */}
      {data && (
        <p className="text-sm text-muted-foreground mb-4">
          {data.total} event{data.total !== 1 ? 's' : ''} found
        </p>
      )}

      {/* Events Grid */}
      <EventGrid events={data?.events || []} isLoading={isLoading} />
    </div>
  );
}
