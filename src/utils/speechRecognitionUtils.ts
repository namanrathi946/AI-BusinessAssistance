
/**
 * Utilities for handling browser speech recognition
 */

// Check if browser supports speech recognition
export const isSpeechRecognitionSupported = (): boolean => {
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
};

// Get the appropriate speech recognition constructor
export const getSpeechRecognition = (): any => {
  // @ts-ignore - TS doesn't have types for the speech recognition API
  return window.SpeechRecognition || window.webkitSpeechRecognition;
};

// Type for speech recognition callback
export type SpeechRecognitionCallback = (text: string, isFinal: boolean) => void;

/**
 * Starts the speech recognition process
 * @param callback Function to call when speech is recognized
 * @param options Configuration options
 * @returns A function to stop listening
 */
export const startSpeechRecognition = (
  callback: SpeechRecognitionCallback,
  options: {
    continuous?: boolean;
    interimResults?: boolean;
    language?: string;
  } = {}
): (() => void) => {
  if (!isSpeechRecognitionSupported()) {
    console.error('Speech recognition is not supported in this browser');
    return () => {};
  }

  const SpeechRecognition = getSpeechRecognition();
  const recognition = new SpeechRecognition();
  
  // Configure the recognition
  recognition.continuous = options.continuous ?? false;
  recognition.interimResults = options.interimResults ?? true;
  recognition.lang = options.language ?? 'en-US';
  
  // Handle results
  recognition.onresult = (event: any) => {
    const result = event.results[event.results.length - 1];
    const transcript = result[0].transcript;
    const isFinal = result.isFinal;
    
    callback(transcript, isFinal);
  };
  
  // Handle errors
  recognition.onerror = (event: any) => {
    console.error('Speech recognition error', event.error);
  };
  
  // Start listening
  recognition.start();
  
  // Return a function to stop listening
  return () => {
    recognition.stop();
  };
};
