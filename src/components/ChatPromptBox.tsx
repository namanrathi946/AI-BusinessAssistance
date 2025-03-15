
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, Send, X } from 'lucide-react';
import { useSpeechInput } from '../utils/speechRecognitionUtils';
import { toast } from '@/hooks/use-toast';

interface ChatPromptBoxProps {
  onSend: (message: string) => void;
  onClose: () => void;
  placeholder?: string;
}

const ChatPromptBox = ({ onSend, onClose, placeholder = "Type a message or use voice input..." }: ChatPromptBoxProps) => {
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [tempTranscript, setTempTranscript] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { startListening, stopListening, isSupported } = useSpeechInput();
  
  // Focus textarea when component mounts
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);
  
  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim());
      setMessage('');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };
  
  const toggleVoiceInput = () => {
    if (isListening) {
      stopListening();
      setIsListening(false);
      setTempTranscript('');
      return;
    }
    
    if (!isSupported) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support voice input. Please use a modern browser like Chrome.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    setIsListening(true);
    setTempTranscript('Listening...');
    
    startListening(
      (text) => {
        setTempTranscript(text);
      },
      (finalText) => {
        setMessage(prev => prev + (prev ? ' ' : '') + finalText);
        setTempTranscript('');
        setIsListening(false);
      }
    );
  };
  
  return (
    <div className="glass-panel p-3 rounded-lg animate-slide-up">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium">Meeting Chat</span>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {isListening && tempTranscript && (
        <div className="text-sm italic text-muted-foreground mb-2 p-2 border border-dashed rounded bg-muted/40">
          {tempTranscript}
        </div>
      )}
      
      <div className="flex gap-2">
        <Textarea
          ref={textareaRef}
          placeholder={placeholder}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          className="min-h-[60px] resize-none flex-1"
        />
        
        <div className="flex flex-col gap-2">
          {isSupported && (
            <Button
              type="button"
              variant={isListening ? "destructive" : "outline"}
              size="sm"
              onClick={toggleVoiceInput}
              className="px-2 py-1 h-7"
              title={isListening ? "Stop listening" : "Voice input"}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          )}
          
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleSend}
            className="px-2 py-1 h-7"
            disabled={!message.trim()}
            title="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatPromptBox;
