
import { Agent, Message } from '../types';
import { BusinessData } from '../types/businessData';

/**
 * Extracts key decisions from the meeting messages
 */
export const extractDecisions = (messages: Message[], agents: Agent[]): string[] => {
  // This is a simplified example. In a real application, 
  // this would use NLP to extract actual decisions.
  
  // For now, we'll simulate decisions by extracting statements that sound like decisions
  const decisiveKeywords = [
    'decided', 'agreed', 'concluded', 'determined', 'resolved',
    'approved', 'confirmed', 'finalized', 'selected', 'chosen',
    'we will', 'we should', 'let\'s', 'we need to', 'we must'
  ];
  
  const decisions: string[] = [];
  
  messages.forEach(message => {
    const agent = agents.find(a => a.id === message.agentId);
    
    // Skip if we can't identify the agent
    if (!agent) return;
    
    // Split the message into sentences
    const sentences = message.text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    sentences.forEach(sentence => {
      // Check if the sentence contains any decisive keywords
      if (decisiveKeywords.some(keyword => sentence.toLowerCase().includes(keyword))) {
        // Format as attributable decision
        decisions.push(`${agent.name} (${agent.role}): "${sentence.trim()}"`);
      }
    });
  });
  
  return decisions;
};

/**
 * Generates a meeting summary based on messages and business data
 */
export const generateMeetingSummary = (
  messages: Message[], 
  agents: Agent[], 
  businessData: BusinessData,
  topic?: string
): string => {
  const companyName = businessData.companyName || 'the company';
  const financials = businessData.financialMetrics || {};
  const performance = businessData.performanceData || {};
  
  // Extract what appears to be decisions from the meeting
  const decisions = extractDecisions(messages, agents);
  
  // Generate a summary - in a real app this would be done with an LLM
  return `
## ${topic || 'Business Performance'} Meeting Summary

*Executive Discussion for ${companyName}*

### Key Points Discussed:
- Financial Performance: ${financials.revenueGrowth > 0 ? 'Positive' : 'Negative'} revenue trends showing ${financials.revenueGrowth}% growth
- Performance indicators across departments show ${performance.overallScore > 70 ? 'strong' : 'areas needing improvement'}
- Employee satisfaction at ${performance.employeeSatisfaction}%

### Decisions Made:
${decisions.length > 0 
  ? decisions.map(d => `- ${d}`).join('\n')
  : '- No formal decisions were recorded in this meeting'}

### Next Steps:
- Follow up meeting to be scheduled to address remaining open items
- Department heads to prepare implementation plans for agreed actions
- Financial team to update forecasts based on today's discussion

*Summary generated on ${new Date().toLocaleDateString()}*
  `;
};

/**
 * Exports the meeting summary as a text file
 */
export const exportDecisionSummary = (
  summary: any, 
  businessData: BusinessData,
  topic: string = 'Business Performance'
): void => {
  // Generate the summary if not provided
  const textContent = summary || generateMeetingSummary([], [], businessData, topic);
  
  // Create a downloadable blob
  const blob = new Blob([textContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  // Create a temporary link and trigger download
  const a = document.createElement('a');
  a.href = url;
  a.download = `meeting-summary-${new Date().toISOString().slice(0, 10)}.md`;
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
