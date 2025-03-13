
import React from 'react';
import { Agent, Message } from '../types';
import AvatarPanel from './AvatarPanel';

interface MeetingGridProps {
  agents: Agent[];
  messages: Message[];
  currentSpeaker: string | null;
}

const MeetingGrid = ({ agents, messages, currentSpeaker }: MeetingGridProps) => {
  // Helper to get the last message for an agent
  const getLastMessageForAgent = (agentId: string): string | undefined => {
    const agentMessages = messages
      .filter(msg => msg.agentId === agentId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return agentMessages[0]?.text;
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
      {agents.map((agent) => (
        <AvatarPanel
          key={agent.id}
          agent={agent}
          isCurrentSpeaker={agent.id === currentSpeaker}
          lastMessage={getLastMessageForAgent(agent.id)}
        />
      ))}
    </div>
  );
};

export default MeetingGrid;
