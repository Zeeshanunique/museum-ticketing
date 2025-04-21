// Dummy payment system for testing purposes

export interface PaymentIntent {
  paymentId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
}

export async function createPaymentIntent(amount: number): Promise<PaymentIntent> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Generate a random payment ID
  const paymentId = `PAY-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  
  return {
    paymentId,
    amount,
    currency: 'inr',
    status: 'pending'
  };
}

export async function processPayment(paymentId: string): Promise<PaymentIntent> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Simulate successful payment (in a real system, this would interact with a payment gateway)
  return {
    paymentId,
    amount: 0, // This would be retrieved from the database in a real system
    currency: 'inr',
    status: 'completed'
  };
}
