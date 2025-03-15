
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
  const isMounted = useRef(true);
  
  // Check if speech synthesis is supported
  const isSpeechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  
  // Load voices when component mounts
  useEffect(() => {
    // Set the mounted flag
    isMounted.current = true;
    
    // Function to get and store available voices
    const loadVoices = () => {
      if (!isSpeechSupported || !isMounted.current) return;
      
      try {
        const voices = window.speechSynthesis?.getVoices() || [];
        if (voices.length > 0) {
          availableVoicesRef.current = voices;
          setVoicesLoaded(true);
          console.log(`Loaded ${voices.length} voices`);
        } else {
          console.log('No voices available yet, will retry');
          // If no voices available yet, try again after a delay
          setTimeout(loadVoices, 500);
        }
      } catch (error) {
        console.error('Error loading voices:', error);
      }
    };

    // Load voices initially
    if (isSpeechSupported) {
      loadVoices();
      
      // Ensure any ongoing speech is cancelled when the component mounts
      window.speechSynthesis.cancel();
      
      // Set up event listener for when voices change/become available
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Clean up event listener and cancel any speech on unmount
    return () => {
      isMounted.current = false;
      if (isSpeechSupported) {
        window.speechSynthesis.onvoiceschanged = null;
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Auto-play speech when text or agent changes
  useEffect(() => {
    // Only auto-play if the text has changed, is not empty, and voices are loaded
    if (autoPlay && text && text !== previousTextRef.current && voicesLoaded && isSpeechSupported) {
      previousTextRef.current = text;
      handlePlay();
    }
  }, [text, agent, voicesLoaded, autoPlay]);

  // Ensure any ongoing speech is cancelled when component unmounts
  useEffect(() => {
    return () => {
      if (isSpeechSupported) {
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
    if (!isSpeechSupported) {
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
      setIsPlaying(false);
      
      // If no text to speak, just return
      if (!text || text.trim() === '') {
        return;
      }
      
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
        
        // Final fallback - use the first available voice
        const finalFallbackVoice = voices[0];
        
        // Set the voice if found, otherwise use default
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        } else if (fallbackVoice) {
          utterance.voice = fallbackVoice;
        } else if (lastResortVoice) {
          utterance.voice = lastResortVoice;
        } else if (finalFallbackVoice) {
          utterance.voice = finalFallbackVoice;
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
      utterance.onstart = () => {
        if (isMounted.current) {
          setIsPlaying(true);
        }
      };
      
      utterance.onend = () => {
        if (isMounted.current) {
          setIsPlaying(false);
        }
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        if (isMounted.current) {
          setIsPlaying(false);
          toast({
            title: "Speech Issue",
            description: "Voice had trouble playing. Try toggling again.",
            variant: "destructive",
          });
        }
      };
      
      // Play the speech
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Speech player error:', error);
      setIsPlaying(false);
      toast({
        title: "Speech Error",
        description: "An error occurred while trying to play speech.",
        variant: "destructive",
      });
    }
  };
  
  const handleStop = () => {
    if (isSpeechSupported) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };
  
  const handleToggle = () => {
    if (isPlaying) {
      handleStop();
    } else {
      handlePlay();
    }
  };
  
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="h-8 w-8 rounded-full hover:bg-primary/20 transition-all"
      onClick={handleToggle}
      title={isPlaying ? "Stop Speaking" : "Play Message"}
      type="button"
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
