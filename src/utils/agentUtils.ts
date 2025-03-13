import { Agent, AgentRole, Message, AgentStatus } from '../types';
import { generateRoleInsights } from './businessDataUtils';
import { sampleBusinessData } from '../data/sampleBusinessData';
import { BusinessData } from '../types/businessData';

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
    text: 'Good morning everyone. Let\'s discuss our performance and strategic plans based on our business data.',
    timestamp: new Date(Date.now() - 60000),
    status: 'sent',
  },
];

// Simulated message generation with business data context
export const generateAgentMessage = async (
  previousMessages: Message[],
  agent: Agent,
  businessData: BusinessData = sampleBusinessData
): Promise<Message> => {
  // In a real implementation, this would call your API with the agent's role
  // and the conversation history to generate a contextually appropriate response
  
  // Simulating API latency
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Get business insights for this agent's role
  const insights = generateRoleInsights(agent.role, businessData);
  
  // Sample responses based on agent role and business data context
  const responses: Record<AgentRole, string[]> = {
    'CEO': [
      `Our company ${businessData.companyName} has shown impressive growth with ${insights.keyMetrics.revenueGrowth?.growth}% revenue growth. Customer satisfaction is at ${insights.keyMetrics.customerSatisfaction}/10 which is strong.`,
      `We need to focus on our strategic initiatives like ${insights.strategicFocus.join(', ')}. Market share has increased to ${businessData.marketingData.slice(-1)[0].marketShare}%, but we need to keep pushing.`,
      `The executive team has done great work. Our profit margin is now at ${insights.keyMetrics.profitMargin} which exceeds our targets. Let's discuss how we maintain this momentum.`,
      `I'm concerned about market threats like ${insights.challenges.slice(0, 2).join(' and ')}. We should develop contingency plans while pursuing opportunities in ${insights.opportunities.slice(0, 2).join(' and ')}.`,
    ],
    'CTO': [
      `From a technology perspective, we've completed key projects like ${insights.completedProjects.join(', ')}. Our development velocity is at ${insights.keyMetrics.developmentVelocity} story points per sprint.`,
      `Our tech stack now includes ${businessData.technologyData.slice(-1)[0].techStack.slice(-3).join(', ')} which has improved our capabilities. Infrastructure costs have increased to $${insights.keyMetrics.technicalDebt}k as we've scaled.`,
      `Technical debt is at ${insights.keyMetrics.technicalDebt}/10, and we need to allocate time to address it. I propose dedicating 20% of our engineering time to refactoring and architectural improvements.`,
      `For the coming year, we're planning to implement ${insights.plannedProjects.join(', ')}. These align with our product roadmap and should drive significant business value.`,
    ],
    'CFO': [
      `Financial performance has been strong with revenue of $${businessData.financialData.slice(-1)[0].revenue/1000000}M and profit of $${businessData.financialData.slice(-1)[0].profit/1000000}M. Our profit margin is ${insights.keyMetrics.profitMargin}.`,
      `We've allocated $${insights.keyMetrics.budgetAllocation.rnd/1000000}M to R&D and $${insights.keyMetrics.budgetAllocation.marketing/1000000}M to marketing. ROI on our investments is ${businessData.financialData.slice(-1)[0].roi * 100}%.`,
      `Cash flow remains positive at $${businessData.financialData.slice(-1)[0].cashFlow/1000000}M, giving us runway for continued investments while maintaining profitability.`,
      `I recommend increasing our investment budget by 30% next year to capitalize on growth opportunities, while maintaining discipline on operational expenses.`,
    ],
    'HR': [
      `We've grown to ${insights.workforceSummary.split(' ')[3]} employees with ${insights.keyMetrics.attritionRate} attrition rate. Employee satisfaction is at ${insights.keyMetrics.employeeSatisfaction}/10 which has improved from last year.`,
      `Engineering now makes up ${Math.round(Number(businessData.hrData.slice(-1)[0].departmentDistribution.engineering) / Number(businessData.hrData.slice(-1)[0].totalEmployees) * 100)}% of our workforce. We've spent $${insights.keyMetrics.trainingInvestment/1000}k on training and development programs.`,
      `Recruitment remains challenging, especially for specialized roles. We're implementing new initiatives including ${insights.talentInitiatives.slice(0, 2).join(' and ')} to attract and retain top talent.`,
      `I recommend expanding our professional development budget and implementing a more robust career progression framework to improve retention in high-demand roles.`,
    ],
  };
  
  // Select a contextually relevant response based on agent role
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
export const simulateConversation = (
  agents: Agent[],
  initialMessages: Message[],
  onNewMessage: (message: Message) => void,
  onAgentStatusChange: (agentId: string, status: Agent['status']) => void,
  businessData: BusinessData,
  topic: string = ''
) => {
  console.log(`Starting discussion${topic ? ` on topic: ${topic}` : ''}`);
  console.log("Business data for discussion:", businessData);
  
  // If there are fewer than 8 messages, continue the conversation
  if (initialMessages.length < 8) {
    // Determine which agent speaks next (simple round-robin)
    const lastSpeakerIndex = agents.findIndex(agent => 
      agent.id === initialMessages[initialMessages.length - 1]?.agentId
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
    const newMessage = await generateAgentMessage(initialMessages, nextAgent, businessData);
    onNewMessage(newMessage);
    
    // Set the agent back to idle after speaking
    setTimeout(() => {
      onAgentStatusChange(nextAgent.id, 'idle');
      
      // Continue the conversation after a pause
      setTimeout(() => {
        simulateConversation(agents, [...initialMessages, newMessage], onNewMessage, onAgentStatusChange, businessData, topic);
      }, 2000);
      
    }, 2000);
  }
};

// Helper function to get a readable timestamp
export const formatTimestamp = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
