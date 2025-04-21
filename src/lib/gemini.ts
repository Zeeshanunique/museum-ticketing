import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Initialize the Gemini API
export function getGeminiClient() {
  // Check if API key is available
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined in environment variables');
  }
  
  return new GoogleGenerativeAI(apiKey);
}

export async function generateChatResponse({
  prompt,
  language = 'en',
  history = []
}: {
  prompt: string;
  language?: string;
  history?: Array<{ role: string; content: string }>;
}) {
  try {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Prepare the context with museum data
    const allMuseums = await getAllMuseums();
    
    let systemContext = `You are a helpful assistant for a museum ticketing system. Here's what you need to know:

**General Museum Information**
1. Museums in India typically open between 9-10 AM and close between 5-6 PM
2. Most museums are closed on Mondays
3. Common ticket types: General Admission, Student/Senior Concession, Family Pass
4. Many museums offer free entry on special days like International Museum Day
5. Photography rules vary - some allow it with a fee, others prohibit it
6. Most museums have guided tours available, often in multiple languages

**Available Museums**
`;

    // Add information about all museums
    allMuseums.forEach(museum => {
      systemContext += `
**${museum.name}**
`;
      systemContext += `Location: ${museum.location.city}, ${museum.location.state}
`;
      systemContext += `Timings: ${museum.timings.opening} - ${museum.timings.closing}
`;
      systemContext += `Tickets: `;
      Object.entries(museum.tickets).forEach((entry) => {
        const ticket = entry[1];
        systemContext += `${ticket.name} (₹${ticket.price}) `;
      });
      systemContext += `
Facilities: ${museum.facilities.join(', ')}
`;
      if (museum.shows && museum.shows.length > 0) {
        systemContext += `Current Shows: `;
        museum.shows.forEach((show) => {
          systemContext += `${show.name} (₹${show.price}) `;
        });
      }
      systemContext += `
`;
    });

    systemContext += `
Your role is to provide accurate, helpful information about any of these museums. Be polite, enthusiastic about cultural heritage, and always maintain a professional tone. If you don't know an answer, say so and suggest where the visitor might find the information.`;

    // Add language instruction
    const languageMap: Record<string, string> = {
      'en': 'Respond in English.',
      'hi': 'हिंदी में जवाब दें।',
      'kn': 'ಕನ್ನಡದಲ್ಲಿ ಉತ್ತರಿಸಿ.',
      'te': 'తెలుగులో సమాధానం ఇవ్వండి.',
      'ta': 'தமிழில் பதிலளிக்கவும்.'
    };
    
    systemContext += languageMap[language] || 'Respond in English.';
    
    // Filter out assistant messages from the beginning of history
    // Gemini requires the first message to have the 'user' role
    const formattedHistory = [];
    let validHistoryStart = false;
    
    // Only include history if we have real messages beyond the initial greeting
    if (history.length > 1) {
      for (const msg of history) {
        // Skip assistant messages until we find the first user message
        if (!validHistoryStart && msg.role === 'assistant') {
          continue;
        }
        
        // Once we find a user message, start including messages
        validHistoryStart = true;
        
        if (validHistoryStart) {
          formattedHistory.push({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }],
          });
        }
      }
    }
    
    // If no valid history or current message is the first one
    if (formattedHistory.length === 0) {
      // Directly send the prompt without history
      const result = await model.generateContent({
        contents: [{ 
          role: 'user',
          parts: [{ text: `${systemContext}\n\n${prompt}` }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 800,
        },
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
        ],
      });
      
      return result.response.text();
    } 
    // Create chat session with valid history
    else {
      const chat = model.startChat({
        history: formattedHistory,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 800,
        },
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
        ],
      });
      
      // Send the prompt with system context
      const result = await chat.sendMessage(`${systemContext}\n\nUser question: ${prompt}`);
      return result.response.text();
    }
  } catch (error) {
    console.error('Error generating response with Gemini:', error);
    throw error;
  }
}

interface Museum {
  name: string;
  location: { city: string, state: string };
  timings: { opening: string, closing: string };
  tickets: Record<string, { name: string, price: number }>;
  facilities: string[];
  shows?: Array<{ name: string, price: number | string }>; 
}

// Define the expected shape of museum data from JSON
interface RawMuseum {
  id: string;
  name: string;
  description: string;
  location: {
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  timings: {
    opening: string;
    closing: string;
    holidays: string[];
  };
  tickets: Record<string, {
    name: string;
    price: number;
    description: string;
  }>;
  facilities: string[];
  shows?: Array<{
    name: string;
    description: string;
    schedule: string;
    price: number | string;
  }>;
}

async function getAllMuseums(): Promise<Museum[]> {
  // Import the museum data using dynamic import
  const { default: museumData } = await import('@/data.json');
  
  /* eslint-disable @typescript-eslint/no-explicit-any */
  return museumData.map((museum: any) => ({
    name: museum.name,
    location: {
      city: museum.location.city,
      state: museum.location.state,
    },
    timings: {
      opening: museum.timings.opening,
      closing: museum.timings.closing,
    },
    tickets: Object.fromEntries(
      Object.entries(museum.tickets).map(([key, value]: [string, any]) => [
        key,
        { name: value.name, price: value.price },
      ])
    ),
    facilities: museum.facilities,
    shows: museum.shows?.map((show: any) => ({
      name: show.name,
      price: typeof show.price === 'string' ? parseFloat(show.price) : show.price,
    })),
  }));
  /* eslint-enable @typescript-eslint/no-explicit-any */
}
