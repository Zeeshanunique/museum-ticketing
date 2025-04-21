"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AddMuseumForm from '@/components/admin/AddMuseumForm';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';

export default function AdminPage() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (!isAdmin) {
        // User is logged in but not an admin
        router.push('/dashboard');
      } else {
        setAuthorized(true);
      }
    }
  }, [user, loading, isAdmin, router]);
  
  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <p className="text-center">Loading...</p>
      </div>
    );
  }
  
  if (!authorized) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center gap-2 py-8">
              <ShieldAlert className="h-12 w-12 text-destructive" />
              <h2 className="text-xl font-bold">Access Denied</h2>
              <p className="text-muted-foreground">
                You do not have permission to access this page
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid gap-6">
        <AddMuseumForm />
      </div>
    </div>
  );
} 