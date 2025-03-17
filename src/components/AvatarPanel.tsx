
import React from 'react';
import { Agent } from '../types';
import { cn } from '@/lib/utils';
import AvatarAnimation from './AvatarAnimation';

interface AvatarPanelProps {
  agent: Agent;
  isCurrentSpeaker: boolean;
  lastMessage?: string; // Added lastMessage as an optional prop
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
        
        {/* Display the last message if available */}
        {lastMessage && (
          <div className="mt-2 text-sm italic text-muted-foreground overflow-hidden text-ellipsis">
            "{lastMessage.length > 100 ? `${lastMessage.substring(0, 100)}...` : lastMessage}"
          </div>
        )}
      </div>
    </div>
  );
};

export default AvatarPanel;
