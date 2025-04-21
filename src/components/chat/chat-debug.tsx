'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Check } from "lucide-react";

export function ChatDebugger() {
  const [status, setStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
  const [results, setResults] = useState<Record<string, any>>({});
  
  const runDiagnostics = async () => {
    setStatus('checking');
    setResults({});
    
    const diagnostics: Record<string, any> = {};
    
    // Check 1: Test API
    try {
      const testResponse = await fetch('/api/test', { cache: 'no-cache' });
      if (testResponse.ok) {
        const data = await testResponse.json();
        diagnostics.test = { 
          status: 'success',
          message: 'Test API is working!',
          data
        };
      } else {
        diagnostics.test = { 
          status: 'error',
          message: `Test API returned status ${testResponse.status}`,
          error: await testResponse.text()
        };
      }
    } catch (error) {
      diagnostics.test = { 
        status: 'error',
        message: 'Could not connect to Test API endpoint',
        error: (error as Error).message
      };
    }
    
    // Check 2: Chat API
    try {
      const chatResponse = await fetch('/api/chat', { 
        method: 'GET',
        cache: 'no-cache' 
      });
      
      if (chatResponse.ok) {
        const data = await chatResponse.json();
        diagnostics.chat = { 
          status: 'success',
          message: 'Chat API health check passed!',
          data
        };
      } else {
        diagnostics.chat = { 
          status: 'error',
          message: `Chat API returned status ${chatResponse.status}`,
          error: await chatResponse.text()
        };
      }
    } catch (error) {
      diagnostics.chat = { 
        status: 'error',
        message: 'Could not connect to Chat API endpoint',
        error: (error as Error).message
      };
    }
    
    // Check 3: Chat API with simple test message
    try {
      const testMessageResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: 'test message', 
          history: [],
          language: 'en'
        }),
        cache: 'no-cache'
      });
      
      if (testMessageResponse.ok) {
        const data = await testMessageResponse.json();
        diagnostics.chatMessage = { 
          status: 'success',
          message: 'Chat API test message successful!',
          data
        };
      } else {
        diagnostics.chatMessage = { 
          status: 'error',
          message: `Chat API test message returned status ${testMessageResponse.status}`,
          error: await testMessageResponse.text()
        };
      }
    } catch (error) {
      diagnostics.chatMessage = { 
        status: 'error',
        message: 'Could not send test message to Chat API',
        error: (error as Error).message
      };
    }
    
    setResults(diagnostics);
    
    // Set overall status
    const hasErrors = Object.values(diagnostics).some(
      (check: any) => check.status === 'error'
    );
    
    setStatus(hasErrors ? 'error' : 'success');
  };
  
  return (
    <div className="p-4 border rounded-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Chat Connection Debugger</h3>
        <Button 
          onClick={runDiagnostics} 
          disabled={status === 'checking'}
          variant="outline"
          size="sm"
        >
          {status === 'checking' ? 'Running Tests...' : 'Run Diagnostics'}
        </Button>
      </div>
      
      {status !== 'idle' && (
        <div className="space-y-3 mt-4">
          {Object.entries(results).map(([key, result]: [string, any]) => (
            <Alert key={key} variant={result.status === 'success' ? 'default' : 'destructive'}>
              {result.status === 'success' ? (
                <Check className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertTitle className="ml-2">
                {key === 'test' && 'Test API'}
                {key === 'chat' && 'Chat API Health Check'}
                {key === 'chatMessage' && 'Chat API Test Message'}
              </AlertTitle>
              <AlertDescription className="ml-2">
                {result.message}
                {result.error && (
                  <div className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {result.error}
                  </div>
                )}
                {result.data && (
                  <div className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-20">
                    {JSON.stringify(result.data, null, 2)}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          ))}
          
          {status === 'success' && (
            <Alert className="bg-green-50 border-green-200">
              <Check className="h-4 w-4 text-green-500" />
              <AlertTitle className="text-green-700">All Tests Passed</AlertTitle>
              <AlertDescription className="text-green-600">
                Your chat API connection is working correctly.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
}
