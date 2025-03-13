import React, { useState, useEffect } from 'react';
import MeetingGrid from '../components/MeetingGrid';
import TranscriptPanel from '../components/TranscriptPanel';
import ControlPanel from '../components/ControlPanel';
import BusinessDataPanel from '../components/BusinessDataPanel';
import DatasetUploadModal from '../components/DatasetUploadModal';
import { MeetingState, Message, Agent } from '../types';
import { getDefaultAgents, getInitialMessages, simulateConversation } from '../utils/agentUtils';
import { toast } from '@/hooks/use-toast';
import { BusinessData } from '../types/businessData';
import { sampleBusinessData } from '../data/sampleBusinessData';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { FormEvent, useState as useFormState } from 'react';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const Index = () => {
  // Initialize meeting state
  const [meetingState, setMeetingState] = useState<MeetingState>({
    status: 'initializing',
    agents: getDefaultAgents(),
    messages: getInitialMessages(),
    currentSpeaker: null,
    transcriptVisible: true,
  });
  
  // Additional state for business data visibility
  const [businessDataVisible, setBusinessDataVisible] = useState(false);
  
  // Dataset upload modal state
  const [isDatasetModalOpen, setIsDatasetModalOpen] = useState(false);
  
  // Business data state
  const [businessData, setBusinessData] = useState<BusinessData | null>(null);
  
  // Start discussion dialog state
  const [isStartDiscussionDialogOpen, setIsStartDiscussionDialogOpen] = useState(false);
  const [discussionTopic, setDiscussionTopic] = useState('');
  
  // Start the meeting simulation
  const startDiscussion = (topic: string = '') => {
    // Set meeting status to active
    setMeetingState(prev => ({
      ...prev,
      status: 'active',
    }));
    
    // Start the conversation simulation
    simulateConversation(
      meetingState.agents,
      meetingState.messages,
      handleNewMessage,
      handleAgentStatusChange,
      businessData || sampleBusinessData,
      topic
    );
    
    toast({
      title: "Boardroom Discussion Started",
      description: topic ? `Topic: ${topic}` : "All participants have joined the call.",
      duration: 3000,
    });
  };
  
  // Handle new messages from agents
  const handleNewMessage = (message: Message) => {
    setMeetingState(prev => ({
      ...prev,
      messages: [...prev.messages, message],
      currentSpeaker: message.agentId,
    }));
  };
  
  // Handle agent status changes
  const handleAgentStatusChange = (agentId: string, status: Agent['status']) => {
    setMeetingState(prev => ({
      ...prev,
      agents: prev.agents.map(agent => 
        agent.id === agentId ? { ...agent, status } : agent
      ),
      currentSpeaker: status === 'speaking' ? agentId : prev.currentSpeaker,
    }));
  };
  
  // Toggle transcript visibility
  const handleToggleTranscript = () => {
    setMeetingState(prev => ({
      ...prev,
      transcriptVisible: !prev.transcriptVisible,
    }));
  };
  
  // Toggle business data visibility
  const handleToggleBusinessData = () => {
    setBusinessDataVisible(prev => !prev);
    
    if (!businessDataVisible) {
      toast({
        title: "Business Data Opened",
        description: "Viewing company performance metrics and KPIs.",
        duration: 3000,
      });
    }
  };
  
  // Toggle meeting status (pause/resume)
  const handleToggleStatus = () => {
    const newStatus = meetingState.status === 'active' ? 'paused' : 'active';
    
    setMeetingState(prev => ({
      ...prev,
      status: newStatus,
    }));
    
    toast({
      title: newStatus === 'active' ? "Meeting Resumed" : "Meeting Paused",
      description: newStatus === 'active' 
        ? "The conversation will continue." 
        : "The conversation has been paused.",
      duration: 3000,
    });
    
    // In a real app, we would signal to the backend to pause/resume the agents
  };
  
  // End the meeting
  const handleEndMeeting = () => {
    setMeetingState(prev => ({
      ...prev,
      status: 'ended',
      currentSpeaker: null,
    }));
    
    // Set all agents to idle
    setMeetingState(prev => ({
      ...prev,
      agents: prev.agents.map(agent => ({ ...agent, status: 'idle' })),
    }));
    
    toast({
      title: "Meeting Ended",
      description: "The meeting has been concluded. You can export the transcript.",
      duration: 5000,
    });
    
    // In a real app, we would signal to the backend to stop the agents
  };
  
  // Export chat transcript
  const handleExportChat = () => {
    // Create a formatted transcript
    const transcript = meetingState.messages.map(msg => {
      const agent = meetingState.agents.find(a => a.id === msg.agentId);
      return `[${msg.timestamp.toLocaleString()}] ${agent?.name} (${agent?.role}): ${msg.text}`;
    }).join('\n\n');
    
    // Create a downloadable blob
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `meeting-transcript-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Transcript Exported",
      description: "The meeting transcript has been downloaded.",
      duration: 3000,
    });
  };
  
  // Handle dataset upload
  const handleDatasetUploaded = (newData: BusinessData) => {
    setBusinessData(newData);
    
    toast({
      title: "Dataset Uploaded",
      description: `Successfully loaded data for ${newData.companyName}.`,
      duration: 3000,
    });
    
    // Show the business data panel after upload
    setBusinessDataVisible(true);
    
    // Set meeting state to initializing to show it's ready to start
    setMeetingState(prev => ({
      ...prev,
      status: 'initializing',
    }));
  };
  
  // Open start discussion dialog
  const handleOpenStartDiscussionDialog = () => {
    setIsStartDiscussionDialogOpen(true);
  };
  
  // Handle start discussion form submission
  const handleStartDiscussionSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsStartDiscussionDialogOpen(false);
    startDiscussion(discussionTopic);
  };
  
  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="glass-panel mb-6 p-4 flex justify-between items-center animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold">{businessData?.companyName || 'Executive Meeting'}</h1>
          <p className="text-muted-foreground">
            {meetingState.status === 'initializing' ? 'Ready to start discussion' :
             meetingState.status === 'active' ? 'In Progress' :
             meetingState.status === 'paused' ? 'Paused' : 'Ended'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`h-3 w-3 rounded-full ${
            meetingState.status === 'active' ? 'bg-meeting-green animate-pulse' :
            meetingState.status === 'paused' ? 'bg-meeting-yellow' :
            meetingState.status === 'ended' ? 'bg-meeting-red' : 'bg-meeting-blue animate-pulse'
          }`}></span>
          <span className="text-sm font-medium">
            {meetingState.status === 'active' ? 'Live' :
             meetingState.status === 'paused' ? 'Paused' :
             meetingState.status === 'ended' ? 'Ended' : 'Ready'}
          </span>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 flex flex-col space-y-6">
        {/* Business data panel (conditionally displayed) */}
        <BusinessDataPanel 
          isVisible={businessDataVisible}
          onToggleVisibility={handleToggleBusinessData}
        />
        
        {/* Meeting grid */}
        <div className="flex-1">
          <MeetingGrid 
            agents={meetingState.agents}
            messages={meetingState.messages}
            currentSpeaker={meetingState.currentSpeaker}
          />
        </div>
        
        {/* Transcript panel (conditionally displayed) */}
        {meetingState.transcriptVisible && (
          <TranscriptPanel 
            messages={meetingState.messages}
            agents={meetingState.agents}
            isVisible={meetingState.transcriptVisible}
          />
        )}
        
        {/* Controls */}
        <ControlPanel 
          onToggleTranscript={handleToggleTranscript}
          transcriptVisible={meetingState.transcriptVisible}
          onToggleBusinessData={handleToggleBusinessData}
          businessDataVisible={businessDataVisible}
          onExportChat={handleExportChat}
          meetingStatus={meetingState.status}
          onToggleStatus={handleToggleStatus}
          onEndMeeting={handleEndMeeting}
          onUploadDataset={() => setIsDatasetModalOpen(true)}
          onStartDiscussion={handleOpenStartDiscussionDialog}
          hasBusinessData={!!businessData}
        />
      </main>
      
      {/* Dataset Upload Modal */}
      <DatasetUploadModal 
        open={isDatasetModalOpen}
        onClose={() => setIsDatasetModalOpen(false)}
        onDatasetUploaded={handleDatasetUploaded}
      />
      
      {/* Start Discussion Dialog */}
      <AlertDialog open={isStartDiscussionDialogOpen} onOpenChange={setIsStartDiscussionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start Boardroom Discussion</AlertDialogTitle>
            <AlertDialogDescription>
              Provide a topic for the executive team to discuss, or leave blank for a general business review.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <form onSubmit={handleStartDiscussionSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="topic">Discussion Topic (Optional)</Label>
                <Input 
                  id="topic" 
                  placeholder="e.g., 'Q3 Budget Planning' or 'New Product Launch Strategy'" 
                  value={discussionTopic}
                  onChange={(e) => setDiscussionTopic(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button type="submit">Start Discussion</Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;
