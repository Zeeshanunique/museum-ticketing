"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getAllMuseums } from '@/lib/firebase';
import { importAllMuseumsData } from '@/lib/seed-database';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle, Plus } from 'lucide-react';

interface Museum {
  id: string;
  name: string;
  description: string;
  location: {
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  timings: {
    opening: string;
    closing: string;
    holidays: string[];
  };
  [key: string]: unknown;
}

interface ImportResult {
  success: boolean;
  message: string;
  details?: unknown;
  error?: unknown;
}

export default function Dashboard() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const router = useRouter();
  const { isAdmin } = useAuth();
  
  const [activeTab, setActiveTab] = useState<string>(tabParam === 'import' ? 'import' : 'museums');
  const [museums, setMuseums] = useState<Museum[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  
  // Fetch museums data from Firebase on component mount
  useEffect(() => {
    fetchMuseums();
  }, []);
  
  // Handle tab change from URL parameters
  useEffect(() => {
    if (tabParam === 'import') {
      setActiveTab('import');
    }
  }, [tabParam]);
  
  const fetchMuseums = async () => {
    setLoading(true);
    const data = await getAllMuseums();
    setMuseums(data as Museum[]);
    setLoading(false);
  };
  
  const handleImportAll = async () => {
    setImporting(true);
    setImportResult(null);
    
    try {
      const result = await importAllMuseumsData();
      setImportResult(result as ImportResult);
      
      if (result.success) {
        // Refresh museums list after import
        await fetchMuseums();
      }
    } catch (error) {
      console.error("Error during import:", error);
      setImportResult({
        success: false,
        message: "An unexpected error occurred during import"
      });
    } finally {
      setImporting(false);
    }
  };
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Museum Dashboard</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="museums">Museums</TabsTrigger>
          <TabsTrigger value="import">Database Import</TabsTrigger>
        </TabsList>
        
        <TabsContent value="museums">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <p>Loading museums data...</p>
            ) : museums.length > 0 ? (
              museums.map((museum) => (
                <Card key={museum.id}>
                  <CardHeader>
                    <CardTitle>{museum.name}</CardTitle>
                    <CardDescription>{museum.location.city}, {museum.location.state}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{museum.description}</p>
                    <div className="text-sm">
                      <strong>Address:</strong> {museum.location.address}
                    </div>
                    <div className="text-sm">
                      <strong>Timings:</strong> {museum.timings.opening} - {museum.timings.closing}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div className="text-sm text-muted-foreground">
                      ID: {museum.id}
                    </div>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center py-6">
                      No museums found in the database. Click the &quot;Import Data&quot; button in the navbar or go to the Database Import tab to import data.
                    </p>
                    <div className="flex justify-center">
                      <Button onClick={() => setActiveTab('import')}>
                        Go to Database Import
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="import">
          <Card>
            <CardHeader>
              <CardTitle>Import Museums Data</CardTitle>
              <CardDescription>
                Import museum data from data.json file to Firebase database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Click the button below to import all museums data from the data.json file into the Firebase database.
                This process may take a few seconds depending on the amount of data.
              </p>
              
              {importResult && (
                <div className={`p-4 mb-6 rounded-md ${importResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="flex items-center">
                    {importResult.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    )}
                    <span>{importResult.message}</span>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col md:flex-row gap-4">
                <Button 
                  onClick={handleImportAll} 
                  disabled={importing}
                  className="w-full md:w-auto"
                >
                  {importing ? 'Importing...' : 'Import All Museums Data'}
                </Button>
                
                {isAdmin && (
                  <Button 
                    variant="outline"
                    onClick={() => router.push('/admin')}
                    className="w-full md:w-auto flex items-center gap-2 border-green-500 text-green-600 hover:bg-green-50"
                  >
                    <Plus className="h-4 w-4" />
                    Add Individual Museum
                  </Button>
                )}
              </div>
              
              {isAdmin && (
                <div className="mt-8 p-4 bg-blue-50 rounded-md">
                  <h3 className="text-md font-semibold mb-2">Admin Features</h3>
                  <p className="mb-2">
                    As an admin, you can add individual museums with detailed information.
                  </p>
                  <Button 
                    variant="secondary"
                    onClick={() => router.push('/admin')}
                    className="mt-2"
                  >
                    Go to Admin Dashboard
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 