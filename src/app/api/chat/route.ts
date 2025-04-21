import { NextResponse } from 'next/server';
import { generateChatResponse } from '@/lib/gemini';
import { getMuseum, Museum } from '@/lib/museums';

console.log('Chat API route initialized');

// Define interfaces for ticket and show types
interface Ticket {
  name: string;
  price: number;
  description: string;
}

interface Show {
  name: string;
  description: string;
  schedule: string;
}

// Fallback response function when Gemini API isn't available
function generateFallbackResponse(message: string, museumData: Museum | null): string {
  const query = message.toLowerCase();
  
  // Museum-specific context if available
  if (museumData) {
    if (query.includes('ticket') || query.includes('price') || query.includes('cost')) {
      return `Here are the ticket prices for ${museumData.name}:\n${
        Object.entries(museumData.tickets)
          .map(([_type, ticket]) => `- ${ticket.name}: ₹${ticket.price} - ${ticket.description}`)
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
    
    return `I can help you with information about ${museumData.name}, including tickets, timings, and special shows. What would you like to know?`;
  }
  
  // Generic responses
  if (query.includes('ticket') || query.includes('price') || query.includes('cost')) {
    return 'Ticket prices vary by museum. Please select a specific museum to get detailed ticket information.';
  }
  
  if (query.includes('museum') && query.includes('list')) {
    return 'We have several museums including Visvesvaraya Industrial and Technological Museum, National Gallery of Modern Art, Government Museum Bangalore, and more. Please select one to learn more.';
  }
  
  return 'I can help you with information about museums, tickets, and shows. Please select a museum or ask a more specific question.';
}

// API health check endpoint to test connectivity
export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    message: 'Chat API is working correctly',
    config: {
      hasGeminiKey: !!process.env.GEMINI_API_KEY
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
    
    // Get museum data if a museum ID is provided
    const museumData = museumId ? getMuseum(museumId) : null;
    console.log('Museum data retrieved:', museumId, !!museumData);
    
    let response;
    
    // Try to use Gemini if API key is available
    if (process.env.GEMINI_API_KEY) {
      try {
        console.log('Attempting to use Gemini API');
        response = await generateChatResponse({
          prompt: message,
          museumData,
          language,
          history
        });
        console.log('Gemini API response received successfully');
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
