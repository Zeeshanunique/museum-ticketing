'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ChatInterface } from "@/components/chat/chat-interface";
import { getAllMuseums,  Museum } from "@/lib/museums";
import { LandingPage } from "@/components/LandingPage";

interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  date: string;
  quantity: number;
}

interface TicketData {
  bookingId: string;
  museumName: string;
  ticketType: string;
  visitorName: string;
  date: string;
  quantity: number;
  price: number;
  totalAmount: number;
  bookingDate: string;
}

export default function Home() {
  const [showLandingPage, setShowLandingPage] = useState(true);
  const [selectedMuseum, setSelectedMuseum] = useState<Museum | null>(getAllMuseums()[0]);
  const [bookingData, setBookingData] = useState<BookingFormData>({
    name: '',
    email: '',
    phone: '',
    date: '',
    quantity: 1
  });
  const [ticketData, setTicketData] = useState<TicketData | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [bookingDialog, setBookingDialog] = useState(false);

  const handleBooking = async (ticketType: string) => {
    if (!selectedMuseum) return;

    try {
      // First create a payment intent
      const paymentResponse = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          museumId: selectedMuseum.id,
          ticketType: ticketType,
          quantity: bookingData.quantity
        }),
      });

      if (!paymentResponse.ok) {
        throw new Error('Failed to create payment intent');
      }

      const paymentData = await paymentResponse.json();
      
      // Close the booking dialog
      setBookingDialog(false);
      
      // Prepare booking data
      const fullBookingData = {
        museumId: selectedMuseum.id,
        ticketType: ticketType,
        quantity: bookingData.quantity,
        date: bookingData.date,
        visitorDetails: {
          name: bookingData.name,
          email: bookingData.email,
          phone: bookingData.phone
        },
        bookingId: `BK${Date.now()}`,
        totalAmount: selectedMuseum.tickets[ticketType].price * bookingData.quantity,
        paymentId: paymentData.paymentId,
        amount: paymentData.amount
      };
      
      // Redirect to payment page
      window.location.href = `/payment?paymentId=${paymentData.paymentId}&amount=${paymentData.amount}&bookingData=${encodeURIComponent(JSON.stringify(fullBookingData))}`;
    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to process booking. Please try again.');
    }
  };

  // Function to download ticket as PDF
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
                  <h2>${ticketData.museumName} - Entry Ticket</h2>
                </div>
                <div class="details">
                  <div class="detail-row"><strong>Booking ID:</strong> ${ticketData.bookingId}</div>
                  <div class="detail-row"><strong>Visitor:</strong> ${ticketData.visitorName}</div>
                  <div class="detail-row"><strong>Ticket Type:</strong> ${ticketData.ticketType}</div>
                  <div class="detail-row"><strong>Visit Date:</strong> ${ticketData.date}</div>
                  <div class="detail-row"><strong>Quantity:</strong> ${ticketData.quantity}</div>
                  <div class="detail-row"><strong>Price:</strong> ₹${ticketData.price}</div>
                  <div class="detail-row"><strong>Total Amount:</strong> ₹${ticketData.totalAmount}</div>
                  <div class="detail-row"><strong>Booking Date:</strong> ${ticketData.bookingDate}</div>
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

  if (showLandingPage) {
    return <LandingPage onExploreClick={() => setShowLandingPage(false)} />;
  }

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-50">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Ministry of Culture</h1>
          <p className="text-gray-600 mt-2">Museum Ticketing System</p>
        </div>
        <Button variant="outline" onClick={() => setShowLandingPage(true)}>
          Back to Home
        </Button>
      </div>

      {/* Museum Selection */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {getAllMuseums().map((museum) => (
            <Card 
              key={museum.id} 
              className={`cursor-pointer transition-all ${
                selectedMuseum?.id === museum.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedMuseum(museum)}
            >
              <CardHeader>
                <CardTitle className="text-lg">{museum.name}</CardTitle>
                <CardDescription>{museum.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-2">
                  <p><strong>Location:</strong> {museum.location.address}</p>
                  <p><strong>Timings:</strong> {museum.timings.opening} - {museum.timings.closing}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {museum.facilities.map((facility) => (
                      <span key={facility} className="bg-gray-100 px-2 py-1 rounded-md text-xs">
                        {facility}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {selectedMuseum && (
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Section - Museum Info */}
          <div className="md:col-span-8">
            <Tabs defaultValue="tickets" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="tickets">Tickets</TabsTrigger>
                <TabsTrigger value="shows">Shows &amp; Events</TabsTrigger>
                <TabsTrigger value="info">Museum Info</TabsTrigger>
              </TabsList>
              <TabsContent value="tickets">
                <Card>
                  <CardHeader>
                    <CardTitle>Available Tickets</CardTitle>
                    <CardDescription>Choose from our range of ticket options</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {Object.entries(selectedMuseum.tickets).map(([id, ticket]) => (
                        <Card key={id} className="p-4 hover:bg-gray-50">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-medium">{ticket.name}</h3>
                              <p className="text-sm text-gray-500">{ticket.description}</p>
                              <p className="text-sm font-semibold mt-1">₹{ticket.price}</p>
                            </div>
                            <Dialog open={bookingDialog} onOpenChange={setBookingDialog}>
                              <DialogTrigger asChild>
                                <Button>Book Now</Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Book {ticket.name}</DialogTitle>
                                  <DialogDescription>Fill in your details to book your tickets</DialogDescription>
                                </DialogHeader>
                                <form onSubmit={(e) => {
                                  e.preventDefault();
                                  handleBooking(id);
                                }}>
                                  <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                      <label>Name</label>
                                      <Input
                                        value={bookingData.name}
                                        onChange={(e) => setBookingData({...bookingData, name: e.target.value})}
                                        required
                                      />
                                    </div>
                                    <div className="grid gap-2">
                                      <label>Email</label>
                                      <Input
                                        type="email"
                                        value={bookingData.email}
                                        onChange={(e) => setBookingData({...bookingData, email: e.target.value})}
                                        required
                                      />
                                    </div>
                                    <div className="grid gap-2">
                                      <label>Phone</label>
                                      <Input
                                        value={bookingData.phone}
                                        onChange={(e) => setBookingData({...bookingData, phone: e.target.value})}
                                        required
                                      />
                                    </div>
                                    <div className="grid gap-2">
                                      <label>Visit Date</label>
                                      <Input
                                        type="date"
                                        value={bookingData.date}
                                        onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                      />
                                    </div>
                                    <div className="grid gap-2">
                                      <label>Number of Tickets</label>
                                      <Input
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={bookingData.quantity}
                                        onChange={(e) => setBookingData({...bookingData, quantity: parseInt(e.target.value)})}
                                        required
                                      />
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button type="submit">Proceed to Payment</Button>
                                  </DialogFooter>
                                </form>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="shows">
                <Card>
                  <CardHeader>
                    <CardTitle>Special Shows &amp; Events</CardTitle>
                    <CardDescription>Upcoming shows and special exhibitions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {selectedMuseum.shows.map((show) => (
                        <Card key={show.name} className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-medium">{show.name}</h3>
                              <p className="text-sm text-gray-500">{show.description}</p>
                              <p className="text-sm text-gray-500">{show.schedule}</p>
                              <p className="text-sm font-semibold mt-1">
                                {typeof show.price === 'number' ? `₹${show.price}` : show.price}
                              </p>
                            </div>
                            <Button variant="outline">Book Show</Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="info">
                <Card>
                  <CardHeader>
                    <CardTitle>Museum Information</CardTitle>
                    <CardDescription>Location and general information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium">Opening Hours</h3>
                        <p className="text-sm text-gray-500">
                          {selectedMuseum.timings.opening} - {selectedMuseum.timings.closing}
                        </p>
                        <p className="text-sm text-gray-500">
                          Closed on: {selectedMuseum.timings.holidays.join(', ')}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium">Location</h3>
                        <p className="text-sm text-gray-500">{selectedMuseum.location.address}</p>
                        <p className="text-sm text-gray-500">
                          {selectedMuseum.location.city}, {selectedMuseum.location.state} - {selectedMuseum.location.pincode}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium">Facilities</h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedMuseum.facilities.map((facility) => (
                            <span key={facility} className="bg-gray-100 px-2 py-1 rounded-md text-sm">
                              {facility}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Section - Chat Interface */}
          <div className="md:col-span-4">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Museum Assistant</CardTitle>
                <CardDescription>Ask questions about {selectedMuseum.name} or any other museum</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[500px]">
                  <ChatInterface selectedMuseum={selectedMuseum} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Ticket Modal */}
      {ticketData && (
        <Dialog open={showTicketModal} onOpenChange={setShowTicketModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Booking successful</DialogTitle>
              <DialogDescription>
                Your ticket details are below.
              </DialogDescription>
            </DialogHeader>
            <div id="ticket-content" className="border-2 border-gray-300 rounded-md p-6 my-4">
              <div className="text-center border-b pb-4 mb-4">
                <h2 className="text-xl font-bold">{ticketData.museumName}</h2>
                <p className="text-sm text-gray-600">Entry Ticket</p>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">Booking ID:</span>
                  <span>{ticketData.bookingId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Visitor:</span>
                  <span>{ticketData.visitorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Ticket Type:</span>
                  <span>{ticketData.ticketType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Visit Date:</span>
                  <span>{ticketData.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Quantity:</span>
                  <span>{ticketData.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Total Amount:</span>
                  <span>₹{ticketData.totalAmount}</span>
                </div>
              </div>
              <div className="border-t pt-4 mt-4 text-center text-sm text-gray-500">
                Please show this ticket at the museum entrance. Valid only on the date mentioned.
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => setShowTicketModal(false)}>
                Close
              </Button>
              <Button onClick={downloadTicket}>
                Download Ticket
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </main>
  );
}
