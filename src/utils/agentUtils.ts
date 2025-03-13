
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

// OpenAI integration for generating contextually relevant responses
const OPENAI_API_KEY = "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";

// Generate a prompt for the AI based on the agent role, business data, and discussion topic
const generatePrompt = (
  agent: Agent, 
  businessData: BusinessData,
  previousMessages: Message[],
  topic: string = ''
): string => {
  const insights = generateRoleInsights(agent.role, businessData);
  
  // Create conversation history for context
  const conversationHistory = previousMessages.map(msg => {
    const speaker = msg.role;
    return `${speaker}: ${msg.text}`;
  }).join('\n');
  
  // Base system prompt according to role
  let systemPrompt = `You are the ${agent.role} of ${businessData.companyName}, a company with the following metrics:
- Revenue: $${businessData.financialData.slice(-1)[0].revenue/1000000}M
- Profit: $${businessData.financialData.slice(-1)[0].profit/1000000}M
- Employees: ${businessData.hrData.slice(-1)[0].totalEmployees}
- Market Share: ${businessData.marketingData.slice(-1)[0].marketShare}%\n\n`;
  
  // Add role-specific context
  switch(agent.role) {
    case 'CEO':
      systemPrompt += `As the CEO, you focus on overall company strategy, growth, and vision. 
Strategic initiatives include: ${insights.strategicFocus.join(', ')}.
Key challenges: ${insights.challenges.join(', ')}.
Key opportunities: ${insights.opportunities.join(', ')}.`;
      break;
    case 'CTO':
      systemPrompt += `As the CTO, you focus on technology strategy and implementation.
Tech stack: ${businessData.technologyData.slice(-1)[0].techStack.join(', ')}.
Recently completed projects: ${insights.completedProjects.join(', ')}.
Planned projects: ${insights.plannedProjects.join(', ')}.
Technical debt level: ${insights.keyMetrics.technicalDebt}/10.`;
      break;
    case 'CFO':
      systemPrompt += `As the CFO, you focus on financial performance and budget allocation.
Budget allocation: R&D $${insights.keyMetrics.budgetAllocation.rnd/1000000}M, Marketing $${insights.keyMetrics.budgetAllocation.marketing/1000000}M.
Profit margin: ${insights.keyMetrics.profitMargin}.
Cash flow: $${businessData.financialData.slice(-1)[0].cashFlow/1000000}M.
ROI: ${businessData.financialData.slice(-1)[0].roi * 100}%.`;
      break;
    case 'HR':
      systemPrompt += `As the HR Director, you focus on workforce management and company culture.
Total employees: ${insights.workforceSummary.split(' ')[3]}.
Attrition rate: ${insights.keyMetrics.attritionRate}.
Employee satisfaction: ${insights.keyMetrics.employeeSatisfaction}/10.
Training investment: $${insights.keyMetrics.trainingInvestment/1000}k.
Talent initiatives: ${insights.talentInitiatives.join(', ')}.`;
      break;
  }
  
  // Add topic instructions if provided
  let userPrompt = `You are participating in an executive boardroom discussion with the CEO, CTO, CFO, and HR Director.`;
  
  if (topic && topic.trim()) {
    userPrompt += ` The specific topic being discussed is: "${topic}".`;
  }
  
  userPrompt += ` Review the conversation history below and provide a thoughtful response that:
1. Addresses any questions or points raised by other executives
2. Offers insights from your area of expertise
3. Is concise (100-150 words)
4. Is businesslike but conversational
5. Connects to the specific business data relevant to your role

Conversation history:
${conversationHistory}

Respond as the ${agent.role}:`;

  return { systemPrompt, userPrompt };
};

// Simulated message generation with AI integration
export const generateAgentMessage = async (
  previousMessages: Message[],
  agent: Agent,
  businessData: BusinessData = sampleBusinessData,
  topic: string = ''
): Promise<Message> => {
  try {
    // Generate prompt for OpenAI
    const { systemPrompt, userPrompt } = generatePrompt(agent, businessData, previousMessages, topic);
    
    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 250,
        temperature: 0.7
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }
    
    const data = await response.json();
    const messageText = data.choices[0].message.content.trim();
    
    return {
      id: Date.now().toString(),
      agentId: agent.id,
      role: agent.role,
      text: messageText,
      timestamp: new Date(),
      status: 'sent',
    };
  } catch (error) {
    console.error('Error generating message with OpenAI:', error);
    
    // Fallback to static messages if API fails
    const insights = generateRoleInsights(agent.role, businessData);
    
    // Simplified fallback responses
    const fallbackResponses: Record<AgentRole, string[]> = {
      'CEO': [
        `Our company ${businessData.companyName} has shown impressive growth with ${insights.keyMetrics.revenueGrowth?.growth}% revenue growth. Let's discuss our strategy on ${topic || 'our business performance'}.`,
      ],
      'CTO': [
        `From a technology perspective, our focus on ${topic || 'innovation'} has been successful with our tech stack now including ${businessData.technologyData.slice(-1)[0].techStack.slice(-3).join(', ')}.`,
      ],
      'CFO': [
        `Regarding ${topic || 'our financials'}, we've seen strong performance with revenue of $${businessData.financialData.slice(-1)[0].revenue/1000000}M and a profit margin of ${insights.keyMetrics.profitMargin}.`,
      ],
      'HR': [
        `From an HR perspective, ${topic || 'our team growth'} has been notable as we've grown to ${insights.workforceSummary.split(' ')[3]} employees with ${insights.keyMetrics.attritionRate} attrition rate.`,
      ],
    };
    
    const fallbackResponse = fallbackResponses[agent.role][0];
    
    return {
      id: Date.now().toString(),
      agentId: agent.id,
      role: agent.role,
      text: fallbackResponse,
      timestamp: new Date(),
      status: 'sent',
    };
  }
};

// This simulates the turn-based conversation flow
export const simulateConversation = async (
  agents: Agent[],
  initialMessages: Message[],
  onNewMessage: (message: Message) => void,
  onAgentStatusChange: (agentId: string, status: Agent['status']) => void,
  businessData: BusinessData,
  topic: string = ''
) => {
  console.log(`Starting discussion${topic ? ` on topic: ${topic}` : ''}`)
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
    
    // Generate and add the new message - passing the topic to make sure
    // the agents discuss the specified topic
    const newMessage = await generateAgentMessage(
      initialMessages, 
      nextAgent, 
      businessData,
      topic
    );
    onNewMessage(newMessage);
    
    // Set the agent back to idle after speaking
    setTimeout(() => {
      onAgentStatusChange(nextAgent.id, 'idle');
      
      // Continue the conversation after a pause
      setTimeout(() => {
        // We need to call this as an async function without await
        // since we're inside a setTimeout callback
        simulateConversation(agents, [...initialMessages, newMessage], onNewMessage, onAgentStatusChange, businessData, topic);
      }, 2000);
      
    }, 2000);
  }
};

// Helper function to get a readable timestamp
export const formatTimestamp = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
