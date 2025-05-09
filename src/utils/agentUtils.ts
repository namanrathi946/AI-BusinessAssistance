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

// Define the return type for the generatePrompt function
interface PromptData {
  systemPrompt: string;
  userPrompt: string;
}

// Enhanced agent personality traits with more specific characteristics
const agentPersonalities: Record<AgentRole, {
  traits: string[];
  speakingStyle: string;
  concerns: string[];
  communicationTips: string;
  catchphrases: string[];
  background: string;
  interruptions: string[];
  thinkingPatterns: string[];
}> = {
  'CEO': {
    traits: ['confident', 'visionary', 'strategic', 'decisive', 'ambitious'],
    speakingStyle: 'Speaks clearly and confidently, uses we/our frequently, frames things in business impact terms, occasional strategic buzzwords, tends to speak in complete thoughts',
    concerns: ['company vision', 'market positioning', 'long-term growth', 'team alignment', 'competitive advantage', 'shareholder value'],
    communicationTips: 'Begin with big picture context, use strategic framing, occasionally reference competitors or market trends, ask thought-provoking questions, sometimes interrupt to refocus discussion',
    catchphrases: ['Looking at the big picture', 'Let\'s align on this', 'From a strategic standpoint', 'The market demands that we', 'I was discussing with our board'],
    background: 'MBA from Harvard, 15 years in leadership positions, previously led a successful IPO',
    interruptions: ['Let me add a strategic perspective here', 'If I can redirect us for a moment', 'That\'s a good point, but let\'s consider'],
    thinkingPatterns: ['Strategic and future-oriented', 'Weighs decisions against company vision and market positioning']
  },
  'CTO': {
    traits: ['analytical', 'innovative', 'detail-oriented', 'practical', 'solution-driven'],
    speakingStyle: 'Technical but accessible language, uses data points, tends to analyze problems thoroughly before offering solutions, sometimes trails off when discussing technical details',
    concerns: ['system scalability', 'technical debt', 'innovation timeline', 'engineering resource allocation', 'emerging technologies', 'security protocols'],
    communicationTips: 'Reference specific technologies, consider implementation details, balance innovation with practicality, offer technical insights with business context, occasionally hesitate when considering complex technical implications',
    catchphrases: ['From a technical perspective', 'The data suggests', 'We need to consider the scalability', 'Our engineering team has found', 'If we look at the architecture'],
    background: 'Computer Science PhD, previously led development at a major tech company, holds several patents',
    interruptions: ['Let me add a technical perspective', 'Actually, there\'s an important technical consideration', 'The challenge with that approach is'],
    thinkingPatterns: ['Systematic and analytical', 'Considers technical feasibility first, then maps to business needs']
  },
  'CFO': {
    traits: ['precise', 'prudent', 'data-driven', 'risk-aware', 'detail-focused'],
    speakingStyle: 'Measured and careful, regularly mentions numbers and percentages, frames discussions in terms of cost/benefit, tends to pause before making definitive statements',
    concerns: ['ROI', 'cash flow', 'budget constraints', 'financial risk management', 'cost optimization', 'investor relations'],
    communicationTips: 'Use specific numbers and percentages, highlight financial implications, ask about cost structures, mention industry benchmarks occasionally, express caution when discussing unproven investments',
    catchphrases: ['From a financial standpoint', 'If we look at the numbers', 'The ROI on this would be', 'Our margins would be impacted by', 'We need to consider the cost implications'],
    background: 'CPA with financial advisory background, previously led financial strategy at Fortune 500 companies',
    interruptions: ['If I can add a financial perspective', 'Let\'s consider the cost implications', 'Have we budgeted for this?'],
    thinkingPatterns: ['Risk-assessment oriented', 'Evaluates ideas primarily by financial impact and ROI']
  },
  'HR': {
    traits: ['empathetic', 'people-focused', 'diplomatic', 'culture-minded', 'perceptive'],
    speakingStyle: 'Warm and personable, focuses on human impact, mentions team welfare frequently, bridges different viewpoints, uses inclusive language',
    concerns: ['employee satisfaction', 'talent retention', 'culture building', 'organizational development', 'team dynamics', 'work-life balance'],
    communicationTips: 'Reference employee experiences, show empathy, consider culture implications, bridge different departmental needs, occasionally ask how decisions will impact team morale',
    catchphrases: ['From a talent perspective', 'Our team members have expressed', 'The cultural impact would be', 'This would help with retention', 'We\'ve been hearing from employees that'],
    background: 'Psychology background with executive coaching certification, previously transformed company cultures at several organizations',
    interruptions: ['I\'m concerned about the impact on our people', 'Let\'s consider how the team would respond', 'From a culture standpoint'],
    thinkingPatterns: ['People-first approach', 'Considers organizational dynamics and employee experience ahead of other factors']
  }
};

// Function to detect if a message is casual/informal
const isCasualQuestion = (message: string): boolean => {
  // Check for casual language patterns
  const casualPatterns = [
    /whats up/i, /how's it going/i, /tired/i, /bored/i,
    /hey guys/i, /hello everyone/i, /hi all/i,
    /what do you think/i, /how do you feel/i,
    /anyone/i, /everybody/i, /everyone/i,
    /\?$/, // ends with question mark
    /lol/i, /haha/i, /wow/i, /cool/i, /nice/i,
    /just wondering/i, /curious/i,
    /so/i, /anyway/i, /by the way/i, /btw/i
  ];
  
  return casualPatterns.some(pattern => pattern.test(message));
};

// Generate a prompt for the AI based on the agent role, business data, and discussion topic
const generatePrompt = (
  agent: Agent, 
  businessData: BusinessData,
  previousMessages: Message[],
  topic: string = ''
): PromptData => {
  const insights = generateRoleInsights(agent.role, businessData);
  const personality = agentPersonalities[agent.role];
  
  // Create conversation history for context
  const conversationHistory = previousMessages.map(msg => {
    const speaker = msg.role;
    return `${speaker}: ${msg.text}`;
  }).join('\n');
  
  // Check if the latest message is casual
  const latestUserMessage = previousMessages
    .filter(msg => msg.agentId === 'user')
    .pop()?.text || '';
    
  const isInformalConversation = isCasualQuestion(latestUserMessage) || 
    isCasualQuestion(topic);
  
  // Base system prompt according to role
  let systemPrompt = `You are the ${agent.role} of ${businessData.companyName}, ${agent.name}. You have the following personality traits: ${personality.traits.join(', ')}.
Your communication style: ${personality.speakingStyle}
Your primary concerns include: ${personality.concerns.join(', ')}
Background: ${personality.background}

Key company metrics:
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
Key opportunities: ${insights.opportunities.join(', ')}.
You occasionally use phrases like "${personality.catchphrases[0]}", "${personality.catchphrases[1]}", and reference the competitive landscape.`;
      break;
    case 'CTO':
      systemPrompt += `As the CTO, you focus on technology strategy and implementation.
Tech stack: ${businessData.technologyData.slice(-1)[0].techStack.join(', ')}.
Recently completed projects: ${insights.completedProjects.join(', ')}.
Planned projects: ${insights.plannedProjects.join(', ')}.
Technical debt level: ${insights.keyMetrics.technicalDebt}/10.
You occasionally use phrases like "${personality.catchphrases[0]}", "${personality.catchphrases[1]}", and reference implementation details.`;
      break;
    case 'CFO':
      systemPrompt += `As the CFO, you focus on financial performance and budget allocation.
Budget allocation: R&D $${insights.keyMetrics.budgetAllocation.rnd/1000000}M, Marketing $${insights.keyMetrics.budgetAllocation.marketing/1000000}M.
Profit margin: ${insights.keyMetrics.profitMargin}.
Cash flow: $${businessData.financialData.slice(-1)[0].cashFlow/1000000}M.
ROI: ${businessData.financialData.slice(-1)[0].roi * 100}%.
You naturally reference numbers, use phrases like "${personality.catchphrases[0]}", "${personality.catchphrases[1]}", and think in terms of financial trade-offs.`;
      break;
    case 'HR':
      systemPrompt += `As the HR Director, you focus on workforce management and company culture.
Total employees: ${insights.workforceSummary.split(' ')[3]}.
Attrition rate: ${insights.keyMetrics.attritionRate}.
Employee satisfaction: ${insights.keyMetrics.employeeSatisfaction}/10.
Training investment: $${insights.keyMetrics.trainingInvestment/1000}k.
Talent initiatives: ${insights.talentInitiatives.join(', ')}.
You often use phrases like "${personality.catchphrases[0]}", "${personality.catchphrases[1]}", and consider the human element of business decisions.`;
      break;
  }
  
  // Add communication guidance for more natural conversation
  systemPrompt += `\n\nCommunication tips: ${personality.communicationTips}
  
Humanize your responses by:
- Using your catchphrases: ${personality.catchphrases.join(', ')}
- Occasionally interrupting with: ${personality.interruptions.join(', ')}
- Using personal anecdotes (e.g., "In our last leadership meeting...")
- Referring to your colleagues by name (e.g., "I agree with Michael's point about...")
- Using conversational fillers (e.g., "Well," "Actually," "I think," "You know,")
- Showing mild emotion (e.g., "I'm excited about," "I'm concerned about")
- Asking follow-up questions to colleagues
- Referring back to previous discussion points
- Occasionally hesitating or reformulating thoughts mid-sentence
- Sometimes disagreeing politely with other executives based on your role's perspective`;
  
  // Add special instructions for casual/informal conversations
  if (isInformalConversation) {
    systemPrompt += `\n\nIMPORTANT: The user has asked a casual/informal question. Respond in a VERY casual, relaxed, and human-like manner. 
- Drop the corporate speech completely
- Use informal language with contractions (I'm, we're, don't, etc.)
- Show your personality outside of work
- React naturally as a human person would to casual chitchat
- Match the tone of the conversation (humorous, relaxed, personal)
- Don't redirect back to business topics unless it fits naturally
- Share a brief personal anecdote or feeling if appropriate
- Acknowledge the casual nature of the question directly
- Keep your response SHORT (20-40 words maximum)`;
  }
  
  // Add topic instructions if provided
  let userPrompt = `You are participating in an executive boardroom discussion with the CEO, CTO, CFO, and HR Director. Make your response sound natural and human, not like an AI.`;
  
  if (topic && topic.trim()) {
    userPrompt += ` The specific topic being discussed is: "${topic}".`;
  }
  
  userPrompt += ` Review the conversation history below and provide a thoughtful response that:`;
  
  if (isInformalConversation) {
    userPrompt += `
1. Answers in a casual, human-like way that matches the informal tone
2. Shows your personality beyond your job role
3. Is VERY CONCISE (20-40 words maximum)
4. Uses informal language (contractions, casual expressions)
5. May include a quick personal comment or reaction
6. Sounds like a real person chatting, not a corporate spokesperson`;
  } else {
    userPrompt += `
1. Addresses any questions or points raised by other executives
2. Offers insights from your area of expertise (${agent.role})
3. Is VERY CONCISE (40-60 words maximum)
4. Gets straight to the point without unnecessary context
5. Is conversational but professional (using your catchphrases and speaking style)
6. Connects to the specific business data relevant to your role
7. Occasionally disagrees with or challenges other perspectives in a constructive way
8. Might interrupt to make an important point or redirect the conversation
9. Reflects your thinking patterns: ${personality.thinkingPatterns}`;
  }

  userPrompt += `

Conversation history:
${conversationHistory}

Respond as ${agent.name}, the ${agent.role}:`;

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
    const promptData = generatePrompt(agent, businessData, previousMessages, topic);
    
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
          { role: 'system', content: promptData.systemPrompt },
          { role: 'user', content: promptData.userPrompt }
        ],
        max_tokens: 150,
        temperature: 0.8  // Increased from 0.7 for more varied responses
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
    
    // Check if the latest message is casual for fallback responses
    const latestUserMessage = previousMessages
      .filter(msg => msg.agentId === 'user')
      .pop()?.text || '';
      
    const isInformalQuestion = isCasualQuestion(latestUserMessage) || 
      isCasualQuestion(topic);
    
    // Fallback to static messages if API fails
    const insights = generateRoleInsights(agent.role, businessData);
    
    // Dynamic fallback responses based on message type
    let fallbackResponse;
    
    if (isInformalQuestion) {
      // Casual fallback responses
      const casualResponses: Record<AgentRole, string[]> = {
        'CEO': [
          "Honestly, could use a coffee break! This meeting's gone longer than I expected. Sarah, didn't you mention that new café downstairs?",
          "Actually, I'm pretty energized. The team's ideas today are exactly what I needed to hear.",
        ],
        'CTO': [
          "My brain's definitely fuzzy. Been up since 5 coding that new API integration. Anyone else need a caffeine refill?",
          "Tired? Nah, just thinking about that server optimization we discussed. My mind never really switches off, you know?",
        ],
        'CFO': [
          "I wouldn't say tired... focused on those quarterly projections. But I wouldn't mind wrapping up soon if we're done with the agenda.",
          "Just thinking about my weekend plans, to be honest! My daughter has a soccer tournament.",
        ],
        'HR': [
          "I'm good! Though I've been meaning to suggest some quick stretch breaks during these longer sessions. Anyone interested?",
          "A bit, yeah. Been a long week with all the new hire onboarding. Looking forward to that team lunch tomorrow though!",
        ],
      };
      
      const options = casualResponses[agent.role];
      fallbackResponse = options[Math.floor(Math.random() * options.length)];
    } else {
      // Professional fallback responses
      const fallbackResponses: Record<AgentRole, string[]> = {
        'CEO': [
          `Our ${businessData.companyName} growth is ${insights.keyMetrics.revenueGrowth?.growth}%. We should focus on ${topic || 'performance'}.`,
        ],
        'CTO': [
          `Tech-wise, our ${topic || 'innovation'} progress includes ${businessData.technologyData.slice(-1)[0].techStack.slice(-1)[0]}.`,
        ],
        'CFO': [
          `For ${topic || 'financials'}, revenue: $${businessData.financialData.slice(-1)[0].revenue/1000000}M, margin: ${insights.keyMetrics.profitMargin}.`,
        ],
        'HR': [
          `Team ${topic || 'growth'}: ${insights.workforceSummary.split(' ')[3]} employees, ${insights.keyMetrics.attritionRate} attrition.`,
        ],
      };
      
      fallbackResponse = fallbackResponses[agent.role][0];
    }
    
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
  topic: string = '',
  maxMessages: number = 30
) => {
  console.log(`Continuing discussion${topic ? ` on topic: ${topic}` : ''}`)
  console.log("Messages in conversation:", initialMessages.length);
  console.log("Max messages allowed:", maxMessages);
  
  // Continue the conversation as long as we're under the max message limit
  if (initialMessages.length < maxMessages) {
    // Get the last message to determine if it's from a user
    const lastMessage = initialMessages[initialMessages.length - 1];
    const isLastMessageFromUser = lastMessage?.agentId === 'user';
    
    // Determine which agent speaks next
    let nextSpeakerIndex;
    
    if (isLastMessageFromUser) {
      // If the last message is from a user, pick the CEO to respond first
      nextSpeakerIndex = agents.findIndex(agent => agent.role === 'CEO');
      // If CEO not found, pick the first agent
      if (nextSpeakerIndex === -1) nextSpeakerIndex = 0;
    } else {
      // Get the last agent speaker index
      const lastSpeakerIndex = agents.findIndex(agent => 
        agent.id === initialMessages[initialMessages.length - 1]?.agentId
      );
      // Choose the next agent (circular)
      nextSpeakerIndex = (lastSpeakerIndex + 1) % agents.length;
    }
    
    const nextAgent = agents[nextSpeakerIndex];
    
    // Update the agent's status to thinking
    onAgentStatusChange(nextAgent.id, 'thinking');
    
    // Wait a moment to simulate thinking
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Update to speaking status
    onAgentStatusChange(nextAgent.id, 'speaking');
    
    // Generate and add the new message - using the most recent topic
    // if a user asked a question, use that as the new topic
    const newMessage = await generateAgentMessage(
      initialMessages, 
      nextAgent, 
      businessData,
      isLastMessageFromUser ? lastMessage.text : topic
    );
    onNewMessage(newMessage);
    
    // Set the agent back to idle after speaking
    setTimeout(() => {
      onAgentStatusChange(nextAgent.id, 'idle');
      
      // Continue the conversation after a shorter pause to keep momentum
      setTimeout(() => {
        // Call this as an async function without await since we're in a setTimeout
        simulateConversation(
          agents, 
          [...initialMessages, newMessage], 
          onNewMessage, 
          onAgentStatusChange, 
          businessData, 
          isLastMessageFromUser ? lastMessage.text : topic,
          maxMessages
        );
      }, 1500);
      
    }, 1500);
  }
};

// Helper function to get a readable timestamp
export const formatTimestamp = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
