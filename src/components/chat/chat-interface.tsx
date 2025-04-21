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
              </div>
            ))}
            {isLoading && (
              <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                <p className="text-sm text-gray-500 flex items-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {getTypingText()}
                </p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        <div className="flex gap-2">
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={getPlaceholder()}
            className="flex-grow"
            disabled={isLoading}
          />
          <Button 
            onClick={handleSend} 
            disabled={isLoading || !input.trim()}
          >
            {getSendButtonText()}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
