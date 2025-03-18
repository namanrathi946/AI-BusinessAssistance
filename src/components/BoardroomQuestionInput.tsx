import React, { useState, useRef } from 'react';
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
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      onSendQuestion(question);
      setQuestion('');
      
      // Keep expanded so the user can easily ask another question
      // This improves UX by keeping the input available
    }
  };
  
  const toggleExpand = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    if (newState) {
      // Focus the input when expanded
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
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
          <span>Ask Boardroom a Question</span>
        </Button>
      ) : (
        <form onSubmit={handleSubmit} className="question-form">
          <div className="input-wrapper">
            <Input
              ref={inputRef}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Type your question to the executive board..."
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
            Cancel
          </Button>
        </form>
      )}
    </div>
  );
};

export default BoardroomQuestionInput;
