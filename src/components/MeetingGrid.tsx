
import React from 'react';
import { Agent, Message } from '../types';
import AvatarPanel from './AvatarPanel';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

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

  // Default to grid layout if no agents are available to prevent empty view
  const useGridLayout = aiAgents.length >= 4 || aiAgents.length === 0;
  
  // If there are no AI agents, show a placeholder message
  if (aiAgents.length === 0) {
    return (
      <div className="flex flex-col h-full bg-meeting-dark rounded-lg overflow-hidden border border-white/10">
        <div className="p-2 text-white font-medium text-center border-b border-white/10">
          AI Agents Video Grid
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white text-center p-6">
            <h3 className="text-xl font-semibold mb-2">No AI Agents Available</h3>
            <p className="text-gray-400">
              Waiting for the meeting to start. Please click "Start Discussion" in the control panel.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  const featuredSpeaker = aiAgents.find(agent => agent.id === currentSpeaker) || aiAgents[0];
  const otherAgents = aiAgents.filter(agent => agent.id !== featuredSpeaker.id);
  
  // For grid layout (all participants equal size)
  if (useGridLayout) {
    return (
      <div className="flex flex-col h-full bg-meeting-dark rounded-lg overflow-hidden border border-white/10">
        <div className="p-2 text-white font-medium text-center border-b border-white/10">
          AI Agents Video Grid
        </div>
        {/* Main video grid */}
        <div className="flex-1 p-2 grid grid-cols-2 gap-2 md:grid-cols-2 lg:grid-cols-3">
          {aiAgents.map((agent) => {
            const isCurrentSpeaker = agent.id === currentSpeaker;
            
            return (
              <div 
                key={agent.id}
                className={`relative rounded-lg overflow-hidden border border-gray-700 ${
                  isCurrentSpeaker ? 'ring-2 ring-green-500 animate-pulse' : ''
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
    <div className="flex flex-col h-full bg-meeting-dark rounded-lg overflow-hidden border border-white/10">
      <div className="p-2 text-white font-medium text-center border-b border-white/10">
        AI Agents Video Conference
      </div>
      {/* Featured speaker */}
      <div className="flex-1 p-2">
        <div className="h-[60%] mb-2">
          <div className="relative h-full rounded-lg overflow-hidden border border-gray-700">
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
        <div className="h-[40%] grid grid-cols-2 md:grid-cols-3 gap-2">
          {otherAgents.map((agent) => {
            const isCurrentSpeaker = agent.id === currentSpeaker;
            
            return (
              <div 
                key={agent.id}
                className={`relative rounded-lg overflow-hidden border border-gray-700 ${
                  isCurrentSpeaker ? 'ring-2 ring-green-500 animate-pulse' : ''
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
