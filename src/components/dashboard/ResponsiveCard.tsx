import React from 'react';
import { motion } from 'framer-motion';
import { useResponsive, useTouch } from '../../hooks/useResponsive';

interface ResponsiveCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'compact';
  hover?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  children,
  className = "",
  variant = 'default',
  hover = true,
  onClick,
  disabled = false
}) => {
  const { isMobile, isTablet } = useResponsive();
  const isTouch = useTouch();

  const getCardClasses = () => {
    const baseClasses = "glass rounded-2xl border border-slate-700/30 transition-all duration-300";
    
    // Responsive padding
    const paddingClasses = isMobile 
      ? "p-4" 
      : isTablet 
        ? "p-5" 
        : variant === 'compact' 
          ? "p-4" 
          : variant === 'elevated' 
            ? "p-8" 
            : "p-6";

    // Hover effects (disabled on touch devices)
    const hoverClasses = hover && !isTouch && !disabled
      ? "hover:border-slate-600/50 hover:transform hover:translateY(-1px)"
      : "";

    // Click effects
    const clickClasses = onClick && !disabled
      ? "cursor-pointer active:scale-[0.98]"
      : disabled
        ? "opacity-50 cursor-not-allowed"
        : "";

    // Variant-specific classes
    const variantClasses = variant === 'elevated'
      ? "shadow-xl"
      : variant === 'compact'
        ? "shadow-sm"
        : "shadow-lg";

    return `${baseClasses} ${paddingClasses} ${hoverClasses} ${clickClasses} ${variantClasses} ${className}`;
  };

  const cardContent = (
    <div className={getCardClasses()}>
      {children}
    </div>
  );

  if (onClick && !disabled) {
    return (
      <motion.div
        whileTap={isTouch ? { scale: 0.98 } : {}}
        onClick={onClick}
        className="w-full"
      >
        {cardContent}
      </motion.div>
    );
  }

  return cardContent;
};

export default ResponsiveCard;