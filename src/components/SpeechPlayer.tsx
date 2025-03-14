
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';
import { Agent } from '../types';
import { useToast } from '@/hooks/use-toast';

interface SpeechPlayerProps {
  text: string;
  agent: Agent;
}

// Map of agent roles to voice IDs (using standard browser voices initially)
const voiceMap: Record<string, string> = {
  'CEO': 'en-US-AriaNeural', // Female voice
  'CTO': 'en-US-ChristopherNeural', // Male voice
  'CFO': 'en-US-SaraNeural', // Female voice
  'HR': 'en-US-GuyNeural', // Male voice
};

const SpeechPlayer = ({ text, agent }: SpeechPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const { toast } = useToast();
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const availableVoicesRef = useRef<SpeechSynthesisVoice[]>([]);
  
  // Load voices when component mounts
  useEffect(() => {
    // Function to get and store available voices
    const loadVoices = () => {
      const voices = window.speechSynthesis?.getVoices() || [];
      if (voices.length > 0) {
        availableVoicesRef.current = voices;
        setVoicesLoaded(true);
      }
    };

    // Load voices initially
    loadVoices();

    // Set up event listener for when voices change/become available
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Clean up event listener
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Ensure any ongoing speech is cancelled when component unmounts
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);
  
  const handlePlay = () => {
    if (!('speechSynthesis' in window)) {
      toast({
        title: "Speech Not Supported",
        description: "Text-to-speech is not supported in your browser.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      // Create a new utterance
      const utterance = new SpeechSynthesisUtterance(text);
      speechSynthRef.current = utterance;
      
      // Set up voice based on agent role
      const voices = availableVoicesRef.current;
      
      if (voices && voices.length > 0) {
        // Try to find a voice that matches the preferred voice for this agent
        const preferredVoice = voices.find(voice => 
          voice.name.includes(voiceMap[agent.role] || '')
        );
        
        // Fallback to a voice based on gender (for CEO/CFO use female, for CTO/HR use male)
        const fallbackVoice = voices.find(voice => {
          if (agent.role === 'CEO' || agent.role === 'CFO') {
            return voice.name.toLowerCase().includes('female');
          } else {
            return voice.name.toLowerCase().includes('male');
          }
        });
        
        // Last resort fallback - just use any English voice
        const lastResortVoice = voices.find(voice => 
          voice.lang.startsWith('en-')
        );
        
        // Set the voice if found, otherwise use default
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        } else if (fallbackVoice) {
          utterance.voice = fallbackVoice;
        } else if (lastResortVoice) {
          utterance.voice = lastResortVoice;
        }
      }
      
      // Set the rate and pitch slightly based on agent
      switch (agent.role) {
        case 'CEO':
          utterance.rate = 1.0;
          utterance.pitch = 1.1;
          break;
        case 'CTO':
          utterance.rate = 1.0;
          utterance.pitch = 0.9;
          break;
        case 'CFO':
          utterance.rate = 0.95;
          utterance.pitch = 1.0;
          break;
        case 'HR':
          utterance.rate = 1.05;
          utterance.pitch = 1.0;
          break;
        default:
          utterance.rate = 1.0;
          utterance.pitch = 1.0;
      }
      
      // Set event handlers
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsPlaying(false);
        toast({
          title: "Speech Error",
          description: "Unable to play speech. Please try again.",
          variant: "destructive",
        });
      };
      
      // Play the speech
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Speech player error:', error);
      toast({
        title: "Speech Error",
        description: "An error occurred while trying to play speech.",
        variant: "destructive",
      });
    }
  };
  
  const handleStop = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };
  
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="h-8 w-8 rounded-full hover:bg-primary/20 transition-all"
      onClick={isPlaying ? handleStop : handlePlay}
      title={isPlaying ? "Stop Speaking" : "Play Message"}
    >
      {isPlaying ? (
        <VolumeX className="h-4 w-4" />
      ) : (
        <Volume2 className="h-4 w-4" />
      )}
    </Button>
  );
};

export default SpeechPlayer;
