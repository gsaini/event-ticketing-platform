import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, LogOut, Calendar, Settings, Ticket, Menu, X } from 'lucide-react';
import { useState } from 'react';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Avatar,
  AvatarFallback,
  Badge,
} from '@ticketing/ui';
import { useAuthStore, useLogout, useCartStore } from '@ticketing/data-access';
import { getInitials, ROUTES } from '@ticketing/utils';

export function Header() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { getItemCount } = useCartStore();
  const logoutMutation = useLogout();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const itemCount = getItemCount();

  const handleLogout = () => {
    logoutMutation.mutate();
    navigate(ROUTES.home);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-18 items-center justify-between py-4">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link to={ROUTES.home} className="group flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 shadow-lg shadow-violet-500/25 transition-shadow group-hover:shadow-violet-500/40">
              <Ticket className="h-5 w-5 text-white" />
            </div>
            <span
              className="text-xl font-bold tracking-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              EventTix
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to={ROUTES.events}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
            >
              Browse Events
            </Link>
            <Link
              to="/events?featured=true"
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
            >
              Featured
            </Link>
            <Link
              to="/events?genre=music"
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
            >
              Music
            </Link>
            <Link
              to="/events?genre=sports"
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
            >
              Sports
            </Link>
          </nav>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Search Button */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:flex h-10 w-10 rounded-xl hover:bg-muted"
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Cart */}
          {isAuthenticated && (
            <Link to={ROUTES.cart}>
              <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl hover:bg-muted">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-lg">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </Button>
            </Link>
          )}

          {/* User Menu / Auth Buttons */}
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-xl p-0 hover:bg-muted">
                  <Avatar className="h-10 w-10 rounded-xl">
                    <AvatarFallback className="rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white font-medium">
                      {getInitials(user.firstName, user.lastName)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 rounded-xl p-2">
                <DropdownMenuLabel className="px-3 py-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem
                  onClick={() => navigate(ROUTES.bookings)}
                  className="rounded-lg px-3 py-2 cursor-pointer"
                >
                  <Calendar className="mr-3 h-4 w-4" />
                  My Bookings
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate(ROUTES.profile)}
                  className="rounded-lg px-3 py-2 cursor-pointer"
                >
                  <User className="mr-3 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                {(user.role === 'organizer' || user.role === 'admin') && (
                  <>
                    <DropdownMenuSeparator className="my-1" />
                    <DropdownMenuItem
                      onClick={() => navigate(ROUTES.organizerDashboard)}
                      className="rounded-lg px-3 py-2 cursor-pointer"
                    >
                      <Settings className="mr-3 h-4 w-4" />
                      Organizer Dashboard
                    </DropdownMenuItem>
                  </>
                )}
                {user.role === 'admin' && (
                  <DropdownMenuItem
                    onClick={() => navigate(ROUTES.adminDashboard)}
                    className="rounded-lg px-3 py-2 cursor-pointer"
                  >
                    <Settings className="mr-3 h-4 w-4" />
                    Admin Panel
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="rounded-lg px-3 py-2 cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" className="h-10 px-4 rounded-xl" asChild>
                <Link to={ROUTES.login}>Sign In</Link>
              </Button>
              <Button className="h-10 px-5 rounded-xl shadow-lg shadow-primary/25" asChild>
                <Link to={ROUTES.register}>Get Started</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-10 w-10 rounded-xl"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl">
          <nav className="container py-4 space-y-1">
            <Link
              to={ROUTES.events}
              className="block px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all"
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse Events
            </Link>
            <Link
              to="/events?featured=true"
              className="block px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all"
              onClick={() => setMobileMenuOpen(false)}
            >
              Featured
            </Link>
            <Link
              to="/events?genre=music"
              className="block px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all"
              onClick={() => setMobileMenuOpen(false)}
            >
              Music
            </Link>
            <Link
              to="/events?genre=sports"
              className="block px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sports
            </Link>

            {!isAuthenticated && (
              <div className="pt-4 space-y-2">
                <Button variant="outline" className="w-full h-12 rounded-xl" asChild>
                  <Link to={ROUTES.login} onClick={() => setMobileMenuOpen(false)}>
                    Sign In
                  </Link>
                </Button>
                <Button className="w-full h-12 rounded-xl" asChild>
                  <Link to={ROUTES.register} onClick={() => setMobileMenuOpen(false)}>
                    Get Started
                  </Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
