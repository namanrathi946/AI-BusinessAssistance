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

// Map of agent roles to ElevenLabs voice IDs for more humanized speech
const voiceMap: Record<string, string> = {
  'CEO': 'XB0fDUnXU5powFXDhCwa', // Charlotte - authoritative female
  'CTO': 'TX3LPaxmHKxFdv7VOQHJ', // Liam - technical male
  'CFO': 'EXAVITQu4vr4xnSDxMaL', // Sarah - precise female
  'HR': 'iP95p4xoKVk53GoZ742B', // Chris - empathetic male
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

// Function to add natural pauses, breathing, and emphasis to text
const humanizeText = (text: string, role: string): string => {
  const traits = personalityTraits[role];
  if (!traits) return text;
  
  // Add occasional commas to create natural pauses
  let humanizedText = text;
  
  // Add breathing pauses with commas
  if (text.length > 50) {
    const sentences = text.split('. ');
    humanizedText = sentences.join(', . ');
  }
  
  // Emphasize key words based on role
  traits.emphasisWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    humanizedText = humanizedText.replace(regex, `, ${word},`);
  });
  
  // Add occasional hmm/um for naturalness (only at sentence beginnings)
  if (Math.random() < 0.2) {
    const fillers = ['Hmm, ', 'Well, ', 'So, ', 'Actually, ', 'You know, '];
    const randomFiller = fillers[Math.floor(Math.random() * fillers.length)];
    
    // Only add to the beginning of the text
    if (!humanizedText.startsWith(randomFiller)) {
      humanizedText = randomFiller + humanizedText.charAt(0).toLowerCase() + humanizedText.slice(1);
    }
  }
  
  // Clean up excessive commas
  humanizedText = humanizedText
    .replace(/,\s*,/g, ',')
    .replace(/,\s*\./g, '.');
  
  return humanizedText;
};

// Keep track of API key and use fallback if not available
let ELEVEN_LABS_API_KEY: string | null = null;

const SpeechPlayer = ({ text, agent, autoPlay = true }: SpeechPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [useElevenLabs, setUseElevenLabs] = useState(false);
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const previousTextRef = useRef<string>('');
  const isMounted = useRef(true);
  const loadFailedRef = useRef(false);
  
  // Check if speech synthesis is supported
  const isSpeechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  
  // Initialize API key from localStorage if available
  useEffect(() => {
    const savedKey = localStorage.getItem('elevenLabsApiKey');
    if (savedKey) {
      ELEVEN_LABS_API_KEY = savedKey;
      setUseElevenLabs(true);
    }
  }, []);
  
  // Set up cleanup effect
  useEffect(() => {
    // Set the mounted flag
    isMounted.current = true;
    
    // Ensure any ongoing speech is cancelled when the component mounts
    if (isSpeechSupported && !useElevenLabs) {
      try {
        window.speechSynthesis.cancel();
      } catch (error) {
        // Silent error - just to prevent issues in some browsers
      }
    }

    // Clean up event listener and cancel any speech on unmount
    return () => {
      isMounted.current = false;
      if (isSpeechSupported && !useElevenLabs) {
        try {
          window.speechSynthesis.cancel();
        } catch (error) {
          // Silent error - just to prevent issues in some browsers
        }
      }
      // Clean up audio element
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [useElevenLabs]);

  // Auto-play speech when text or agent changes
  useEffect(() => {
    // Only auto-play if the text has changed, is not empty
    if (autoPlay && text && text !== previousTextRef.current && !loadFailedRef.current) {
      previousTextRef.current = text;
      handlePlay();
    }
  }, [text, agent, autoPlay]);
  
  // Function to handle ElevenLabs TTS
  const playWithElevenLabs = async (text: string) => {
    if (!ELEVEN_LABS_API_KEY) {
      // Prompt user for API key if not available
      const apiKey = prompt('Please enter your ElevenLabs API key to enable enhanced voice synthesis:');
      if (apiKey) {
        ELEVEN_LABS_API_KEY = apiKey;
        localStorage.setItem('elevenLabsApiKey', apiKey);
        setUseElevenLabs(true);
      } else {
        // Fall back to browser TTS
        setUseElevenLabs(false);
        playWithBrowserTTS(text);
        return;
      }
    }
    
    setIsLoading(true);
    setIsPlaying(true);
    
    try {
      // Humanize the text for more natural speech patterns
      const humanizedText = humanizeText(text, agent.role);
      
      // Get voice ID based on agent role
      const voiceId = voiceMap[agent.role] || 'iP95p4xoKVk53GoZ742B'; // Fallback to default voice
      
      // Make request to ElevenLabs API
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': ELEVEN_LABS_API_KEY
        },
        body: JSON.stringify({
          text: humanizedText,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.35,
            similarity_boost: 0.75,
            style: 0.3,
            use_speaker_boost: true
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }
      
      // Create a blob from the audio stream
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Create audio element and play
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => {
        if (isMounted.current) {
          setIsPlaying(false);
          setIsLoading(false);
          URL.revokeObjectURL(audioUrl);
        }
      };
      
      audio.onerror = () => {
        if (isMounted.current) {
          setIsPlaying(false);
          setIsLoading(false);
          URL.revokeObjectURL(audioUrl);
          toast({
            title: "Error playing audio",
            description: "Falling back to browser speech synthesis",
            variant: "destructive"
          });
          // Fall back to browser TTS
          setUseElevenLabs(false);
          playWithBrowserTTS(text);
        }
      };
      
      await audio.play();
    } catch (error) {
      console.error('Error with ElevenLabs API:', error);
      setIsPlaying(false);
      setIsLoading(false);
      setUseElevenLabs(false);
      
      toast({
        title: "ElevenLabs API Error",
        description: "Falling back to browser speech synthesis",
        variant: "destructive"
      });
      
      // Fall back to browser TTS
      playWithBrowserTTS(text);
    }
  };
  
  // Function to handle browser TTS
  const playWithBrowserTTS = (text: string) => {
    if (!isSpeechSupported) {
      // Don't show errors for unsupported browsers, just return silently
      return;
    }

    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      // If no text to speak, just return
      if (!text || text.trim() === '') {
        return;
      }
      
      // Create a new utterance with humanized text
      const humanizedText = humanizeText(text, agent.role);
      const utterance = new SpeechSynthesisUtterance(humanizedText);
      speechSynthRef.current = utterance;
      
      // Set up voice based on agent role
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        // Try to find a voice by gender
        let selectedVoice = null;
        
        if (agent.role === 'CEO' || agent.role === 'CFO') {
          // Find female voice
          selectedVoice = voices.find(voice => 
            voice.name.toLowerCase().includes('female') || 
            voice.name.includes('icrosoft') && voice.name.includes('ara')
          );
        } else {
          // Find male voice
          selectedVoice = voices.find(voice => 
            voice.name.toLowerCase().includes('male') || 
            voice.name.includes('icrosoft') && voice.name.includes('avid')
          );
        }
        
        // Fallback to any English voice
        if (!selectedVoice) {
          selectedVoice = voices.find(voice => voice.lang.startsWith('en-'));
        }
        
        // Final fallback - use the first available voice
        if (!selectedVoice && voices.length > 0) {
          selectedVoice = voices[0];
        }
        
        if (selectedVoice) {
          utterance.voice = selectedVoice;
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
      
      utterance.onerror = () => {
        if (isMounted.current) {
          setIsPlaying(false);
          loadFailedRef.current = true;
        }
      };
      
      // Speak the text
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      // If any part of the process fails, disable speech for this session
      loadFailedRef.current = true;
      setIsPlaying(false);
    }
  };
  
  const handlePlay = () => {
    if (loadFailedRef.current) return;
    
    if (useElevenLabs) {
      playWithElevenLabs(text);
    } else {
      playWithBrowserTTS(text);
    }
  };
  
  const handleStop = () => {
    if (useElevenLabs) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    } else if (isSpeechSupported) {
      try {
        window.speechSynthesis.cancel();
      } catch (error) {
        // Silent error - just to prevent issues in some browsers
      }
    }
    setIsPlaying(false);
  };
  
  const handleToggle = () => {
    if (isPlaying) {
      handleStop();
    } else {
      handlePlay();
    }
  };
  
  // Toggle between ElevenLabs and browser TTS
  const toggleVoiceEngine = () => {
    if (!useElevenLabs && !ELEVEN_LABS_API_KEY) {
      const apiKey = prompt('Please enter your ElevenLabs API key to enable enhanced voice synthesis:');
      if (apiKey) {
        ELEVEN_LABS_API_KEY = apiKey;
        localStorage.setItem('elevenLabsApiKey', apiKey);
        setUseElevenLabs(true);
        
        toast({
          title: "Enhanced voices enabled",
          description: "Using ElevenLabs for more natural speech",
        });
      }
    } else {
      setUseElevenLabs(!useElevenLabs);
      
      toast({
        title: useElevenLabs ? "Using browser voices" : "Using enhanced voices",
        description: useElevenLabs ? "Switched to standard browser TTS" : "Switched to ElevenLabs for more natural speech",
      });
    }
  };
  
  // If speech has been marked as failed, don't render the speech button at all
  if (loadFailedRef.current) {
    return null;
  }
  
  return (
    <div className="flex items-center space-x-1">
      <Button 
        variant="ghost" 
        size="icon" 
        className={`h-8 w-8 rounded-full transition-all ${isLoading ? 'animate-pulse' : ''} ${
          useElevenLabs ? 'hover:bg-violet-500/20' : 'hover:bg-primary/20'
        }`}
        onClick={handleToggle}
        title={isPlaying ? "Stop Speaking" : "Play Message"}
        type="button"
        disabled={isLoading}
      >
        {isPlaying ? (
          <VolumeX className={`h-4 w-4 ${useElevenLabs ? 'text-violet-500' : ''}`} />
        ) : (
          <Volume2 className={`h-4 w-4 ${useElevenLabs ? 'text-violet-500' : ''}`} />
        )}
      </Button>
      
      {/* Small indicator to show which voice engine is being used */}
      <Button
        variant="ghost"
        size="sm"
        className={`h-5 px-1 text-[10px] rounded ${useElevenLabs ? 'text-violet-500 hover:bg-violet-500/10' : 'text-muted-foreground hover:bg-primary/10'}`}
        onClick={toggleVoiceEngine}
        title={useElevenLabs ? "Using enhanced voices (ElevenLabs)" : "Using browser voices"}
      >
        {useElevenLabs ? 'HD' : 'STD'}
      </Button>
    </div>
  );
};

export default SpeechPlayer;
