'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Share2, Clipboard } from "lucide-react";
import { getMuseum } from '@/lib/museums';

interface TicketData {
  bookingId: string;
  paymentId: string;
  paymentStatus: string;
  museumId: string;
  visitorDetails: {
    name: string;
    email: string;
    phone: string;
  };
  ticketType: string;
  quantity: number;
  date: string;
  totalAmount: number;
}

export default function ConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ticketData, setTicketData] = useState<TicketData | null>(null);
  const [museumName, setMuseumName] = useState('');
  const [ticketTypeName, setTicketTypeName] = useState('');
  const [ticketPrice, setTicketPrice] = useState(0);
  
  useEffect(() => {
    const dataParam = searchParams.get('data');
    
    if (!dataParam) {
      router.push('/');
      return;
    }
    
    try {
      const parsedData = JSON.parse(decodeURIComponent(dataParam)) as TicketData;
      setTicketData(parsedData);
      
      // Get museum details
      const museum = getMuseum(parsedData.museumId);
      if (museum) {
        setMuseumName(museum.name);
        
        // Get ticket type details
        const ticket = museum.tickets[parsedData.ticketType];
        if (ticket) {
          setTicketTypeName(ticket.name);
          setTicketPrice(ticket.price);
        }
      }
    } catch (e) {
      console.error('Invalid ticket data:', e);
      router.push('/');
    }
  }, [searchParams, router]);

  const downloadTicket = () => {
    if (!ticketData) return;
    
    // Create a hidden element with ticket content
    const ticketElement = document.getElementById('ticket-content');
    
    if (ticketElement) {
      // Using html2canvas and jsPDF would be ideal here
      // For simplicity, we'll use the browser's print function
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Museum Ticket - ${ticketData.bookingId}</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .ticket { border: 2px solid #000; padding: 20px; max-width: 500px; margin: 0 auto; }
                .header { text-align: center; border-bottom: 1px solid #ccc; padding-bottom: 10px; margin-bottom: 15px; }
                .detail-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
                .footer { margin-top: 20px; text-align: center; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="ticket">
                <div class="header">
                  <h1>Ministry of Culture</h1>
                  <h2>${museumName} - Entry Ticket</h2>
                </div>
                <div class="details">
                  <div class="detail-row"><strong>Booking ID:</strong> ${ticketData.bookingId}</div>
                  <div class="detail-row"><strong>Visitor:</strong> ${ticketData.visitorDetails.name}</div>
                  <div class="detail-row"><strong>Ticket Type:</strong> ${ticketTypeName}</div>
                  <div class="detail-row"><strong>Visit Date:</strong> ${ticketData.date}</div>
                  <div class="detail-row"><strong>Quantity:</strong> ${ticketData.quantity}</div>
                  <div class="detail-row"><strong>Price:</strong> ₹${ticketPrice}</div>
                  <div class="detail-row"><strong>Total Amount:</strong> ₹${ticketData.totalAmount}</div>
                  <div class="detail-row"><strong>Payment ID:</strong> ${ticketData.paymentId}</div>
                </div>
                <div class="footer">
                  <p>Please show this ticket at the museum entrance. Valid only on the date mentioned.</p>
                </div>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  if (!ticketData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-10">
            <p>Loading ticket information...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="text-center border-b">
            <CardTitle className="text-2xl">Booking Confirmed!</CardTitle>
            <CardDescription>Your tickets have been booked successfully</CardDescription>
          </CardHeader>
          
          <CardContent className="p-6">
            <div id="ticket-content" className="border rounded-lg p-6 mb-6">
              <div className="text-center border-b pb-4 mb-4">
                <h2 className="text-xl font-bold">{museumName}</h2>
                <p className="text-gray-500">Entry Ticket</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">Booking ID:</span>
                  <span>{ticketData.bookingId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Visitor:</span>
                  <span>{ticketData.visitorDetails.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Email:</span>
                  <span>{ticketData.visitorDetails.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Phone:</span>
                  <span>{ticketData.visitorDetails.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Ticket Type:</span>
                  <span>{ticketTypeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Quantity:</span>
                  <span>{ticketData.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Visit Date:</span>
                  <span>{ticketData.date}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total Amount:</span>
                  <span>₹{ticketData.totalAmount}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span className="font-medium">Payment Status:</span>
                  <span>Paid</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Payment ID:</span>
                  <span>{ticketData.paymentId}</span>
                </div>
              </div>
              
              <div className="border-t mt-4 pt-4 text-center text-sm text-gray-500">
                <p>Please show this ticket at the museum entrance.</p>
                <p>Valid only on the date mentioned.</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={downloadTicket} className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                Download Ticket
              </Button>
              <Button variant="outline" className="flex-1">
                <Share2 className="mr-2 h-4 w-4" />
                Share Ticket
              </Button>
              <Button variant="outline" className="flex-1">
                <Clipboard className="mr-2 h-4 w-4" />
                Copy Booking ID
              </Button>
            </div>
          </CardContent>
          
          <CardFooter className="border-t flex justify-between">
            <Button variant="ghost" onClick={() => router.push('/')}>
              Back to Home
            </Button>
            <Button variant="ghost" onClick={() => router.push('/dashboard')}>
              My Bookings
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 