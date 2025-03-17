
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { MeetingState } from '../types';
import { 
  MessageSquare, Download, PauseCircle, PlayCircle, PhoneOff, BarChart2, 
  Database, Users, Mic, Video, VideoOff, MicOff, Share2, Layout, 
  MoreHorizontal, Clock, Shield
} from 'lucide-react';
import ChatPromptBox from './ChatPromptBox';
import { toast } from '@/hooks/use-toast';
import { isSpeechRecognitionSupported } from '../utils/speechRecognitionUtils';
import { cn } from '@/lib/utils';

interface ControlPanelProps {
  onToggleTranscript: () => void;
  transcriptVisible: boolean;
  onToggleBusinessData?: () => void;
  businessDataVisible?: boolean;
  onExportChat: () => void;
  meetingStatus: MeetingState['status'];
  onToggleStatus: () => void;
  onEndMeeting: () => void;
  onUploadDataset?: () => void;
  onStartDiscussion?: () => void;
  hasBusinessData?: boolean;
  onSendChatMessage?: (message: string) => void;
}

const ControlPanel = ({
  onToggleTranscript,
  transcriptVisible,
  onToggleBusinessData,
  businessDataVisible = false,
  onExportChat,
  meetingStatus,
  onToggleStatus,
  onEndMeeting,
  onUploadDataset,
  onStartDiscussion,
  hasBusinessData = false,
  onSendChatMessage
}: ControlPanelProps) => {
  const isActive = meetingStatus === 'active';
  const isMeetingOngoing = meetingStatus === 'active' || meetingStatus === 'paused';
  const [showChatPrompt, setShowChatPrompt] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  
  const handleSendChatMessage = (message: string) => {
    if (onSendChatMessage) {
      onSendChatMessage(message);
      toast({
        title: "Message Sent",
        description: "Your message has been sent to the discussion.",
        duration: 2000,
      });
    } else {
      toast({
        title: "Not Implemented",
        description: "Chat functionality is not fully implemented yet.",
        duration: 3000,
      });
    }
    setShowChatPrompt(false);
  };

  // Meeting duration display
  const getMeetingDuration = () => {
    // This would be dynamic in a real app
    return "00:24";
  };
  
  // Video conference style control bar
  return (
    <div className="bg-meeting-dark rounded-b-lg text-white py-3 px-4">
      <div className="flex justify-between items-center">
        {/* Left section - Meeting info */}
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>{getMeetingDuration()}</span>
          </div>
          <div className="hidden md:block">
            <span>Team Meeting</span>
          </div>
        </div>
        
        {/* Center section - Main controls */}
        <div className="flex items-center justify-center space-x-2">
          {/* Audio toggle */}
          <button 
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={cn(
              "control-button group",
              !audioEnabled && "bg-red-600 hover:bg-red-700"
            )}
            title={audioEnabled ? "Mute" : "Unmute"}
          >
            {audioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            <span className="control-button-label">
              {audioEnabled ? "Mute" : "Unmute"}
            </span>
          </button>
          
          {/* Video toggle */}
          <button 
            onClick={() => setVideoEnabled(!videoEnabled)}
            className={cn(
              "control-button group",
              !videoEnabled && "bg-red-600 hover:bg-red-700"
            )}
            title={videoEnabled ? "Stop Video" : "Start Video"}
          >
            {videoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            <span className="control-button-label">
              {videoEnabled ? "Stop Video" : "Start Video"}
            </span>
          </button>
          
          {/* Participants */}
          <button 
            onClick={onStartDiscussion}
            className="control-button group"
            title="Participants"
          >
            <Users className="h-5 w-5" />
            <span className="control-button-label">Participants</span>
          </button>
          
          {/* Chat */}
          <button 
            onClick={() => setShowChatPrompt(prev => !prev)}
            className={cn(
              "control-button group",
              showChatPrompt && "bg-blue-600 hover:bg-blue-700"
            )}
            title="Chat"
          >
            <MessageSquare className="h-5 w-5" />
            <span className="control-button-label">Chat</span>
          </button>
          
          {/* Share Screen */}
          <button 
            className="control-button group"
            title="Share Screen"
            onClick={onToggleBusinessData}
          >
            <Share2 className="h-5 w-5" />
            <span className="control-button-label">Share</span>
          </button>
          
          {/* Meeting Controls */}
          {isMeetingOngoing && (
            <button
              onClick={onToggleStatus}
              className={cn(
                "control-button group",
                !isActive && "bg-blue-600 hover:bg-blue-700"
              )}
              title={isActive ? "Pause Meeting" : "Resume Meeting"}
            >
              {isActive ? <PauseCircle className="h-5 w-5" /> : <PlayCircle className="h-5 w-5" />}
              <span className="control-button-label">
                {isActive ? "Pause" : "Resume"}
              </span>
            </button>
          )}
          
          {/* More options */}
          <button 
            className="control-button group"
            title="More Options"
          >
            <MoreHorizontal className="h-5 w-5" />
            <span className="control-button-label">More</span>
          </button>
        </div>
        
        {/* Right section - End call */}
        <div>
          <button
            onClick={onEndMeeting}
            className="control-button danger group"
            title="End Meeting"
          >
            <PhoneOff className="h-5 w-5" />
            <span className="control-button-label">End</span>
          </button>
        </div>
      </div>
      
      {/* Chat Prompt Overlay */}
      {showChatPrompt && (
        <div className="absolute bottom-20 right-4 left-4 md:left-auto md:w-80 z-10">
          <ChatPromptBox 
            onSend={handleSendChatMessage} 
            onClose={() => setShowChatPrompt(false)}
            placeholder="Type your message or use voice input..."
          />
        </div>
      )}
    </div>
  );
};

export default ControlPanel;
