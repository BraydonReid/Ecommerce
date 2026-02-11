'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import RealDashboard from './real-dashboard';

function DashboardContent() {
  const searchParams = useSearchParams();
  const shop = searchParams?.get('shop');

  return <RealDashboard shop={shop || undefined} />;
}

export default function Dashboard() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
