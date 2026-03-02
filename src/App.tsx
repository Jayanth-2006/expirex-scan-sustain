import React, { useState } from 'react';
import { 
  createRouter, 
  createRoute, 
  createRootRoute, 
  RouterProvider, 
  Link, 
  Outlet, 
  useNavigate 
} from '@tanstack/react-router';
import { Toaster } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import LandingPage from '@/pages/LandingPage';
import Dashboard from '@/pages/Dashboard';
import ScanPage from '@/pages/ScanPage';
import HistoryPage from '@/pages/HistoryPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import Navbar from '@/components/layout/Navbar';
import { Spinner } from '@/components/ui/spinner';

const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Outlet />
      <Toaster position="top-right" toastOptions={{
        className: 'glass-card text-foreground',
        duration: 4000,
      }} />
    </div>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: AppContent,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: Dashboard,
});

const scanRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/scan',
  component: ScanPage,
});

const historyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/history',
  component: HistoryPage,
});

const analyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/analytics',
  component: AnalyticsPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  dashboardRoute,
  scanRoute,
  historyRoute,
  analyticsRoute,
]);

const router = createRouter({ routeTree });

function AppContent() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="w-8 h-8 text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen">
      <Navbar />
      <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
        <Outlet />
      </main>
    </div>
  );
}

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
