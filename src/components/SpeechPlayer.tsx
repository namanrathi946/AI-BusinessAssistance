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

// Keep track of voice loading state globally
let voicesLoaded = false;
let availableVoices: SpeechSynthesisVoice[] = [];

// Load voices once when module initializes
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  const loadVoices = () => {
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      availableVoices = voices;
      voicesLoaded = true;
      console.log(`Loaded ${voices.length} voices`);
    }
  };
  
  // Load voices initially
  loadVoices();
  
  // Set up event listener for when voices change/become available
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

const SpeechPlayer = ({ text, agent, autoPlay = true }: SpeechPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const previousTextRef = useRef<string>('');
  const isMounted = useRef(true);
  const loadFailedRef = useRef(false);
  
  // Check if speech synthesis is supported
  const isSpeechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  
  // Set up cleanup effect
  useEffect(() => {
    // Set the mounted flag
    isMounted.current = true;
    
    // Ensure any ongoing speech is cancelled when the component mounts
    if (isSpeechSupported) {
      try {
        window.speechSynthesis.cancel();
      } catch (error) {
        // Silent error - just to prevent issues in some browsers
      }
    }

    // Clean up event listener and cancel any speech on unmount
    return () => {
      isMounted.current = false;
      if (isSpeechSupported) {
        try {
          window.speechSynthesis.cancel();
        } catch (error) {
          // Silent error - just to prevent issues in some browsers
        }
      }
    };
  }, []);

  // Auto-play speech when text or agent changes
  useEffect(() => {
    // Only auto-play if the text has changed, is not empty, and voices are loaded
    if (autoPlay && text && text !== previousTextRef.current && voicesLoaded && isSpeechSupported && !loadFailedRef.current) {
      previousTextRef.current = text;
      handlePlay();
    }
  }, [text, agent, autoPlay]);
  
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
      // Don't show errors for unsupported browsers, just return silently
      return;
    }

    if (loadFailedRef.current) {
      return; // Don't try again if we've already failed
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
      if (availableVoices && availableVoices.length > 0) {
        // Try to find a voice that matches the preferred voice for this agent
        const preferredVoice = availableVoices.find(voice => 
          voice.name.includes(voiceMap[agent.role] || '')
        );
        
        // Fallback to a voice based on gender (for CEO/CFO use female, for CTO/HR use male)
        const fallbackVoice = availableVoices.find(voice => {
          if (agent.role === 'CEO' || agent.role === 'CFO') {
            return voice.name.toLowerCase().includes('female');
          } else {
            return voice.name.toLowerCase().includes('male');
          }
        });
        
        // Last resort fallback - just use any English voice
        const lastResortVoice = availableVoices.find(voice => 
          voice.lang.startsWith('en-')
        );
        
        // Final fallback - use the first available voice
        const finalFallbackVoice = availableVoices[0];
        
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
        if (isMounted.current) {
          setIsPlaying(false);
          
          // Mark as failed so we don't keep trying
          loadFailedRef.current = true;
          
          // Don't show toast errors for speech synthesis issues to avoid spamming users
          console.warn('Speech synthesis error - disabling autoplay for this session');
        }
      };
      
      // Wrap speech in try-catch to handle any potential errors
      try {
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        // If speech fails, silently disable for this session
        loadFailedRef.current = true;
        setIsPlaying(false);
      }
    } catch (error) {
      // If any part of the process fails, disable speech for this session
      loadFailedRef.current = true;
      setIsPlaying(false);
    }
  };
  
  const handleStop = () => {
    if (isSpeechSupported) {
      try {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
      } catch (error) {
        // Silent error - just to prevent issues in some browsers
      }
    }
  };
  
  const handleToggle = () => {
    if (isPlaying) {
      handleStop();
    } else {
      handlePlay();
    }
  };
  
  // If speech has been marked as failed, don't render the speech button at all
  if (loadFailedRef.current) {
    return null;
  }
  
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
