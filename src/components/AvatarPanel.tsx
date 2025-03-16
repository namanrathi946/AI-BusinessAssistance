
import React from 'react';
import { Agent } from '../types';
import { cn } from '@/lib/utils';
import AvatarAnimation from './AvatarAnimation';
import SpeechPlayer from './SpeechPlayer';

interface AvatarPanelProps {
  agent: Agent;
  isCurrentSpeaker: boolean;
  lastMessage?: string;
}

const AvatarPanel = ({ agent, isCurrentSpeaker, lastMessage }: AvatarPanelProps) => {
  const { role, name, status } = agent;
  
  // Map status to readable text
  const statusText = {
    speaking: 'Speaking',
    listening: 'Listening',
    idle: 'Idle',
    thinking: 'Thinking...',
  };
  
  // Status pill styling
  const statusClass = {
    speaking: 'speaking',
    listening: 'listening',
    idle: 'idle',
    thinking: 'thinking',
  };
  
  // Don't display anything if this is a user message (though this should be filtered out earlier)
  if (agent.id === 'user') return null;
  
  return (
    <div className="glass-panel h-full flex flex-col p-4 animate-fade-in hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex flex-col items-center space-y-3">
        <AvatarAnimation agent={agent} size="md" />
        
        <div className="text-center">
          <h3 className="font-medium text-lg">{name}</h3>
          <p className="text-sm text-muted-foreground font-semibold">{role}</p>
        </div>
        
        <span className={cn("status-pill transition-all duration-300", statusClass[status])}>
          {statusText[status]}
        </span>
      </div>
      
      {/* Message bubble that appears when agent is speaking */}
      {isCurrentSpeaker && lastMessage && (
        <div className="mt-auto w-full">
          <div className="message-bubble incoming mt-4 animate-pulse-once transition-all duration-300">
            <div className="flex justify-between items-start">
              <p className="text-sm flex-1 pr-2">{lastMessage}</p>
              {lastMessage && <SpeechPlayer text={lastMessage} agent={agent} />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvatarPanel;
