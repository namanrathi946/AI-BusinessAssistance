
import React from 'react';
import { Agent, Message } from '../types';
import AvatarPanel from './AvatarPanel';

interface MeetingGridProps {
  agents: Agent[];
  messages: Message[];
  currentSpeaker: string | null;
}

const MeetingGrid = ({ agents, messages, currentSpeaker }: MeetingGridProps) => {
  // Filter out the user from the agents list (we only want to show AI agents in the grid)
  const aiAgents = agents.filter(agent => agent.id !== 'user');
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full animate-fade-in">
      {aiAgents.map((agent) => (
        <div 
          key={agent.id}
          className={`transition-all duration-500 hover-glow ${
            agent.id === currentSpeaker 
              ? 'scale-102 z-10 ring-2 ring-offset-2 ring-offset-background ring-meeting-blue/30' 
              : 'scale-100 hover:scale-101'
          }`}
        >
          <AvatarPanel
            agent={agent}
            isCurrentSpeaker={agent.id === currentSpeaker}
          />
        </div>
      ))}
    </div>
  );
};

export default MeetingGrid;
