
import React from 'react';
import { Agent } from '../types';
import { cn } from '@/lib/utils';
import AvatarAnimation from './AvatarAnimation';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface AvatarPanelProps {
  agent: Agent;
  isCurrentSpeaker: boolean;
  lastMessage?: string; // Optional prop for displaying the last message
  showVideoStyle?: boolean; // Prop to toggle video conference style
}

const AvatarPanel = ({ agent, isCurrentSpeaker, lastMessage, showVideoStyle = false }: AvatarPanelProps) => {
  const { role, name, status, color, avatar } = agent;
  
  // Map status to readable text
  const statusText = {
    speaking: 'Speaking',
    listening: 'Listening',
    idle: 'Idle',
    thinking: 'Thinking...',
  };
  
  // Status pill styling
  const statusClass = {
    speaking: 'bg-green-500 text-white',
    listening: 'bg-blue-500 text-white',
    idle: 'bg-gray-500 text-white',
    thinking: 'bg-purple-500 text-white animate-pulse',
  };
  
  // Don't display anything if this is a user message (though this should be filtered out earlier)
  if (agent.id === 'user') return null;
  
  // Video conference style
  if (showVideoStyle) {
    return (
      <div className="w-full h-full relative bg-gray-800 overflow-hidden">
        {/* Background color based on agent color */}
        <div 
          className="absolute inset-0 opacity-10" 
          style={{ backgroundColor: agent.color || '#3B82F6' }}
        />
        
        <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
          {/* Larger avatar for video style */}
          <div className="mb-2">
            <AvatarAnimation 
              agent={agent} 
              size={isCurrentSpeaker ? "lg" : "md"} 
            />
          </div>
          
          {/* Only show the status indicator */}
          <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusClass[status])}>
            {statusText[status]}
          </span>
          
          {/* Display the last message in a speech bubble if speaking */}
          {isCurrentSpeaker && lastMessage && (
            <div className="mt-4 text-sm text-white bg-black/30 p-2 rounded max-w-[90%] text-center">
              "{lastMessage.length > 60 ? `${lastMessage.substring(0, 60)}...` : lastMessage}"
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // Original style (fallback)
  return (
    <div className="glass-panel h-full flex flex-col p-4 animate-fade-in hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex flex-col items-center space-y-3">
        <AvatarAnimation agent={agent} size="md" />
        
        <div className="text-center">
          <h3 className="font-medium text-lg">{name}</h3>
          <p className="text-sm text-muted-foreground font-semibold">{role}</p>
        </div>
        
        <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusClass[status])}>
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
