import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send } from 'lucide-react';

interface BoardroomQuestionInputProps {
  onSendQuestion: (question: string) => void;
  disabled?: boolean;
}

const BoardroomQuestionInput = ({ onSendQuestion, disabled = false }: BoardroomQuestionInputProps) => {
  const [question, setQuestion] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasAskedQuestion, setHasAskedQuestion] = useState(false);
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
              placeholder={hasAskedQuestion ? "Ask a follow-up question..." : "Type your question to the executive board..."}
              className="question-input"
              disabled={disabled}
            />
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
        </form>
      )}
    </div>
  );
};

export default BoardroomQuestionInput;
