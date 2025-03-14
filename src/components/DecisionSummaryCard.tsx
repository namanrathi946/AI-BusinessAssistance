
import React from 'react';
import { Agent, Message, MeetingState } from '../types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { FileDownIcon, CheckCircleIcon, ListChecksIcon, DatabaseIcon, FileTextIcon } from 'lucide-react';
import { generateDecisionSummary } from '../utils/summaryUtils';
import { BusinessData } from '../types/businessData';

interface DecisionSummaryCardProps {
  messages: Message[];
  agents: Agent[];
  businessData: BusinessData | null;
  discussionTopic: string | undefined;
  onExport: () => void;
}

const DecisionSummaryCard = ({ 
  messages, 
  agents, 
  businessData, 
  discussionTopic, 
  onExport 
}: DecisionSummaryCardProps) => {
  const [summary, setSummary] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const generateSummary = async () => {
      setLoading(true);
      try {
        const generatedSummary = await generateDecisionSummary(
          messages, 
          agents, 
          businessData, 
          discussionTopic || 'business performance'
        );
        setSummary(generatedSummary);
      } catch (error) {
        console.error('Error generating summary:', error);
        // Fallback summary if API fails
        setSummary({
          executiveSummary: "The board has concluded the discussion on " + (discussionTopic || "business performance") + ".",
          agentInsights: {
            CEO: "Strategic alignment with company goals is critical.",
            CFO: "Budget considerations must be prioritized.",
            CTO: "Technical infrastructure changes will be required.",
            HR: "Workforce planning needs attention.",
          },
          riskAssessment: "Several risks were identified that require further analysis.",
          actionPlan: [
            { action: "Review detailed financial projections", owner: "CFO", timeline: "Next 2 weeks" },
            { action: "Assess technical requirements", owner: "CTO", timeline: "Next 3 weeks" },
            { action: "Develop talent acquisition plan", owner: "HR", timeline: "Next month" },
            { action: "Finalize strategic roadmap", owner: "CEO", timeline: "Next quarter" },
          ],
          followUpSuggestion: "A follow-up meeting to review progress is recommended in 30 days.",
          finalMessage: "This recommendation represents our collective analysis based on current business metrics and market conditions.",
        });
      } finally {
        setLoading(false);
      }
    };
    
    generateSummary();
  }, [messages, agents, businessData, discussionTopic]);

  if (loading) {
    return (
      <Card className="w-full animate-pulse">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileTextIcon className="h-5 w-5" />
            <div className="h-6 w-64 bg-muted rounded"></div>
          </CardTitle>
          <CardDescription>
            <div className="h-4 w-full bg-muted rounded"></div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-4 w-full bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summary) return null;

  return (
    <Card className="w-full glass-panel animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-meeting-blue">
          <CheckCircleIcon className="h-5 w-5" />
          📋 Final Recommendation by AI Boardroom
        </CardTitle>
        <CardDescription>
          Topic: {discussionTopic || "Business Performance Review"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Executive Summary */}
        <div>
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <FileTextIcon className="h-4 w-4" /> Executive Summary
          </h3>
          <p className="text-muted-foreground">{summary.executiveSummary}</p>
        </div>
        
        {/* Individual Agent Insights */}
        <div>
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <DatabaseIcon className="h-4 w-4" /> Agent Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(summary.agentInsights).map(([role, insight]) => (
              <div key={role} className="border rounded-lg p-3">
                <h4 className="font-medium">{role}</h4>
                <p className="text-sm text-muted-foreground">{insight}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Risk Assessment */}
        <div>
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            ⚠️ Risk Assessment
          </h3>
          <p className="text-muted-foreground">{summary.riskAssessment}</p>
        </div>
        
        {/* Action Plan */}
        <div>
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <ListChecksIcon className="h-4 w-4" /> Recommended Action Plan
          </h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Timeline</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.actionPlan.map((item: any, index: number) => (
                <TableRow key={index}>
                  <TableCell>{item.action}</TableCell>
                  <TableCell>{item.owner}</TableCell>
                  <TableCell>{item.timeline}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Follow-up Suggestion */}
        <div>
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            👀 Follow-up Suggestion
          </h3>
          <p className="text-muted-foreground">{summary.followUpSuggestion}</p>
        </div>
        
        {/* Final Message */}
        <div className="border-t pt-4 mt-4">
          <p className="text-sm italic">{summary.finalMessage}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button 
          onClick={onExport} 
          variant="outline" 
          className="flex items-center gap-2"
        >
          <FileDownIcon className="h-4 w-4" />
          Export Summary
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DecisionSummaryCard;
