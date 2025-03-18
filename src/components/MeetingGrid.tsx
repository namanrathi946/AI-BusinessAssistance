
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

  // If no agents are loaded yet, show a placeholder message
  if (aiAgents.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
          <h3 className="text-xl font-medium mb-2">Executive Boardroom</h3>
          <p className="text-muted-foreground">
            Click "Start Discussion" to begin the boardroom meeting.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="boardroom-container">
      <h2 className="text-xl font-semibold mb-4 text-center">Executive Boardroom</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
        {aiAgents.map((agent) => {
          const isCurrentSpeaker = agent.id === currentSpeaker;
          
          return (
            <div 
              key={agent.id}
              className={`agent-card ${isCurrentSpeaker ? 'speaking' : ''}`}
              style={{
                backgroundColor: `${getAgentBackgroundColor(agent.role)}`,
                borderColor: `${agent.color}`,
              }}
            >
              <AvatarPanel
                agent={agent}
                isCurrentSpeaker={isCurrentSpeaker}
                lastMessage={getLastMessage(agent.id)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Helper function to get background color based on agent role
const getAgentBackgroundColor = (role: string): string => {
  switch (role) {
    case 'CFO':
      return 'rgba(240, 253, 244, 0.8)'; // Light green
    case 'CTO':
      return 'rgba(219, 234, 254, 0.8)'; // Light blue
    case 'HR':
      return 'rgba(237, 233, 254, 0.8)'; // Light purple
    case 'CEO':
      return 'rgba(255, 251, 235, 0.8)'; // Light gold
    default:
      return 'rgba(249, 250, 251, 0.8)'; // Light gray
  }
};

export default MeetingGrid;
