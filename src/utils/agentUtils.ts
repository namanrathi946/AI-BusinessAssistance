
import { Agent, AgentRole, Message } from '../types';

// Sample data for the agents
export const getDefaultAgents = (): Agent[] => [
  {
    id: 'ceo-1',
    role: 'CEO',
    name: 'Alexandra Chen',
    avatar: `/avatar-ceo.png`,
    status: 'idle',
    color: '#0A84FF', // meeting-blue
  },
  {
    id: 'cto-1',
    role: 'CTO',
    name: 'Michael Reynolds',
    avatar: `/avatar-cto.png`,
    status: 'idle',
    color: '#30D158', // meeting-green
  },
  {
    id: 'cfo-1',
    role: 'CFO',
    name: 'Sarah Williams',
    avatar: `/avatar-cfo.png`,
    status: 'idle',
    color: '#FFD60A', // meeting-yellow
  },
  {
    id: 'hr-1',
    role: 'HR',
    name: 'David Martinez',
    avatar: `/avatar-hr.png`,
    status: 'idle',
    color: '#BF5AF2', // meeting-purple
  },
];

// Sample initial messages for demonstration
export const getInitialMessages = (): Message[] => [
  {
    id: '1',
    agentId: 'ceo-1',
    role: 'CEO',
    text: 'Good morning everyone. Let\'s discuss our Q3 strategy and the upcoming product launch.',
    timestamp: new Date(Date.now() - 60000),
    status: 'sent',
  },
];

// Simulated message generation (this would be replaced with actual API calls)
export const generateAgentMessage = async (
  previousMessages: Message[],
  agent: Agent
): Promise<Message> => {
  // In a real implementation, this would call your API with the agent's role
  // and the conversation history to generate a contextually appropriate response
  
  // Simulating API latency
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Sample responses based on agent role - these are placeholders
  const responses: Record<AgentRole, string[]> = {
    'CEO': [
      'I want to see us focus on increasing market share this quarter.',
      'Our main priority should be launching the new product line on schedule.',
      'Customer retention metrics look good, but we need to improve acquisition.',
      'What are your thoughts on expanding into the European market by Q4?',
    ],
    'CTO': [
      'The development team is on track to deliver the new features by next month.',
      'We need to address some technical debt before scaling further.',
      'I recommend we invest more in our cloud infrastructure to support growth.',
      'The AI integration is showing promising results in our initial tests.',
    ],
    'CFO': [
      'Our Q2 revenue exceeded projections by 12%, but expenses also increased.',
      'I suggest we allocate more budget to R&D given the competitive landscape.',
      'The current burn rate is sustainable given our runway and growth metrics.',
      'We should consider raising another round of funding in the next 6 months.',
    ],
    'HR': [
      'Employee satisfaction scores are up 15% since implementing the new benefits.',
      'We need to address the high turnover in the marketing department.',
      'The new remote work policy has been well-received across all departments.',
      'I recommend expanding our talent acquisition team to support our growth plans.',
    ],
  };
  
  // Select a random response based on agent role
  const possibleResponses = responses[agent.role];
  const randomResponse = possibleResponses[Math.floor(Math.random() * possibleResponses.length)];
  
  return {
    id: Date.now().toString(),
    agentId: agent.id,
    role: agent.role,
    text: randomResponse,
    timestamp: new Date(),
    status: 'sent',
  };
};

// In a real implementation, this would be replaced with WebSocket/SSE connections
// This simulates the turn-based conversation flow
export const simulateConversation = async (
  agents: Agent[],
  messages: Message[],
  onMessage: (message: Message) => void,
  onAgentStatusChange: (agentId: string, status: Agent['status']) => void
) => {
  // If there are fewer than 8 messages, continue the conversation
  if (messages.length < 8) {
    // Determine which agent speaks next (simple round-robin)
    const lastSpeakerIndex = agents.findIndex(agent => 
      agent.id === messages[messages.length - 1]?.agentId
    );
    
    // Choose the next agent (circular)
    const nextSpeakerIndex = (lastSpeakerIndex + 1) % agents.length;
    const nextAgent = agents[nextSpeakerIndex];
    
    // Update the agent's status to thinking
    onAgentStatusChange(nextAgent.id, 'thinking');
    
    // Wait a moment to simulate thinking
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update to speaking status
    onAgentStatusChange(nextAgent.id, 'speaking');
    
    // Generate and add the new message
    const newMessage = await generateAgentMessage(messages, nextAgent);
    onMessage(newMessage);
    
    // Set the agent back to idle after speaking
    setTimeout(() => {
      onAgentStatusChange(nextAgent.id, 'idle');
      
      // Continue the conversation after a pause
      setTimeout(() => {
        simulateConversation(agents, [...messages, newMessage], onMessage, onAgentStatusChange);
      }, 2000);
      
    }, 2000);
  }
};

// Helper function to get a readable timestamp
export const formatTimestamp = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
