import { NextResponse } from 'next/server';
import { createPaymentIntent } from '@/lib/payment';
import { getMuseum } from '@/lib/museums';

export async function POST(request: Request) {
  try {
    const { museumId, ticketType, quantity } = await request.json();

    const museum = getMuseum(museumId);
    if (!museum) {
      return NextResponse.json(
        { error: 'Museum not found' },
        { status: 404 }
      );
    }

    const ticket = museum.tickets[ticketType];
    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket type not found' },
        { status: 404 }
      );
    }

    const totalAmount = ticket.price * quantity;
    const paymentIntent = await createPaymentIntent(totalAmount);

    return NextResponse.json(paymentIntent);
  } catch (error) {
    console.error('Payment error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
