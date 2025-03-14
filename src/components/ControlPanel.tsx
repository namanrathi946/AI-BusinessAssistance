
import React from 'react';
import { Button } from "@/components/ui/button";
import { MeetingState } from '../types';
import { MessageSquare, Download, PauseCircle, PlayCircle, PhoneOff, BarChart2, Database, Play, Users } from 'lucide-react';

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
  hasBusinessData = false
}: ControlPanelProps) => {
  const isActive = meetingStatus === 'active';
  const isMeetingOngoing = meetingStatus === 'active' || meetingStatus === 'paused';
  
  return (
    <div className="glass-panel p-4 flex flex-wrap justify-between items-center gap-2 animate-fade-in hover:shadow-lg transition-all duration-300">
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleTranscript}
          className={`transition-all duration-200 hover:scale-105 ${transcriptVisible ? 'bg-secondary/50 border-primary/30' : ''}`}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          {transcriptVisible ? 'Hide Transcript' : 'Show Transcript'}
        </Button>
        
        {onToggleBusinessData && (
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleBusinessData}
            className={`transition-all duration-200 hover:scale-105 ${businessDataVisible ? 'bg-secondary/50 border-primary/30' : ''}`}
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
            className="hover:bg-blue-100/50 dark:hover:bg-blue-900/20 transition-all duration-200 hover:scale-105"
          >
            <Database className="h-4 w-4 mr-2" />
            Upload Business Data
          </Button>
        )}

        {onStartDiscussion && hasBusinessData && meetingStatus !== 'active' && (
          <Button
            variant="default"
            size="sm"
            onClick={onStartDiscussion}
            className="bg-meeting-green text-white hover:bg-meeting-green/80 shadow-md hover:shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <Users className="h-4 w-4 mr-2" />
            Start Boardroom Discussion
          </Button>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={onExportChat}
          className="hover:bg-green-100/50 dark:hover:bg-green-900/20 transition-all duration-200 hover:scale-105"
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
            className={`transition-all duration-200 hover:scale-105 ${isActive ? 'hover:bg-yellow-100/50 dark:hover:bg-yellow-900/20' : 'hover:bg-green-100/50 dark:hover:bg-green-900/20'}`}
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
          className="shadow-md hover:shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <PhoneOff className="h-4 w-4 mr-2" />
          End Meeting
        </Button>
      </div>
    </div>
  );
};

export default ControlPanel;
