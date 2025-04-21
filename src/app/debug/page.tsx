'use client';

import { ChatDebugger } from "@/components/chat/chat-debug";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function DebugPage() {
  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl">
      <div className="mb-6">
        <Link href="/">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Museum Chatbot Diagnostics</CardTitle>
          <CardDescription>
            Use this page to troubleshoot issues with the chatbot connection.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Connection Status</h3>
              <ChatDebugger />
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Setup Instructions</h3>
              <div className="bg-gray-50 p-4 rounded-md space-y-3">
                <div>
                  <h4 className="font-medium">1. Environment Setup</h4>
                  <p className="text-sm text-gray-700">
                    Make sure you have a <code>.env.local</code> file with the following variables:
                  </p>
                  <pre className="bg-gray-100 p-2 rounded mt-1 text-xs overflow-x-auto">
                    GEMINI_API_KEY=your-api-key-here
                  </pre>
                </div>
                
                <div>
                  <h4 className="font-medium">2. Server Configuration</h4>
                  <p className="text-sm text-gray-700">
                    Ensure the Next.js server is running on port 3000:
                  </p>
                  <pre className="bg-gray-100 p-2 rounded mt-1 text-xs overflow-x-auto">
                    npm run dev
                  </pre>
                </div>
                
                <div>
                  <h4 className="font-medium">3. Fallback System</h4>
                  <p className="text-sm text-gray-700">
                    The chatbot will use a fallback response system if Gemini API is unavailable.
                    You can still test basic functionality without an API key.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
