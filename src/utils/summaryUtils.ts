
import { Agent, Message } from '../types';
import { BusinessData } from '../types/businessData';
import { getAgentData, getCurrentYearData } from './businessDataUtils';

const OPENAI_API_KEY = "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";

export const generateDecisionSummary = async (
  messages: Message[],
  agents: Agent[],
  businessData: BusinessData | null,
  discussionTopic: string
) => {
  try {
    // Convert the discussion transcript to a format that the API can use
    const transcript = messages.map(msg => {
      const agent = agents.find(a => a.id === msg.agentId);
      return `${agent?.role}: ${msg.text}`;
    }).join('\n\n');
    
    // Create business data context
    let businessContext = "No business data available.";
    if (businessData) {
      const currentYearData = getCurrentYearData(businessData);
      businessContext = `
Company: ${businessData.companyName}
Revenue: $${(currentYearData.financial?.revenue || 0) / 1000000}M
Profit: $${(currentYearData.financial?.profit || 0) / 1000000}M
Employees: ${currentYearData.hr?.totalEmployees}
Market Share: ${currentYearData.marketing?.marketShare}%
      `;
    }
    
    // Create the prompt for generating the summary
    const systemPrompt = `You are a Senior Strategic Business Assistant responsible for compiling a Final Decision Summary after a multi-agent executive boardroom discussion involving CFO, CTO, HR, and CEO AI agents.

Please generate a professional, human-like business summary for a discussion on: "${discussionTopic}"

Use this business data for context:
${businessContext}`;

    const userPrompt = `Based on the following executive discussion transcript, create a complete decision summary with:

1. Executive Summary - A concise overview of the final recommendation (2-3 sentences)
2. Individual Agent Insights - Key points from each executive
3. Risk Assessment - Highlight shared concerns or dependencies
4. Action Plan - 3-5 concrete next steps with owners and timelines
5. Follow-up Suggestion - What should be reviewed next
6. Final Message - A confident closing statement

Here's the transcript:
${transcript}

Return the results as a JSON object with these fields:
- executiveSummary
- agentInsights (with CEO, CFO, CTO, and HR as keys)
- riskAssessment
- actionPlan (array of objects with action, owner, timeline)
- followUpSuggestion
- finalMessage`;

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
        max_tokens: 1000,
        temperature: 0.7
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }
    
    const data = await response.json();
    const summaryText = data.choices[0].message.content.trim();
    
    // Parse the JSON response
    let summaryData;
    try {
      // Extract JSON from the response (in case the API returns markdown or other formatting)
      const jsonMatch = summaryText.match(/```json\n([\s\S]*)\n```/) || 
                        summaryText.match(/```\n([\s\S]*)\n```/) || 
                        [null, summaryText];
      const jsonString = jsonMatch[1] || summaryText;
      summaryData = JSON.parse(jsonString);
    } catch (error) {
      console.error('Error parsing summary JSON:', error);
      // If JSON parsing fails, create a structured object from the text
      summaryData = {
        executiveSummary: summaryText.substring(0, 200) + "...",
        agentInsights: {
          CEO: "Strategic insights extracted from discussion.",
          CFO: "Financial considerations extracted from discussion.",
          CTO: "Technical insights extracted from discussion.",
          HR: "Workforce insights extracted from discussion."
        },
        riskAssessment: "Multiple risks were identified in the discussion.",
        actionPlan: [
          { action: "Review discussion details", owner: "All", timeline: "Immediate" },
          { action: "Create detailed plan", owner: "CEO", timeline: "1 week" },
          { action: "Implement initial steps", owner: "Team", timeline: "2 weeks" }
        ],
        followUpSuggestion: "Schedule a follow-up meeting to review progress.",
        finalMessage: "This represents the board's collective recommendation based on the discussion."
      };
    }
    
    return summaryData;
  } catch (error) {
    console.error('Error generating decision summary:', error);
    // Return a fallback summary if the API call fails
    return {
      executiveSummary: `The board has concluded the discussion on ${discussionTopic}.`,
      agentInsights: {
        CEO: "Strategic alignment with company goals is critical.",
        CFO: "Budget considerations must be prioritized.",
        CTO: "Technical infrastructure needs assessment.",
        HR: "Workforce planning requires attention."
      },
      riskAssessment: "Several risks were identified that require further analysis.",
      actionPlan: [
        { action: "Review financial projections", owner: "CFO", timeline: "2 weeks" },
        { action: "Assess technical requirements", owner: "CTO", timeline: "3 weeks" },
        { action: "Develop talent plan", owner: "HR", timeline: "1 month" },
        { action: "Finalize strategy", owner: "CEO", timeline: "Next quarter" }
      ],
      followUpSuggestion: "A follow-up meeting is recommended in 30 days.",
      finalMessage: "This recommendation is based on current business metrics and market conditions."
    };
  }
};

// Export PDF or text summary
export const exportDecisionSummary = (
  summary: any,
  businessData: BusinessData | null,
  discussionTopic: string
) => {
  // Create a text version of the summary
  const summaryText = `
# FINAL RECOMMENDATION BY AI BOARDROOM
Topic: ${discussionTopic || "Business Performance Review"}
Company: ${businessData?.companyName || "Your Company"}
Date: ${new Date().toLocaleDateString()}

## EXECUTIVE SUMMARY
${summary.executiveSummary}

## AGENT INSIGHTS

CEO:
${summary.agentInsights.CEO}

CFO:
${summary.agentInsights.CFO}

CTO:
${summary.agentInsights.CTO}

HR:
${summary.agentInsights.HR}

## RISK ASSESSMENT
${summary.riskAssessment}

## RECOMMENDED ACTION PLAN
${summary.actionPlan.map((item: any) => 
  `- ${item.action} (Owner: ${item.owner}, Timeline: ${item.timeline})`
).join('\n')}

## FOLLOW-UP SUGGESTION
${summary.followUpSuggestion}

## FINAL MESSAGE
${summary.finalMessage}

Generated by AI Boardroom
`;

  // Create a downloadable blob
  const blob = new Blob([summaryText], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  // Create a temporary link and trigger download
  const a = document.createElement('a');
  a.href = url;
  a.download = `decision-summary-${new Date().toISOString().slice(0, 10)}.txt`;
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  return true;
};
