
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send, Coffee } from 'lucide-react';

interface BoardroomQuestionInputProps {
  onSendQuestion: (question: string) => void;
  disabled?: boolean;
}

const BoardroomQuestionInput = ({ onSendQuestion, disabled = false }: BoardroomQuestionInputProps) => {
  const [question, setQuestion] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasAskedQuestion, setHasAskedQuestion] = useState(false);
  const [isCasualMode, setIsCasualMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isExpanded]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      onSendQuestion(question);
      setQuestion('');
      setHasAskedQuestion(true);
      
      // Auto-detect if the question was casual
      const casualPatterns = [
        /whats up/i, /how's it going/i, /tired/i, /bored/i,
        /hey guys/i, /hello everyone/i, /hi all/i,
        /what do you think/i, /how do you feel/i,
        /anyone/i, /everybody/i, /everyone/i,
        /so/i, /anyway/i, /by the way/i, /btw/i
      ];
      
      const isCasual = casualPatterns.some(pattern => pattern.test(question));
      if (isCasual) {
        setIsCasualMode(true);
      }
      
      setIsExpanded(true);
      
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };
  
  const toggleExpand = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
  };
  
  const toggleCasualMode = () => {
    setIsCasualMode(!isCasualMode);
  };
  
  return (
    <div className={`boardroom-question-input ${isExpanded ? 'expanded' : ''}`}>
      {!isExpanded ? (
        <Button 
          onClick={toggleExpand} 
          className="floating-button"
          disabled={disabled}
        >
          <MessageSquare size={20} />
          <span>{hasAskedQuestion ? "Ask Another Question" : "Ask Boardroom a Question"}</span>
        </Button>
      ) : (
        <form onSubmit={handleSubmit} className="question-form">
          <div className="input-wrapper">
            <Input
              ref={inputRef}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={
                isCasualMode 
                  ? "Chat casually with the team..." 
                  : hasAskedQuestion 
                    ? "Ask a follow-up question..." 
                    : "Type your question to the executive board..."
              }
              className={`question-input ${isCasualMode ? 'casual-mode' : ''}`}
              disabled={disabled}
            />
            <Button 
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleCasualMode}
              className={`mode-toggle ${isCasualMode ? 'active' : ''}`}
              title={isCasualMode ? "Switch to business mode" : "Switch to casual chat mode"}
            >
              <Coffee size={18} className={isCasualMode ? "text-amber-500" : ""} />
            </Button>
            <Button 
              type="submit" 
              disabled={!question.trim() || disabled} 
              className="submit-button"
            >
              <Send size={18} />
            </Button>
          </div>
          <Button 
            type="button" 
            variant="ghost" 
            onClick={toggleExpand} 
            className="cancel-button"
          >
            {hasAskedQuestion ? "Hide" : "Cancel"}
          </Button>
          {isCasualMode && (
            <div className="text-xs text-muted-foreground mt-1 italic">
              Casual chat mode is on. The executives will respond in a more relaxed, human way.
            </div>
          )}
        </form>
      )}
      <style jsx>{`
        .question-input.casual-mode {
          background-color: rgba(251, 191, 36, 0.05);
          border-color: rgba(251, 191, 36, 0.3);
        }
        .mode-toggle.active {
          background-color: rgba(251, 191, 36, 0.1);
        }
      `}</style>
    </div>
  );
};

export default BoardroomQuestionInput;
