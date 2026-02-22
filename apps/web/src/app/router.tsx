import { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';

// Lazy load pages
const HomePage = lazy(() => import('@ticketing/feature-events').then(m => ({ default: m.HomePage })));
const EventDiscoveryPage = lazy(() => import('@ticketing/feature-events').then(m => ({ default: m.EventDiscoveryPage })));
const EventDetailPage = lazy(() => import('@ticketing/feature-events').then(m => ({ default: m.EventDetailPage })));
const LoginPage = lazy(() => import('@ticketing/feature-auth').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('@ticketing/feature-auth').then(m => ({ default: m.RegisterPage })));
const CartPage = lazy(() => import('@ticketing/feature-cart').then(m => ({ default: m.CartPage })));
const CheckoutPage = lazy(() => import('@ticketing/feature-checkout').then(m => ({ default: m.CheckoutPage })));
const PaymentSuccessPage = lazy(() => import('@ticketing/feature-checkout').then(m => ({ default: m.PaymentSuccessPage })));
const MyBookingsPage = lazy(() => import('@ticketing/feature-booking').then(m => ({ default: m.MyBookingsPage })));
const BookingDetailPage = lazy(() => import('@ticketing/feature-booking').then(m => ({ default: m.BookingDetailPage })));
const OrganizerDashboardPage = lazy(() => import('@ticketing/feature-organizer').then(m => ({ default: m.OrganizerDashboardPage })));
const CreateEventPage = lazy(() => import('@ticketing/feature-organizer').then(m => ({ default: m.CreateEventPage })));
const AdminDashboardPage = lazy(() => import('@ticketing/feature-admin').then(m => ({ default: m.AdminDashboardPage })));
const UserManagementPage = lazy(() => import('@ticketing/feature-admin').then(m => ({ default: m.UserManagementPage })));

// Import layouts
const MainLayout = lazy(() => import('@ticketing/feature-layout').then(m => ({ default: m.MainLayout })));
const AuthLayout = lazy(() => import('@ticketing/feature-layout').then(m => ({ default: m.AuthLayout })));
const DashboardLayout = lazy(() => import('@ticketing/feature-layout').then(m => ({ default: m.DashboardLayout })));

// Import auth guards
const ProtectedRoute = lazy(() => import('@ticketing/feature-auth').then(m => ({ default: m.ProtectedRoute })));

// Loading fallback
function LoadingFallback() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

const router = createBrowserRouter([
  // Public routes with MainLayout
  {
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <MainLayout>
          <Outlet />
        </MainLayout>
      </Suspense>
    ),
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/events', element: <EventDiscoveryPage /> },
      { path: '/events/:id', element: <EventDetailPage /> },
    ],
  },

  // Auth routes with AuthLayout
  {
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <AuthLayout>
          <Outlet />
        </AuthLayout>
      </Suspense>
    ),
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },

  // Protected attendee routes
  {
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute>
          <MainLayout>
            <Outlet />
          </MainLayout>
        </ProtectedRoute>
      </Suspense>
    ),
    children: [
      { path: '/cart', element: <CartPage /> },
      { path: '/checkout', element: <CheckoutPage /> },
      { path: '/checkout/success', element: <PaymentSuccessPage /> },
      { path: '/bookings', element: <MyBookingsPage /> },
      { path: '/bookings/:id', element: <BookingDetailPage /> },
    ],
  },

  // Organizer dashboard routes
  {
    path: '/organizer',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute allowedRoles={['organizer', 'admin']}>
          <DashboardLayout role="organizer">
            <Outlet />
          </DashboardLayout>
        </ProtectedRoute>
      </Suspense>
    ),
    children: [
      { index: true, element: <OrganizerDashboardPage /> },
      { path: 'events/create', element: <CreateEventPage /> },
    ],
  },

  // Admin dashboard routes
  {
    path: '/admin',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ProtectedRoute allowedRoles={['admin']}>
          <DashboardLayout role="admin">
            <Outlet />
          </DashboardLayout>
        </ProtectedRoute>
      </Suspense>
    ),
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'users', element: <UserManagementPage /> },
    ],
  },

  // 404
  {
    path: '*',
    element: (
      <div className="flex h-screen flex-col items-center justify-center">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="mt-2 text-muted-foreground">Page not found</p>
      </div>
    ),
  },
]);

export function AppRouter() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
