'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CreditCard, Check } from "lucide-react";
import { processPayment } from '@/lib/payment';

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [bookingData, setBookingData] = useState<any>(null);

  useEffect(() => {
    // Get payment intent ID and booking data from URL params
    const paymentIntentId = searchParams.get('paymentId');
    const amount = searchParams.get('amount');
    const bookingDataStr = searchParams.get('bookingData');
    
    if (paymentIntentId && amount) {
      setPaymentId(paymentIntentId);
      setPaymentAmount(Number(amount));
    } else {
      // Handle missing payment information
      console.error('Missing payment information');
      router.push('/');
    }
    
    if (bookingDataStr) {
      try {
        setBookingData(JSON.parse(decodeURIComponent(bookingDataStr)));
      } catch (e) {
        console.error('Invalid booking data:', e);
        router.push('/');
      }
    }
  }, [searchParams, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentDetails(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paymentId || !bookingData) return;
    
    setIsProcessing(true);
    setPaymentStatus('processing');
    
    try {
      // Process the payment
      const result = await processPayment(paymentId);
      
      if (result.status === 'completed') {
        setPaymentStatus('success');
        
        // Wait for animation
        setTimeout(() => {
          // Redirect to ticket generation with payment confirmation
          const ticketData = {
            ...bookingData,
            paymentId: result.paymentId,
            paymentStatus: 'completed'
          };
          
          // Redirect to ticket confirmation page
          router.push(`/booking/confirm?data=${encodeURIComponent(JSON.stringify(ticketData))}`);
        }, 1500);
      } else {
        setPaymentStatus('error');
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      setPaymentStatus('error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 bg-green-100 p-3 rounded-full">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Payment Successful!</CardTitle>
            <CardDescription>Your payment has been processed successfully</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-500">
              Processing your ticket...
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Payment Details</CardTitle>
          <CardDescription>
            Complete your payment to book your tickets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="px-3 py-2 border rounded-md bg-gray-50">
                ₹{paymentAmount.toFixed(2)}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                name="cardNumber"
                placeholder="4111 1111 1111 1111"
                value={paymentDetails.cardNumber}
                onChange={handleInputChange}
                required
                maxLength={19}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cardName">Name on Card</Label>
              <Input
                id="cardName"
                name="cardName"
                placeholder="John Doe"
                value={paymentDetails.cardName}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  name="expiryDate"
                  placeholder="MM/YY"
                  value={paymentDetails.expiryDate}
                  onChange={handleInputChange}
                  required
                  maxLength={5}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  name="cvv"
                  type="password"
                  placeholder="123"
                  value={paymentDetails.cvv}
                  onChange={handleInputChange}
                  required
                  maxLength={4}
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay ₹{paymentAmount.toFixed(2)}
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col text-xs text-gray-500">
          <p>This is a demo payment page. No actual payment will be processed.</p>
          <p>Use any card number, expiry date, and CVV to test.</p>
        </CardFooter>
      </Card>
    </div>
  );
} 