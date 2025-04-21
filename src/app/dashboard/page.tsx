"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Dashboard from '@/components/dashboard/Dashboard';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <p className="text-center">Loading...</p>
      </div>
    );
  }
  
  if (!user) {
    return null; // This will be redirected by useEffect
  }
  
  return <Dashboard />;
} 