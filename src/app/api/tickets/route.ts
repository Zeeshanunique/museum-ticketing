import { NextResponse } from 'next/server';

interface TicketBooking {
  type: string;
  quantity: number;
  date: string;
  visitorDetails: {
    name: string;
    email: string;
    phone: string;
  };
}

// In a real application, this would be stored in a database
const TICKETS = {
  'general': {
    name: 'General Entry',
    price: 200,
    available: true
  },
  'student': {
    name: 'Student Pass',
    price: 100,
    available: true
  },
  'family': {
    name: 'Family Package',
    price: 500,
    available: true
  },
  'senior': {
    name: 'Senior Citizen',
    price: 100,
    available: true
  }
};

export async function POST(request: Request) {
  try {
    const booking: TicketBooking = await request.json();

    // Validate booking
    if (!booking.type || !booking.quantity || !booking.date || !booking.visitorDetails) {
      return NextResponse.json(
        { error: 'Missing required booking information' },
        { status: 400 }
      );
    }

    // Check ticket availability
    const ticket = TICKETS[booking.type as keyof typeof TICKETS];
    if (!ticket || !ticket.available) {
      return NextResponse.json(
        { error: 'Selected ticket type is not available' },
        { status: 400 }
      );
    }

    // Calculate total price
    const totalPrice = ticket.price * booking.quantity;

    // In a real application, you would:
    // 1. Save booking to database
    // 2. Generate unique booking ID
    // 3. Integrate with payment gateway
    // 4. Send confirmation email

    const bookingConfirmation = {
      bookingId: `BK${Date.now()}`,
      ticket: ticket.name,
      quantity: booking.quantity,
      totalPrice,
      date: booking.date,
      visitorDetails: booking.visitorDetails
    };

    return NextResponse.json(bookingConfirmation);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process booking' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    tickets: TICKETS,
    message: 'Available tickets retrieved successfully'
  });
}
