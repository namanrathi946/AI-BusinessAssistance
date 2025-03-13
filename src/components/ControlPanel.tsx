
import React from 'react';
import { cn } from '@/lib/utils';
import { 
  Mic, MicOff, MessageSquareText, Download, 
  XCircle, PauseCircle, PlayCircle
} from 'lucide-react';

interface ControlPanelProps {
  onToggleTranscript: () => void;
  transcriptVisible: boolean;
  onExportChat: () => void;
  meetingStatus: 'initializing' | 'active' | 'paused' | 'ended';
  onToggleStatus: () => void;
  onEndMeeting: () => void;
}

const ControlPanel = ({
  onToggleTranscript,
  transcriptVisible,
  onExportChat,
  meetingStatus,
  onToggleStatus,
  onEndMeeting
}: ControlPanelProps) => {
  const isActive = meetingStatus === 'active';
  
  return (
    <div className="glass-panel p-4 flex items-center justify-center gap-4 animate-slide-up">
      {/* Mute/Unmute Toggle (simulated) */}
      <button 
        className="control-button group"
        disabled={meetingStatus === 'ended'}
      >
        {true ? <Mic size={20} /> : <MicOff size={20} />}
        <span className="control-button-label">Mute</span>
      </button>
      
      {/* Transcript Toggle */}
      <button 
        className={cn(
          "control-button group",
          transcriptVisible && "bg-meeting-blue/10 text-meeting-blue"
        )}
        onClick={onToggleTranscript}
        disabled={meetingStatus === 'ended'}
      >
        <MessageSquareText size={20} />
        <span className="control-button-label">
          {transcriptVisible ? 'Hide Transcript' : 'Show Transcript'}
        </span>
      </button>
      
      {/* Pause/Resume Toggle */}
      <button 
        className={cn(
          "control-button group",
          !isActive && meetingStatus !== 'ended' && "bg-meeting-yellow/10 text-meeting-yellow"
        )}
        onClick={onToggleStatus}
        disabled={meetingStatus === 'ended'}
      >
        {isActive ? <PauseCircle size={20} /> : <PlayCircle size={20} />}
        <span className="control-button-label">
          {isActive ? 'Pause' : 'Resume'}
        </span>
      </button>
      
      {/* Export Chat */}
      <button 
        className="control-button group"
        onClick={onExportChat}
      >
        <Download size={20} />
        <span className="control-button-label">Export</span>
      </button>
      
      {/* End Meeting */}
      <button 
        className="control-button danger group"
        onClick={onEndMeeting}
        disabled={meetingStatus === 'ended'}
      >
        <XCircle size={20} />
        <span className="control-button-label">End</span>
      </button>
    </div>
  );
};

export default ControlPanel;
