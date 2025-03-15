
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';
import { Agent } from '../types';
import { useToast } from '@/hooks/use-toast';

interface SpeechPlayerProps {
  text: string;
  agent: Agent;
  autoPlay?: boolean;
}

// Map of agent roles to voice IDs (using standard browser voices initially)
const voiceMap: Record<string, string> = {
  'CEO': 'en-US-AriaNeural', // Female voice
  'CTO': 'en-US-ChristopherNeural', // Male voice
  'CFO': 'en-US-SaraNeural', // Female voice
  'HR': 'en-US-GuyNeural', // Male voice
};

// Personality traits to make voices more distinct and human-like
const personalityTraits: Record<string, {
  rate: number;
  pitch: number;
  pitchVariation: number;
  pauseFrequency: number;
  emphasisWords: string[];
}> = {
  'CEO': {
    rate: 1.05,  // Slightly faster (confident)
    pitch: 1.1,
    pitchVariation: 0.1,
    pauseFrequency: 0.2,
    emphasisWords: ['strategy', 'growth', 'vision', 'objectives', 'performance', 'leadership']
  },
  'CTO': {
    rate: 0.98,  // Slightly slower (thoughtful)
    pitch: 0.95,
    pitchVariation: 0.08,
    pauseFrequency: 0.15,
    emphasisWords: ['technology', 'infrastructure', 'development', 'architecture', 'innovation', 'technical']
  },
  'CFO': {
    rate: 0.97,  // Measured pace (precise)
    pitch: 1.03,
    pitchVariation: 0.05,
    pauseFrequency: 0.25,
    emphasisWords: ['revenue', 'profit', 'cost', 'budget', 'financial', 'investment', 'forecast']
  },
  'HR': {
    rate: 1.02,  // Friendly pace
    pitch: 1.0,
    pitchVariation: 0.12,
    pauseFrequency: 0.3,
    emphasisWords: ['team', 'culture', 'talent', 'hiring', 'employee', 'satisfaction', 'retention']
  }
};

const SpeechPlayer = ({ text, agent, autoPlay = true }: SpeechPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const { toast } = useToast();
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const availableVoicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const previousTextRef = useRef<string>('');
  
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

  // Auto-play speech when text or agent changes
  useEffect(() => {
    // Only auto-play if the text has changed and is not empty
    if (autoPlay && text && text !== previousTextRef.current && voicesLoaded) {
      previousTextRef.current = text;
      handlePlay();
    }
  }, [text, agent, voicesLoaded, autoPlay]);

  // Ensure any ongoing speech is cancelled when component unmounts
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);
  
  // Add natural pauses and emphasis to text for more human-like speech
  const humanizeText = (text: string, role: string): string => {
    const traits = personalityTraits[role];
    if (!traits) return text;
    
    // Add occasional commas to create natural pauses
    let humanizedText = text;
    
    // Emphasize key words based on role
    traits.emphasisWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      humanizedText = humanizedText.replace(regex, `, ${word},`);
    });
    
    // Clean up excessive commas
    humanizedText = humanizedText
      .replace(/,\s*,/g, ',')
      .replace(/,\s*\./g, '.');
    
    return humanizedText;
  };
  
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
      
      // Create a new utterance with humanized text
      const humanizedText = humanizeText(text, agent.role);
      const utterance = new SpeechSynthesisUtterance(humanizedText);
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
      
      // Apply personality traits
      const traits = personalityTraits[agent.role];
      if (traits) {
        // Add slight randomness to rate and pitch for more natural speech
        const randomRateVariation = (Math.random() * 0.06) - 0.03; // -0.03 to +0.03
        const randomPitchVariation = (Math.random() * traits.pitchVariation) - (traits.pitchVariation / 2);
        
        utterance.rate = traits.rate + randomRateVariation;
        utterance.pitch = traits.pitch + randomPitchVariation;
      } else {
        // Default values with slight randomness
        utterance.rate = 1.0 + ((Math.random() * 0.1) - 0.05);
        utterance.pitch = 1.0 + ((Math.random() * 0.1) - 0.05);
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
