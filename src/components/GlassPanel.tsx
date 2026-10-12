import React from 'react';

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'subtle' | 'interactive';
  glowBorder?: boolean;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  className = '',
  variant = 'primary',
  glowBorder = false,
  ...props
}) => {
  const variantClass =
    variant === 'interactive'
      ? 'glass-panel glass-panel-interactive'
      : variant === 'subtle'
      ? 'glass-panel-subtle'
      : 'glass-panel';

  const glowStyle = glowBorder ? 'border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.06)]' : '';

  return (
    <div
      className={`relative rounded-2xl overflow-hidden transition-all duration-200 ${variantClass} ${glowStyle} ${className}`}
      {...props}
    >
      {/* Specular hairline top rim highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      {children}
    </div>
  );
};
