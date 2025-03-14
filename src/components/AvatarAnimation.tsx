
import React from 'react';
import { Agent } from '../types';
import { cn } from '@/lib/utils';

interface AvatarAnimationProps {
  agent: Agent;
  size?: 'sm' | 'md' | 'lg';
}

const AvatarAnimation = ({ agent, size = 'md' }: AvatarAnimationProps) => {
  const { status, avatar, role, name } = agent;
  
  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-24 w-24',
    lg: 'h-32 w-32',
  };
  
  // Placeholder image in case avatar is not available
  const fallbackImage = `https://ui-avatars.com/api/?name=${name}&background=random&color=fff&size=128`;
  
  return (
    <div className={cn(
      'avatar-container hover-glow cursor-pointer',
      status === 'speaking' && 'speaking',
      sizeClasses[size]
    )}>
      <div className={cn(
        'avatar-pulse',
        status === 'speaking' && 'speaking',
        status === 'listening' && 'listening'
      )} />
      
      <img 
        src={avatar || fallbackImage} 
        alt={`${role} - ${name}`}
        className={cn(
          'h-full w-full object-cover transition-transform duration-300',
          status === 'speaking' ? 'animate-bounce-subtle' : 'hover:scale-110'
        )}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = fallbackImage;
        }}
      />
    </div>
  );
};

export default AvatarAnimation;
