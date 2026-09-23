import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'interactive' | 'featured';
  glow?: 'violet' | 'cyan' | 'pink' | 'emerald' | 'none';
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function GlassCard({ children, className = '', variant = 'default', glow = 'none', onClick, style }: GlassCardProps) {
  const interactive = variant === 'interactive' ? 'glass-card-interactive' : variant === 'default' ? 'glass-card-hover' : '';
  const glowStyle = glow !== 'none' ? {
    violet: { '--hover-glow': '0 0 40px -10px rgba(168,85,247,0.5)' },
    cyan:   { '--hover-glow': '0 0 40px -10px rgba(6,182,212,0.4)' },
    pink:   { '--hover-glow': '0 0 40px -10px rgba(240,171,252,0.35)' },
    emerald:{ '--hover-glow': '0 0 40px -10px rgba(16,185,129,0.4)' },
    none:   {},
  }[glow] : {};

  return (
    <div className={`glass-card ${interactive} ${className}`} onClick={onClick} style={{ ...glowStyle as React.CSSProperties, ...style }}>
      {children}
    </div>
  );
}
