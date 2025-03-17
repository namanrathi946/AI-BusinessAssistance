
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
  
  // Get the last message for each agent to show role-specific context
  const getLastMessage = (agentId: string) => {
    return messages
      .filter(message => message.agentId === agentId)
      .slice(-1)[0]?.text || '';
  };

  // Determine layout (small grid or featured view) based on number of agents
  const useGridLayout = aiAgents.length >= 4;
  const featuredSpeaker = aiAgents.find(agent => agent.id === currentSpeaker) || aiAgents[0];
  const otherAgents = aiAgents.filter(agent => agent.id !== featuredSpeaker.id);
  
  // For grid layout (all participants equal size)
  if (useGridLayout) {
    return (
      <div className="flex flex-col h-full bg-meeting-dark rounded-lg overflow-hidden">
        {/* Main video grid */}
        <div className="flex-1 p-2 grid grid-cols-2 gap-2 md:grid-cols-2 lg:grid-cols-3">
          {aiAgents.map((agent) => {
            const isCurrentSpeaker = agent.id === currentSpeaker;
            
            return (
              <div 
                key={agent.id}
                className={`relative rounded-lg overflow-hidden ${
                  isCurrentSpeaker ? 'ring-2 ring-meeting-green animate-pulse' : ''
                }`}
              >
                <AvatarPanel
                  agent={agent}
                  isCurrentSpeaker={isCurrentSpeaker}
                  lastMessage={getLastMessage(agent.id)}
                  showVideoStyle={true}
                />
                <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-white text-sm">
                  {agent.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  
  // For featured speaker layout (one large video, others small)
  return (
    <div className="flex flex-col h-full bg-meeting-dark rounded-lg overflow-hidden">
      {/* Featured speaker */}
      <div className="flex-1 p-2">
        <div className="h-[60%] mb-2">
          <div className="relative h-full rounded-lg overflow-hidden">
            <AvatarPanel
              agent={featuredSpeaker}
              isCurrentSpeaker={featuredSpeaker.id === currentSpeaker}
              lastMessage={getLastMessage(featuredSpeaker.id)}
              showVideoStyle={true}
            />
            <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-white text-sm">
              {featuredSpeaker.name}
            </div>
          </div>
        </div>
        
        {/* Bottom row of other participants */}
        <div className="h-[40%] grid grid-cols-3 md:grid-cols-4 gap-2">
          {otherAgents.map((agent) => {
            const isCurrentSpeaker = agent.id === currentSpeaker;
            
            return (
              <div 
                key={agent.id}
                className={`relative rounded-lg overflow-hidden ${
                  isCurrentSpeaker ? 'ring-2 ring-meeting-green animate-pulse' : ''
                }`}
              >
                <AvatarPanel
                  agent={agent}
                  isCurrentSpeaker={isCurrentSpeaker}
                  lastMessage=""
                  showVideoStyle={true}
                />
                <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-white text-sm">
                  {agent.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MeetingGrid;
