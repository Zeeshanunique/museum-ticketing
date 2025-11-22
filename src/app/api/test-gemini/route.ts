import { NextResponse } from 'next/server';
import { generateChatResponse } from '@/lib/gemini';

export async function GET() {
  try {
    console.log('Testing Gemini API connection...');
    
    const testResponse = await generateChatResponse({
      prompt: "Say hello and introduce yourself as a museum assistant",
      language: 'en',
      history: []
    });
    
    return NextResponse.json({ 
      status: 'success',
      response: testResponse,
      length: testResponse?.length || 0
    });
  } catch (error) {
    console.error('Gemini test error:', error);
    return NextResponse.json({ 
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      hasApiKey: !!process.env.GEMINI_API_KEY
    }, { status: 500 });
  }
}