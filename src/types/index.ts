
export type AgentRole = 'CEO' | 'CTO' | 'CFO' | 'HR';

export type AgentStatus = 'speaking' | 'listening' | 'idle' | 'thinking';

export interface Agent {
  id: string;
  role: AgentRole;
  name: string;
  avatar: string;
  status: AgentStatus;
  color: string;
}

export interface Message {
  id: string;
  agentId: string;
  role: AgentRole;
  text: string;
  timestamp: Date;
  status: 'sending' | 'sent' | 'error';
}

export interface MeetingState {
  status: 'initializing' | 'active' | 'paused' | 'ended';
  agents: Agent[];
  messages: Message[];
  currentSpeaker: string | null;
  transcriptVisible: boolean;
}
