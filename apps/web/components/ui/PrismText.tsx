import React from 'react';

interface PrismTextProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'diagonal' | 'horizontal';
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'p';
}

export function PrismText({ children, className = '', direction = 'diagonal', as: Tag = 'span' }: PrismTextProps) {
  return <Tag className={`${direction === 'horizontal' ? 'prism-text-lr' : 'prism-text'} ${className}`}>{children}</Tag>;
}
