
import React, { useEffect, useRef } from 'react';
import { Message, Agent } from '../types';
import { formatTimestamp } from '../utils/agentUtils';
import { cn } from '@/lib/utils';

interface TranscriptPanelProps {
  messages: Message[];
  agents: Agent[];
  isVisible: boolean;
}

const TranscriptPanel = ({ messages, agents, isVisible }: TranscriptPanelProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to the bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current && isVisible) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isVisible]);
  
  // Function to get agent info by ID
  const getAgentById = (agentId: string) => {
    return agents.find(agent => agent.id === agentId);
  };
  
  if (!isVisible) {
    return null;
  }
  
  return (
    <div className="glass-panel p-4 h-[300px] overflow-hidden flex flex-col animate-slide-up">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium text-lg">Meeting Transcript</h3>
        <span className="text-xs text-muted-foreground">
          {messages.length} messages
        </span>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto pr-2 space-y-4 scroll-smooth"
      >
        {messages.map((message) => {
          const agent = getAgentById(message.agentId);
          
          return (
            <div key={message.id} className="flex items-start gap-3">
              <div 
                className="flex-shrink-0 h-8 w-8 rounded-full overflow-hidden bg-secondary"
                style={{ backgroundColor: agent?.color + '20' }} // Light background based on agent color
              >
                <img 
                  src={agent?.avatar || `https://ui-avatars.com/api/?name=${agent?.name}&background=random&color=fff&size=32`}
                  alt={agent?.name}
                  className="h-full w-full object-cover"
                />
              </div>
              
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-medium" style={{ color: agent?.color }}>
                    {agent?.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatTimestamp(message.timestamp)}
                  </span>
                </div>
                <p className="text-sm mt-1">{message.text}</p>
              </div>
            </div>
          );
        })}
        
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-sm">No messages yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TranscriptPanel;
