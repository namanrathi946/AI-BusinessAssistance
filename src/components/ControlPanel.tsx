
import React from 'react';
import { Button } from "@/components/ui/button";
import { MeetingState } from '../types';
import { MessageSquare, Download, PauseCircle, PlayCircle, PhoneOff, BarChart2, Upload, Database } from 'lucide-react';

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
  onUploadDataset
}: ControlPanelProps) => {
  const isActive = meetingStatus === 'active';
  const isMeetingOngoing = meetingStatus === 'active' || meetingStatus === 'paused';
  
  return (
    <div className="glass-panel p-4 flex flex-wrap justify-between items-center gap-2 animate-fade-in">
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleTranscript}
          className={transcriptVisible ? 'bg-secondary/50' : ''}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          {transcriptVisible ? 'Hide Transcript' : 'Show Transcript'}
        </Button>
        
        {onToggleBusinessData && (
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleBusinessData}
            className={businessDataVisible ? 'bg-secondary/50' : ''}
          >
            <BarChart2 className="h-4 w-4 mr-2" />
            {businessDataVisible ? 'Hide Business Data' : 'Show Business Data'}
          </Button>
        )}
        
        {onUploadDataset && (
          <Button
            variant="outline"
            size="sm"
            onClick={onUploadDataset}
          >
            <Database className="h-4 w-4 mr-2" />
            Upload Business Data
          </Button>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={onExportChat}
        >
          <Download className="h-4 w-4 mr-2" />
          Export Chat
        </Button>
      </div>
      
      <div className="flex gap-2">
        {isMeetingOngoing && (
          <Button
            variant={isActive ? "secondary" : "default"}
            size="sm"
            onClick={onToggleStatus}
          >
            {isActive ? (
              <>
                <PauseCircle className="h-4 w-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <PlayCircle className="h-4 w-4 mr-2" />
                Resume
              </>
            )}
          </Button>
        )}
        
        <Button
          variant="destructive"
          size="sm"
          onClick={onEndMeeting}
          disabled={meetingStatus === 'ended'}
        >
          <PhoneOff className="h-4 w-4 mr-2" />
          End Meeting
        </Button>
      </div>
    </div>
  );
};

export default ControlPanel;
