import { NextResponse } from 'next/server';
import { generateChatResponse } from '@/lib/gemini';
import { getMuseum, Museum } from '@/lib/museums';

console.log('Chat API route initialized');

// Fallback response function when Gemini API isn't available
function generateFallbackResponse(message: string, museumData: Museum | null): string {
  const query = message.toLowerCase();
  
  // Detect booking intents
  if (museumData && (
    query.includes('book ticket') || 
    query.includes('buy ticket') || 
    query.includes('purchase ticket') ||
    query.includes('get ticket')
  )) {
    return `I can help you book tickets for ${museumData.name}. You can tell me "I want to book tickets" to get started.`;
  }
  
  // Museum-specific context if available
  if (museumData) {
    if (query.includes('ticket') || query.includes('price') || query.includes('cost')) {
      return `Here are the ticket prices for ${museumData.name}:\n${
        Object.entries(museumData.tickets)
          .map(entry => {
            const ticket = entry[1];
            return `- ${ticket.name}: ₹${ticket.price} - ${ticket.description}`;
          })
          .join('\n')
      }`;
    }
    
    if (query.includes('time') || query.includes('hour') || query.includes('when') || query.includes('open')) {
      return `${museumData.name} is open from ${museumData.timings.opening} to ${museumData.timings.closing}. ${
        museumData.timings.holidays.length > 0 
          ? `The museum is closed on ${museumData.timings.holidays.join(', ')}.`
          : ''
      }`;
    }
    
    if (query.includes('location') || query.includes('address') || query.includes('where')) {
      return `${museumData.name} is located at ${museumData.location.address}, ${museumData.location.city}, ${museumData.location.state}, ${museumData.location.pincode}.`;
    }
    
    if (query.includes('show') || query.includes('event') || query.includes('exhibition')) {
      if (museumData.shows && museumData.shows.length > 0) {
        return `Current shows at ${museumData.name}:\n${
          museumData.shows.map((show) => `- ${show.name}: ${show.description} (${show.schedule})`)
            .join('\n')
        }`;
      } else {
        return `There are currently no special shows or events at ${museumData.name}.`;
      }
    }
    
    // Generic booking inquiry
    if (query.includes('book') || query.includes('reservation') || query.includes('tickets')) {
      return `You can book tickets for ${museumData.name} directly through our chat interface. Just type "I want to book tickets" and I'll help you through the process.`;
    }
    
    return `I can help you with information about ${museumData.name}, including tickets, timings, and special shows. What would you like to know?`;
  }
  
  // Generic responses
  if (query.includes('ticket') || query.includes('price') || query.includes('cost')) {
    return 'Ticket prices vary by museum. Please select a specific museum to get detailed ticket information.';
  }
  
  if (query.includes('museum') && query.includes('list')) {
    return 'We have several museums including Visvesvaraya Industrial and Technological Museum, National Gallery of Modern Art, Government Museum Bangalore, and more. Please select one to learn more.';
  }
  
  if (query.includes('book') || query.includes('purchase') || query.includes('buy') || query.includes('reservation')) {
    return 'To book tickets, please select a museum first, and then let me know you want to book tickets.';
  }
  
  // Handle basic greetings
  if (query.includes('hi') || query.includes('hello') || query.includes('hey') || query === 'hi' || query === 'hello') {
    return 'Hello! I\'m here to help you with museum information and ticket bookings. You can ask me about museum timings, ticket prices, current exhibitions, or let me know if you want to book tickets. What would you like to know?';
  }
  
  return 'I can help you with information about museums, tickets, and shows. Please select a museum or ask a more specific question.';
}

// API health check endpoint to test connectivity
export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    message: 'Chat API is working correctly',
    config: {
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      geminiKeyLength: process.env.GEMINI_API_KEY?.length || 0,
      geminiKeyPrefix: process.env.GEMINI_API_KEY?.substring(0, 8) || 'not-found'
    }
  });
}

export async function POST(request: Request) {
  try {
    console.log('Received chat request');
    const body = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));

    if (!body.message) {
      console.error('Missing message in request body');
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const { message, history, museumId, language = 'en' } = body;
    
    // Get museum data if a museum ID is provided, ensuring it's either Museum or null
    const museumData = museumId ? (getMuseum(museumId) || null) : null;
    console.log('Museum data retrieved:', museumId, !!museumData);
    
    let response: string = '';
    
    // Check if this is a booking-related query that should be handled by the frontend
    const bookingKeywords = ['book ticket', 'buy ticket', 'purchase ticket', 'get ticket', 'reserve ticket'];
    const isBookingRequest = bookingKeywords.some(keyword => message.toLowerCase().includes(keyword));
    
    if (isBookingRequest && museumData) {
      // For booking requests, return a special message that will be detected by the frontend
      response = `I can help you book tickets for ${museumData.name}. `;
      
      // Add ticket information
      response += `Here are the available ticket types:\n`;
      Object.entries(museumData.tickets).forEach(([id, ticket]) => {
        response += `- ${ticket.name}: ₹${ticket.price} (${ticket.description})\n`;
      });
      
      response += `\nWould you like to proceed with booking a ticket?`;
      
      return NextResponse.json({ response });
    }
    
    // Try to use Gemini if API key is available
    if (process.env.GEMINI_API_KEY) {
      try {
        console.log('Attempting to use Gemini API');
        response = await generateChatResponse({
          prompt: message,
          language,
          history
        });
        console.log('Gemini API response received, length:', response?.length || 0);
        
        // Check if response is empty or just whitespace
        if (!response || response.trim() === '') {
          console.warn('Gemini returned empty response, falling back to basic responses');
          response = generateFallbackResponse(message, museumData);
        }
      } catch (geminiError) {
        console.error('Gemini API error:', geminiError);
        // Fall back to basic responses if Gemini fails
        console.log('Falling back to basic response system');
        response = generateFallbackResponse(message, museumData);
      }
    } else {
      // Use fallback responses if no API key is available
      console.warn('No GEMINI_API_KEY found, using fallback responses');
      response = generateFallbackResponse(message, museumData);
    }
    
    console.log('Sending response back to client');
    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error in chat API:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    );
  }
}
