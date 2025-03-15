
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
      return `${agent?.name} (${agent?.role}): ${msg.text}`;
    }).join('\n\n');
    
    // Create business data context
    let businessContext = "No business data available.";
    if (businessData) {
      const currentYearData = getCurrentYearData(businessData);
      businessContext = `
Company: ${businessData.companyName}
Industry: ${businessData.industry || "Technology"}
Year: ${currentYearData.year}
Revenue: $${(currentYearData.financial?.revenue || 0) / 1000000}M
Profit: $${(currentYearData.financial?.profit || 0) / 1000000}M
Employees: ${currentYearData.hr?.totalEmployees}
Market Share: ${currentYearData.marketing?.marketShare}%
Customer Satisfaction: ${currentYearData.strategic?.customerSatisfaction}/10
Key Products: ${businessData.products?.join(', ') || "Various technology products"}
      `;
    }
    
    // Create the prompt for generating the summary
    const systemPrompt = `You are a skilled business consultant with expertise in synthesizing executive discussions and creating actionable decision summaries. Your task is to create a natural, human-like summary after a boardroom discussion between:

- Alexandra Chen (CEO): Strategic, visionary, focused on growth and market position
- Michael Reynolds (CTO): Technical, innovative, focused on technology implementation and scalability
- Sarah Williams (CFO): Analytical, detail-oriented, focused on financial performance and ROI
- David Martinez (HR): People-focused, empathetic, concerned with culture and talent management

Please create a realistic, human-sounding decision summary for a discussion on: "${discussionTopic}"

Use this business data for context:
${businessContext}

Create a summary that sounds like it was written by a thoughtful business professional who was present at the meeting - not an AI. Use natural language with some business terminology, but avoid being overly formal or robotic.`;

    const userPrompt = `Based on the executive discussion transcript below, create a complete, human-like decision summary with:

1. Executive Summary - A concise overview that captures the essence of the discussion and final recommendations (3-4 natural-sounding sentences)
2. Key Insights - The most significant points raised, attributed to specific executives (use their names)
3. Decision Points - The actual decisions made during the meeting
4. Potential Risks and Mitigations - Concerns raised and how they'll be addressed
5. Action Plan - 3-5 specific, assigned next steps with realistic timelines
6. Follow-up Plan - When and how progress will be reviewed

Here's the transcript:
${transcript}

Return the results as a JSON object with these fields:
- executiveSummary
- keyInsights (array of objects with insight and attribution)
- decisionPoints (array of strings)
- riskAssessment (array of objects with risk and mitigation)
- actionPlan (array of objects with action, owner, timeline)
- followUpPlan
- conclusion`;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 1200,
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
        keyInsights: [
          { insight: "Strategic priorities need realignment with current market conditions.", attribution: "Alexandra Chen (CEO)" },
          { insight: "Technical infrastructure requires scalability improvements.", attribution: "Michael Reynolds (CTO)" },
          { insight: "Budget adjustments needed to support growth initiatives.", attribution: "Sarah Williams (CFO)" },
          { insight: "Talent acquisition strategy should focus on specialized skills.", attribution: "David Martinez (HR)" }
        ],
        decisionPoints: [
          "Allocate additional budget to cloud infrastructure",
          "Initiate quarterly market analysis",
          "Develop specialized recruitment strategy",
          "Review product roadmap priorities"
        ],
        riskAssessment: [
          { risk: "Market competition intensifying", mitigation: "Accelerate key product launches" },
          { risk: "Technical debt accumulation", mitigation: "Dedicate 20% of engineering time to maintenance" },
          { risk: "Rising acquisition costs", mitigation: "Optimize marketing channels and targeting" }
        ],
        actionPlan: [
          { action: "Complete infrastructure assessment", owner: "Michael (CTO)", timeline: "2 weeks" },
          { action: "Revise Q3/Q4 budget allocations", owner: "Sarah (CFO)", timeline: "1 week" },
          { action: "Develop targeted recruitment plan", owner: "David (HR)", timeline: "3 weeks" },
          { action: "Finalize revised product roadmap", owner: "Alexandra (CEO)", timeline: "End of month" }
        ],
        followUpPlan: "Weekly status updates via email with a comprehensive review meeting in 30 days",
        conclusion: "The executive team has aligned on a balanced approach that addresses immediate technical needs while positioning the company for sustainable growth in an increasingly competitive market."
      };
    }
    
    return summaryData;
  } catch (error) {
    console.error('Error generating decision summary:', error);
    // Return a fallback summary if the API call fails
    return {
      executiveSummary: `Our discussion on ${discussionTopic} highlighted several key priorities requiring immediate action. The team identified both challenges and opportunities that will shape our approach in the coming quarter.`,
      keyInsights: [
        { insight: "We need to focus on our core product offerings while exploring new market segments.", attribution: "Alexandra Chen (CEO)" },
        { insight: "Our technical infrastructure requires scalability improvements to support projected growth.", attribution: "Michael Reynolds (CTO)" },
        { insight: "Q3 budget allocations need adjustment to better align with strategic priorities.", attribution: "Sarah Williams (CFO)" },
        { insight: "Talent acquisition and retention should be prioritized, particularly in engineering.", attribution: "David Martinez (HR)" }
      ],
      decisionPoints: [
        "Reallocate resources to prioritize cloud infrastructure improvements",
        "Initiate targeted recruitment campaign for senior developers",
        "Revise Q3/Q4 marketing budget to focus on high-performing channels",
        "Schedule monthly cross-functional alignment sessions"
      ],
      riskAssessment: [
        { risk: "Increasing competitive pressure in core markets", mitigation: "Accelerate innovation in key product areas" },
        { risk: "Technical debt impacts development velocity", mitigation: "Allocate 20% of sprint capacity to maintenance" },
        { risk: "Rising customer acquisition costs", mitigation: "Refine targeting and optimize conversion funnel" },
        { risk: "Talent shortage in key areas", mitigation: "Implement competitive compensation and remote work options" }
      ],
      actionPlan: [
        { action: "Complete infrastructure assessment", owner: "Michael (CTO)", timeline: "Next 2 weeks" },
        { action: "Revise marketing budget allocations", owner: "Sarah (CFO)", timeline: "This week" },
        { action: "Launch developer recruitment campaign", owner: "David (HR)", timeline: "By month-end" },
        { action: "Finalize Q3/Q4 roadmap priorities", owner: "Alexandra (CEO)", timeline: "Next leadership meeting" }
      ],
      followUpPlan: "We'll have brief weekly check-ins via email with a comprehensive review at our next monthly leadership meeting.",
      conclusion: "With clear ownership and timelines established, we're well-positioned to address the challenges ahead while capitalizing on emerging opportunities. Our focus remains on sustainable growth and maintaining our competitive advantage."
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
