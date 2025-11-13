
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
      'avatar-container cursor-pointer relative transition-all duration-300',
      status === 'speaking' && 'speaking ring-2 ring-foreground ring-offset-2 ring-offset-background',
      sizeClasses[size]
    )}>
      <img 
        src={avatar || fallbackImage} 
        alt={`${role} - ${name}`}
        className={cn(
          'h-full w-full object-cover transition-all duration-300 relative z-10 grayscale hover:grayscale-0',
          status === 'speaking' ? 'scale-105 grayscale-0' : ''
        )}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = fallbackImage;
        }}
      />
      {status === 'speaking' && (
        <div className="absolute -inset-1 rounded-full bg-foreground/10 animate-pulse" />
      )}
    </div>
  );
};

export default AvatarAnimation;
