import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Volume2, VolumeX, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChatMessage } from '@/components/ChatMessage';
import { useSpeech } from '@/hooks/useSpeech';
import { getMedicalResponse } from '@/utils/medicalChatbot';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  const [language, setLanguage] = useState('English');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening, 
    speak, 
    stopSpeaking,
    isSpeaking,
    isSupported 
  } = useSpeech();

  // Send initial greeting
  useEffect(() => {
    const greeting = getMedicalResponse('hello', [], language);
    setMessages([{ role: 'assistant', content: greeting }]);
    if (isSpeechEnabled) {
      setTimeout(() => speak(greeting), 500);
    } 
  }, [language]);

  // Handle transcript from voice input
  useEffect(() => {
    if (transcript && !isListening) {
      handleSendMessage(transcript);
    }
  }, [transcript, isListening]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (messageText?: string) => {
    const textToSend = messageText || inputText.trim();
    if (!textToSend) return;

    const userMessage: Message = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    
    // Get AI response
    setTimeout(() => {get_ai_response_direct(textToSend);}, 500);

    
  };

  const get_ai_response_direct = (msg?:string) => {
    var json_msg =

        {"messages":[
          {
              "role": "system",
              "content":"You are an expert in diagnosing illnesses. Diagnose an illness for a patient's symptoms.Diagnosis should consist of one sentence of what the possible illness could be, in one sentence what the patient needs to/ can do , and in one sentence what the patient should not do if there is anything important. Respond in " + language + " language."
          },
          {
              "role": "user",
              "content": msg
          }
      ]
      };
    fetch("https://ai-model-interface.prod-088.workers.dev",
    {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        method: "POST",
        body: JSON.stringify(json_msg)
    })
    .then(response => response.json())
    .then(data => {
      const response = data["result"].response;
      //const response="Response from AI model";
      const assistantMessage: Message = { role: 'assistant', content: response };
      setMessages(prev => [...prev, assistantMessage]);
      
      // Speak the response if enabled
      if (isSpeechEnabled && !isSpeaking) {
        speak(response);
      }
    })
    .catch(function(res){ console.log(res) })
    //return "This is a placeholder response.";
  }

  const get_ai_response = (msg?:string) => {
    var json_msg = {
    "output_type": "chat",
    "input_type": "chat",
    "input_value": msg + "\n Respond in " + language + " language"
    };
    fetch("http://localhost:3000/api/v1/run/98e6b7fa-eb0e-4440-8ef6-4985647617a3",
    {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'x-api-key': 'sk-KCIyDqj5e-H12sU-bcTPgW-cDFxtwfJW9k04xlppWw4'
        },
        method: "POST",
        body: JSON.stringify(json_msg)
    })
    .then(response => response.json())
    .then(data => {
      const response = data["outputs"][0].outputs[0].results.message.data.text;
      //const response="Response from AI model";
      const assistantMessage: Message = { role: 'assistant', content: response };
      setMessages(prev => [...prev, assistantMessage]);
      
      // Speak the response if enabled
      if (isSpeechEnabled && !isSpeaking) {
        speak(response);
      }
    })
    .catch(function(res){ console.log(res) })
    //return "This is a placeholder response.";
  }

  const toggleVoiceInput = () => {
    if (!isSupported) {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in your browser. Please try Chrome or Edge.",
        variant: "destructive"
      });
      return;
    }

    if (isListening) {
      stopListening();
    } else {
            // Stop speaking if currently speaking
      if (isSpeaking) {
        stopSpeaking();
      }
      startListening();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Inno Health</h1>
              <p className="text-xs text-muted-foreground">Voice-enabled AI Health Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-[140px] h-9 bg-background">
                <Languages className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Swahali">Swahali</SelectItem>
                <SelectItem value="Spanish">Español</SelectItem>
                <SelectItem value="French">Français</SelectItem>
                <SelectItem value="German">Deutsch</SelectItem>
                <SelectItem value="Mandarin">中文</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSpeechEnabled(!isSpeechEnabled)}
              className="rounded-full"
            >
              {isSpeechEnabled ? (
                <Volume2 className="w-5 h-5 text-primary" />
              ) : (
                <VolumeX className="w-5 h-5 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto container mx-auto px-4 py-6 max-w-3xl">
        {messages.map((message, index) => (
          <ChatMessage key={index} role={message.role} content={message.content} />
        ))}
        {isSpeaking && (
          <div className="flex gap-2 items-center text-sm text-muted-foreground animate-pulse">
            <Volume2 className="w-4 h-4" />
            <span>Speaking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className="bg-card border-t border-border p-4 sticky bottom-0">
        <div className="container mx-auto max-w-3xl">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={isListening ? "Listening..." : "Type your symptoms or press the mic..."}
                disabled={isListening}
                className="rounded-full bg-background border-2 focus:border-primary transition-colors"
              />
            </div>
            
            <Button
              onClick={toggleVoiceInput}
              size="icon"
              variant={isListening ? "default" : "outline"}
              className={`rounded-full h-12 w-12 ${
                isListening ? 'animate-pulse shadow-lg shadow-primary/50' : ''
              }`}
            >
              {isListening ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </Button>
            
            <Button
              onClick={() => handleSendMessage()}
              size="icon"
              disabled={!inputText.trim()}
              className="rounded-full h-12 w-12 bg-gradient-to-br from-primary to-accent hover:shadow-lg hover:shadow-primary/30 transition-all"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          
          {!isSupported && (
            <p className="text-xs text-destructive text-center mt-2">
              Voice input not supported in this browser. Try Chrome or Edge.
            </p>
          )}
        </div>
      </footer>
    </div>
  );
};

export default Index;

