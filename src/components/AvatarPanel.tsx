
import React, { useState } from 'react';
import { Agent } from '../types';
import { cn } from '@/lib/utils';
import AvatarAnimation from './AvatarAnimation';
import { ChevronDown, ChevronUp, BarChart } from 'lucide-react';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';

interface AvatarPanelProps {
  agent: Agent;
  isCurrentSpeaker: boolean;
  lastMessage?: string;
}

const AvatarPanel = ({ agent, isCurrentSpeaker, lastMessage }: AvatarPanelProps) => {
  const { role, name, status } = agent;
  const [expanded, setExpanded] = useState(false);
  
  // Map status to readable text
  const statusText = {
    speaking: 'Speaking',
    listening: 'Listening',
    idle: 'Idle',
    thinking: 'Analyzing...',
  };
  
  // Status badge styling based on role
  const getBadgeStyles = () => {
    switch (role) {
      case 'CFO':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CTO':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'HR':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'CEO':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Generate mock KPI for each role
  const getKpiData = () => {
    switch (role) {
      case 'CFO':
        return { label: 'Quarterly ROI', value: '+12.4%' };
      case 'CTO':
        return { label: 'Tech Adoption', value: '89%' };
      case 'HR':
        return { label: 'Retention Rate', value: '94%' };
      case 'CEO':
        return { label: 'Growth Rate', value: '8.2%' };
      default:
        return { label: 'Performance', value: '75%' };
    }
  };
  
  // Get role-specific icon color
  const getRoleColor = () => {
    switch (role) {
      case 'CFO':
        return 'text-green-600';
      case 'CTO':
        return 'text-blue-600';
      case 'HR':
        return 'text-purple-600';
      case 'CEO':
        return 'text-amber-600';
      default:
        return 'text-gray-600';
    }
  };
  
  const kpi = getKpiData();
  
  return (
    <Card className={cn(
      "boardroom-panel transition-all duration-300 h-full",
      expanded ? "expanded" : "",
      isCurrentSpeaker ? "ring-2 ring-offset-2" : ""
    )}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <AvatarAnimation agent={agent} size="md" />
              {isCurrentSpeaker && (
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-meeting-green animate-pulse"></span>
              )}
            </div>
            
            <div>
              <h3 className="font-semibold text-lg">{name}</h3>
              <p className="text-sm text-muted-foreground font-medium">{role}</p>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <Badge className={cn("font-medium px-2 py-1 text-xs", getBadgeStyles())}>
              {statusText[status]}
            </Badge>
            
            <button 
              onClick={() => setExpanded(!expanded)} 
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label={expanded ? "Collapse panel" : "Expand panel"}
            >
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>
        
        {/* KPI Indicator */}
        <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-md">
          <BarChart size={16} className={getRoleColor()} />
          <span className="text-xs font-medium">{kpi.label}:</span>
          <span className="text-xs font-bold ml-auto">{kpi.value}</span>
        </div>
        
        {/* Message area */}
        <div className={cn(
          "message-area transition-all duration-300 overflow-y-auto",
          expanded ? "max-h-80" : "max-h-20"
        )}>
          {status === 'thinking' ? (
            <div className="typing-indicator p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
              <div className="flex gap-1">
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
              </div>
            </div>
          ) : lastMessage ? (
            <div className="boardroom-message p-3 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
              <p className="text-sm whitespace-pre-wrap">{lastMessage}</p>
            </div>
          ) : (
            <div className="empty-message p-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-muted-foreground text-sm italic">
              Waiting for input...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AvatarPanel;
