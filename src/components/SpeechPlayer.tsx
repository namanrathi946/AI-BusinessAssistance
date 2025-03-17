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

// Enhanced map of agent roles to ElevenLabs voice IDs for more humanized speech
const voiceMap: Record<string, string> = {
  'CEO': 'XB0fDUnXU5powFXDhCwa', // Charlotte - authoritative female with confident tone
  'CTO': 'TX3LPaxmHKxFdv7VOQHJ', // Liam - technical male with analytical delivery
  'CFO': 'EXAVITQu4vr4xnSDxMaL', // Sarah - precise female with measured cadence
  'HR': 'iP95p4xoKVk53GoZ742B', // Chris - empathetic male with warm tone
};

// Enhanced personality traits to make voices more distinct and human-like
const personalityTraits: Record<string, {
  rate: number;
  pitch: number;
  pitchVariation: number;
  pauseFrequency: number;
  emphasisWords: string[];
  speechPatterns: {
    fillers: string[];
    thinkingPhrases: string[];
    roleSpecificTerms: string[];
    midSentenceReformulations: string[];
  };
  emotionalCues: {
    positive: string[];
    negative: string[];
    neutral: string[];
  };
}> = {
  'CEO': {
    rate: 1.05,  // Slightly faster (confident)
    pitch: 1.1,
    pitchVariation: 0.12,
    pauseFrequency: 0.2,
    emphasisWords: ['strategy', 'growth', 'vision', 'objectives', 'performance', 'leadership', 'market', 'competitive', 'innovation'],
    speechPatterns: {
      fillers: ['Well,', 'Look,', 'Frankly,', 'To be honest,', 'From my perspective,'],
      thinkingPhrases: ['Let me think about this...', 'Consider our position here...', 'If we look at the bigger picture...'],
      roleSpecificTerms: ['board', 'shareholders', 'strategic', 'executive', 'market cap', 'competitive landscape'],
      midSentenceReformulations: ['—what I mean is', '—let me rephrase that', '—to put it differently']
    },
    emotionalCues: {
      positive: ['I\'m excited about', 'I\'m confident that', 'This is a tremendous opportunity'],
      negative: ['I\'m concerned about', 'We need to be cautious about', 'This presents a challenge'],
      neutral: ['Let\'s analyze', 'We should consider', 'It\'s worth noting']
    }
  },
  'CTO': {
    rate: 0.98,  // Slightly slower (thoughtful)
    pitch: 0.95,
    pitchVariation: 0.08,
    pauseFrequency: 0.25,
    emphasisWords: ['technology', 'infrastructure', 'development', 'architecture', 'innovation', 'technical', 'system', 'scalability', 'security'],
    speechPatterns: {
      fillers: ['So,', 'Actually,', 'Technically speaking,', 'From an engineering standpoint,', 'If you consider the architecture,'],
      thinkingPhrases: ['Let me think through this...', 'The technical implications are...', 'If we architect it properly...'],
      roleSpecificTerms: ['codebase', 'deployment', 'APIs', 'backend', 'frontend', 'latency', 'throughput'],
      midSentenceReformulations: ['—let me get more specific', '—to simplify this concept', '—in technical terms']
    },
    emotionalCues: {
      positive: ['I\'m optimistic about the technical approach', 'The solution is elegant', 'This is technically sound'],
      negative: ['I have technical concerns about', 'This could introduce complexity', 'The implementation might be challenging'],
      neutral: ['From a technical perspective', 'We should evaluate', 'Let\'s consider the architecture']
    }
  },
  'CFO': {
    rate: 0.97,  // Measured pace (precise)
    pitch: 1.03,
    pitchVariation: 0.05,
    pauseFrequency: 0.25,
    emphasisWords: ['revenue', 'profit', 'cost', 'budget', 'financial', 'investment', 'forecast', 'ROI', 'margin', 'capital'],
    speechPatterns: {
      fillers: ['From a financial perspective,', 'If we analyze the numbers,', 'Looking at our financials,', 'Considering the budget,'],
      thinkingPhrases: ['Let me crunch the numbers...', 'From a cost-benefit standpoint...', 'If we project the financials...'],
      roleSpecificTerms: ['quarterly', 'fiscal year', 'balance sheet', 'cash flow', 'liabilities', 'assets', 'depreciation'],
      midSentenceReformulations: ['—let me be more precise', '—to be exact', '—if we look at the exact figures']
    },
    emotionalCues: {
      positive: ['The financial outlook is promising', 'This would improve our margins', 'The ROI is attractive'],
      negative: ['I\'m cautious about the financial impact', 'The cost structure concerns me', 'This poses a financial risk'],
      neutral: ['We should analyze the financial implications', 'Let\'s review the numbers', 'From a budgetary perspective']
    }
  },
  'HR': {
    rate: 1.02,  // Friendly pace
    pitch: 1.0,
    pitchVariation: 0.12,
    pauseFrequency: 0.3,
    emphasisWords: ['team', 'culture', 'talent', 'hiring', 'employee', 'satisfaction', 'retention', 'development', 'wellbeing', 'morale'],
    speechPatterns: {
      fillers: ['From a people perspective,', 'When we think about our team,', 'In terms of our culture,', 'Considering employee experience,'],
      thinkingPhrases: ['Let\'s consider the human element...', 'From a cultural standpoint...', 'If we focus on our people...'],
      roleSpecificTerms: ['engagement', 'retention', 'onboarding', 'work-life balance', 'company culture', 'talent acquisition'],
      midSentenceReformulations: ['—what matters for our people is', '—from an employee perspective', '—to put it in human terms']
    },
    emotionalCues: {
      positive: ['I\'m enthusiastic about the team impact', 'This would boost morale', 'The cultural benefits are significant'],
      negative: ['I\'m concerned about employee reception', 'This might affect team dynamics', 'We should consider the human cost'],
      neutral: ['Let\'s think about the people aspect', 'From a talent perspective', 'Considering our culture']
    }
  }
};

// Function to add natural pauses, breathing, and emphasis to text with more sophisticated human speech patterns
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
  
  // Add occasional role-specific phrases, terms, and speech patterns
  if (Math.random() < 0.3) {
    // Add thinking phrases occasionally (like someone processing their thoughts)
    const thinkingPhrases = traits.speechPatterns.thinkingPhrases;
    const randomThinkingPhrase = thinkingPhrases[Math.floor(Math.random() * thinkingPhrases.length)];
    
    // Find a good spot to insert the thinking phrase (after a period or comma)
    const sentenceSplits = humanizedText.split('. ');
    if (sentenceSplits.length > 1) {
      const insertIndex = Math.floor(Math.random() * (sentenceSplits.length - 1)) + 1;
      sentenceSplits[insertIndex] = `${randomThinkingPhrase} ${sentenceSplits[insertIndex]}`;
      humanizedText = sentenceSplits.join('. ');
    }
  }
  
  // Add occasional hmm/um/fillers for naturalness (at sentence beginnings)
  if (Math.random() < 0.35) {
    const fillers = traits.speechPatterns.fillers;
    const randomFiller = fillers[Math.floor(Math.random() * fillers.length)];
    
    // Only add to the beginning of the text or after a period
    const sentences = humanizedText.split('. ');
    if (sentences.length > 1) {
      const insertIndex = Math.floor(Math.random() * sentences.length);
      if (insertIndex === 0) {
        sentences[insertIndex] = `${randomFiller} ${sentences[insertIndex].charAt(0).toLowerCase() + sentences[insertIndex].slice(1)}`;
      } else {
        sentences[insertIndex] = `${randomFiller} ${sentences[insertIndex]}`;
      }
      humanizedText = sentences.join('. ');
    } else if (!humanizedText.startsWith(randomFiller)) {
      humanizedText = `${randomFiller} ${humanizedText.charAt(0).toLowerCase() + humanizedText.slice(1)}`;
    }
  }
  
  // Add occasional mid-sentence reformulations (like people do when speaking naturally)
  if (Math.random() < 0.25 && text.length > 100) {
    const reformulations = traits.speechPatterns.midSentenceReformulations;
    const randomReformulation = reformulations[Math.floor(Math.random() * reformulations.length)];
    
    const words = humanizedText.split(' ');
    if (words.length > 10) {
      // Find a spot in the middle of a sentence to insert reformulation
      const insertIndex = Math.floor(words.length / 2) + Math.floor(Math.random() * 5) - 2;
      if (insertIndex > 0 && insertIndex < words.length - 1) {
        words[insertIndex] = `${words[insertIndex]} ${randomReformulation}`;
        humanizedText = words.join(' ');
      }
    }
  }
  
  // Add emotional cues occasionally
  if (Math.random() < 0.3) {
    const emotions = [
      ...traits.emotionalCues.positive,
      ...traits.emotionalCues.negative,
      ...traits.emotionalCues.neutral
    ];
    const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    
    if (Math.random() < 0.5 && !humanizedText.includes(randomEmotion)) {
      // Add at the beginning
      humanizedText = `${randomEmotion}, ${humanizedText.charAt(0).toLowerCase() + humanizedText.slice(1)}`;
    } else {
      // Add in the middle of the text
      const sentences = humanizedText.split('. ');
      if (sentences.length > 1) {
        const insertIndex = Math.floor(Math.random() * (sentences.length - 1)) + 1;
        sentences[insertIndex] = `${randomEmotion} ${sentences[insertIndex]}`;
        humanizedText = sentences.join('. ');
      }
    }
  }
  
  // Clean up excessive commas and normalize punctuation
  humanizedText = humanizedText
    .replace(/,\s*,/g, ',')
    .replace(/,\s*\./g, '.')
    .replace(/\.\s*,/g, '.')
    .replace(/\.\s*\./g, '.')
    .replace(/\s+/g, ' ');
  
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
    
    // Make request to ElevenLabs API with enhanced voice settings
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
          stability: 0.30,  // Slightly less stable for more natural variations
          similarity_boost: 0.65,  // Balance between accuracy and expressiveness
          style: 0.4,  // Slightly more stylistic to emphasize role personality
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
    
    // Create a new utterance with enhanced humanized text
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
    
    // Apply enhanced personality traits with more natural variations
    const traits = personalityTraits[agent.role];
    if (traits) {
      // Add more randomness to rate and pitch for more natural speech
      const randomRateVariation = (Math.random() * 0.1) - 0.05; // -0.05 to +0.05
      const randomPitchVariation = (Math.random() * traits.pitchVariation) - (traits.pitchVariation / 2);
      
      // Add slight variations in volume for more human-like delivery
      utterance.rate = traits.rate + randomRateVariation;
      utterance.pitch = traits.pitch + randomPitchVariation;
      utterance.volume = 0.9 + (Math.random() * 0.2); // 0.9 to 1.1
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
