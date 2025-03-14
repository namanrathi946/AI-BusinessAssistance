
import React, { useState, useRef } from 'react';
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
  const { toast } = useToast();
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  const handlePlay = () => {
    if ('speechSynthesis' in window) {
      try {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();
        
        // Create a new utterance
        const utterance = new SpeechSynthesisUtterance(text);
        speechSynthRef.current = utterance;
        
        // Get available voices
        const voices = window.speechSynthesis.getVoices();
        
        // Set up voice based on agent role
        if (voices && voices.length > 0) {
          // Try to find a voice that matches the preferred voice for this agent
          const preferredVoice = voices.find(voice => 
            voice.name.includes(voiceMap[agent.role] || '')
          );
          
          // Fallback to any voice that matches the agent's role (male/female)
          const fallbackVoice = voices.find(voice => 
            agent.role === 'CEO' || agent.role === 'CFO' 
              ? voice.name.includes('female') || voice.name.includes('Female')
              : voice.name.includes('male') || voice.name.includes('Male')
          );
          
          // Set the voice if found, otherwise use default
          if (preferredVoice) {
            utterance.voice = preferredVoice;
          } else if (fallbackVoice) {
            utterance.voice = fallbackVoice;
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
    } else {
      toast({
        title: "Speech Not Supported",
        description: "Text-to-speech is not supported in your browser.",
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
