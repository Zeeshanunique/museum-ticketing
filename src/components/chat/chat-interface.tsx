'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Museum } from '@/lib/museums';
import { Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'booking-form' | 'booking-confirmation';
  bookingData?: any;
}

interface ChatInterfaceProps {
  selectedMuseum?: Museum;
  className?: string;
  height?: string;
}

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिंदी' },
  { code: 'kn', name: 'ಕನ್ನಡ' },
  { code: 'te', name: 'తెలుగు' },
  { code: 'ta', name: 'தமிழ்' }
];

export function ChatInterface({ selectedMuseum, className, height = "600px" }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: selectedMuseum 
        ? `Hello! How can I help you with your visit to ${selectedMuseum.name}?`
        : 'Hello! How can I help you with museum information and tickets today?' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState('en');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Add new states for booking
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingData, setBookingData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    quantity: 1,
    ticketType: ''
  });

  // Scroll to the bottom of the chat on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Reset initial greeting when museum changes
  useEffect(() => {
    setMessages([
      { 
        role: 'assistant', 
        content: selectedMuseum 
          ? `Hello! How can I help you with your visit to ${selectedMuseum.name}?`
          : 'Hello! How can I help you with museum information and tickets today?' 
      }
    ]);
  }, [selectedMuseum]);

  // Handle window resize for chat container
  useEffect(() => {
    const handleResize = () => {
      if (chatContainerRef.current) {
        // For responsive design: on smaller screens, adjust height
        if (window.innerWidth < 768) {
          const viewportHeight = window.innerHeight;
          // Set max height to 60% of viewport height on mobile
          chatContainerRef.current.style.maxHeight = `${viewportHeight * 0.6}px`;
        } else {
          // Return to default height on larger screens
          chatContainerRef.current.style.maxHeight = height;
        }
      }
    };

    // Initial setup
    handleResize();
    
    // Update on resize
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [height]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    
    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    
    // Show typing indicator
    setIsLoading(true);

    try {
      // Check if the message is about booking tickets
      if (selectedMuseum && (
        userMessage.toLowerCase().includes('book ticket') || 
        userMessage.toLowerCase().includes('buy ticket') ||
        userMessage.toLowerCase().includes('purchase ticket') ||
        userMessage.toLowerCase().includes('get ticket')
      )) {
        // Display booking form message
        setTimeout(() => {
          setMessages(prev => [
            ...prev, 
            { 
              role: 'assistant', 
              content: `I can help you book tickets for ${selectedMuseum.name}. Please fill out the following form:`,
              type: 'booking-form'
            }
          ]);
          setShowBookingForm(true);
          setIsLoading(false);
        }, 1000);
        return;
      }

      // Prepare chat history for the API
      const chatHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // First, check if the API is available
      try {
        const checkResponse = await fetch('/api/test', { 
          method: 'GET',
          cache: 'no-cache'
        });
        
        if (!checkResponse.ok) {
          throw new Error('API server not available');
        }
      } catch (checkError) {
        console.error('API check failed:', checkError);
        throw new Error('Could not connect to the chat service. Please try again later.');
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage, 
          history: chatHistory,
          museumId: selectedMuseum?.id,
          language
        }),
        cache: 'no-cache',
        credentials: 'same-origin',
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data = await response.json();
      
      // Add assistant response to chat
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Add error message in the selected language
      const errorMessages: Record<string, string> = {
        'en': 'Sorry, I encountered an error. Please try again.',
        'hi': 'क्षमा करें, एक त्रुटि हुई। कृपया पुनः प्रयास करें।',
        'kn': 'ಕ್ಷಮಿಸಿ, ನಾನು ದೋಷವನ್ನು ಎದುರಿಸಿದ್ದೇನೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
        'te': 'క్షమించండి, నేను లోపాన్ని ఎదుర్కొన్నాను. దయచేసి మళ్లీ ప్రయత్నించండి.',
        'ta': 'மன்னிக்கவும், எனக்கு பிழை ஏற்பட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.'
      };
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: errorMessages[language] || errorMessages['en']
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Improve the handleBookingSubmit function to provide better user feedback
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!selectedMuseum) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Please select a museum first before booking tickets.'
      }]);
      return;
    }
    
    if (!bookingData.ticketType) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Please select a ticket type to continue with your booking.'
      }]);
      return;
    }
    
    setIsLoading(true);
    setShowBookingForm(false);
    
    // Show processing message
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: 'Processing your booking request...'
    }]);
    
    try {
      // First, create a payment intent
      const paymentResponse = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          museumId: selectedMuseum.id,
          ticketType: bookingData.ticketType,
          quantity: bookingData.quantity
        }),
      });
      
      if (!paymentResponse.ok) {
        throw new Error('Failed to create payment');
      }
      
      const paymentData = await paymentResponse.json();
      
      // Prepare booking data to pass to payment page
      const fullBookingData = {
        museumId: selectedMuseum.id,
        ticketType: bookingData.ticketType,
        quantity: bookingData.quantity,
        date: bookingData.date,
        visitorDetails: {
          name: bookingData.name,
          email: bookingData.email,
          phone: bookingData.phone
        },
        bookingId: `BK${Date.now()}`,
        totalAmount: selectedMuseum.tickets[bookingData.ticketType].price * bookingData.quantity
      };
      
      // Replace the processing message with confirmation
      setMessages(prev => {
        // Find and remove the "Processing your booking request..." message
        const filteredMessages = prev.filter(msg => 
          !(msg.role === 'assistant' && msg.content === 'Processing your booking request...')
        );
        
        // Add the confirmation message
        return [
          ...filteredMessages, 
          { 
            role: 'assistant', 
            content: `Great! I've prepared your booking for ${fullBookingData.quantity} ${selectedMuseum.tickets[bookingData.ticketType].name} ticket(s) for ${selectedMuseum.name} on ${bookingData.date}. Please proceed to payment to complete your booking.`,
            type: 'booking-confirmation',
            bookingData: {
              ...fullBookingData,
              paymentId: paymentData.paymentId,
              amount: paymentData.amount
            }
          }
        ];
      });
    } catch (error) {
      console.error('Booking error:', error);
      // Replace the processing message with error
      setMessages(prev => {
        // Find and remove the "Processing your booking request..." message
        const filteredMessages = prev.filter(msg => 
          !(msg.role === 'assistant' && msg.content === 'Processing your booking request...')
        );
        
        return [
          ...filteredMessages, 
          { 
            role: 'assistant', 
            content: 'Sorry, I couldn\'t process your booking request. Please try again later.'
          }
        ];
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update the handlePayment function to ensure it uses router for navigation
  const handlePayment = (bookingData: any) => {
    console.log("Redirecting to payment page with data:", bookingData);
    
    // Construct the payment URL with booking data
    const paymentUrl = `/payment?paymentId=${bookingData.paymentId}&amount=${bookingData.amount}&bookingData=${encodeURIComponent(JSON.stringify(bookingData))}`;
    
    // Use window.location for a full page redirect to ensure the payment page loads
    window.location.href = paymentUrl;
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Get placeholder text based on language
  const getPlaceholder = () => {
    const placeholders: Record<string, string> = {
      'en': 'Type your message...',
      'hi': 'अपना संदेश टाइप करें...',
      'kn': 'ನಿಮ್ಮ ಸಂದೇಶವನ್ನು ಟೈಪ್ ಮಾಡಿ...',
      'te': 'మీ సందేశాన్ని టైప్ చేయండి...',
      'ta': 'உங்கள் செய்தியை தட்டச்சு செய்யவும்...'
    };
    return placeholders[language] || placeholders['en'];
  };

  // Get send button text based on language
  const getSendButtonText = () => {
    const sendTexts: Record<string, string> = {
      'en': 'Send',
      'hi': 'भेजें',
      'kn': 'ಕಳುಹಿಸಿ',
      'te': 'పంపు',
      'ta': 'அனுப்பு'
    };
    return sendTexts[language] || sendTexts['en'];
  };

  // Get typing indicator text based on language
  const getTypingText = () => {
    const typingTexts: Record<string, string> = {
      'en': 'Typing...',
      'hi': 'टाइप कर रहा है...',
      'kn': 'ಟೈಪ್ ಮಾಡುತ್ತಿದೆ...',
      'te': 'టైపింగ్...',
      'ta': 'தட்டச்சு செய்கிறது...'
    };
    return typingTexts[language] || typingTexts['en'];
  };

  // Add a dedicated function for handling the booking button click
  const handleBookingButtonClick = () => {
    // Reset booking form data
    setBookingData({
      name: '',
      email: '',
      phone: '',
      date: '',
      quantity: 1,
      ticketType: ''
    });
    
    // Add booking message and show form
    setMessages(prev => [
      ...prev, 
      { 
        role: 'assistant', 
        content: `I can help you book tickets for ${selectedMuseum?.name}. Please fill out the following form:`,
        type: 'booking-form'
      }
    ]);
    setShowBookingForm(true);
    
    // Scroll to the bottom to show the form
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <Card className={`h-full flex flex-col ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Museum Assistant</CardTitle>
            <CardDescription>
              {selectedMuseum 
                ? `Ask me about ${selectedMuseum.name}` 
                : 'Ask me anything about museums, tickets, events, or exhibitions'}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {selectedMuseum && (
              <Button 
                onClick={handleBookingButtonClick}
                variant="default"
                className="mr-2"
              >
                Book Tickets
              </Button>
            )}
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col pt-0 overflow-hidden">
        <div 
          ref={chatContainerRef}
          className="flex-grow bg-gray-50 rounded-md p-4 mb-4 overflow-y-auto"
          style={{ maxHeight: height }}
        >
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${
                  message.role === 'assistant' 
                    ? 'bg-white border border-gray-100 shadow-sm' 
                    : 'bg-blue-50 ml-8 border border-blue-100'
                }`}
              >
                <p className="text-sm whitespace-pre-line">{message.content}</p>
                
                {/* Show booking form if this is a booking form message */}
                {message.role === 'assistant' && message.type === 'booking-form' && showBookingForm && (
                  <form onSubmit={handleBookingSubmit} className="mt-4 bg-white p-4 rounded-md border border-gray-200">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <Input 
                          value={bookingData.name}
                          onChange={(e) => setBookingData({...bookingData, name: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <Input 
                          type="email"
                          value={bookingData.email}
                          onChange={(e) => setBookingData({...bookingData, email: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Phone</label>
                        <Input 
                          value={bookingData.phone}
                          onChange={(e) => setBookingData({...bookingData, phone: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Visit Date</label>
                        <Input 
                          type="date"
                          value={bookingData.date}
                          onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                          required
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Ticket Type</label>
                        <select 
                          className="w-full rounded-md border border-gray-300 p-2"
                          value={bookingData.ticketType}
                          onChange={(e) => setBookingData({...bookingData, ticketType: e.target.value})}
                          required
                        >
                          <option value="">Select a ticket type</option>
                          {selectedMuseum && Object.entries(selectedMuseum.tickets).map(([id, ticket]) => (
                            <option key={id} value={id}>
                              {ticket.name} - ₹{ticket.price}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Quantity</label>
                        <Input 
                          type="number"
                          min="1"
                          max="10"
                          value={bookingData.quantity}
                          onChange={(e) => setBookingData({...bookingData, quantity: parseInt(e.target.value)})}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full">Submit Booking</Button>
                    </div>
                  </form>
                )}
                
                {/* Show booking confirmation and payment button */}
                {message.role === 'assistant' && message.type === 'booking-confirmation' && (
                  <div className="mt-4">
                    <Button 
                      onClick={() => handlePayment(message.bookingData)}
                      className="w-full"
                    >
                      Proceed to Payment
                    </Button>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                <p className="text-sm text-gray-500">{getTypingText()}</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={getPlaceholder()}
            disabled={isLoading}
          />
          <Button onClick={handleSend} disabled={!input.trim() || isLoading}>
            {getSendButtonText()}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
