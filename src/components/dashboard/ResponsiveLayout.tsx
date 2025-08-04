import React from 'react';
import { motion } from 'framer-motion';
import { useResponsive, useTouch } from '../../hooks/useResponsive';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  leftColumn: React.ReactNode;
  rightColumn: React.ReactNode;
  className?: string;
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  leftColumn,
  rightColumn,
  className = ""
}) => {
  const { isMobile, isTablet } = useResponsive();
  const isTouch = useTouch();

  // Mobile layout: stack vertically
  if (isMobile) {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Progress indicator or header content */}
        {children}
        
        {/* Main content sections stacked vertically */}
        <div className="space-y-6">
          {leftColumn}
          {rightColumn}
        </div>
      </div>
    );
  }

  // Tablet layout: modified grid with better spacing
  if (isTablet) {
    return (
      <div className={`space-y-6 ${className}`}>
        {children}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            {leftColumn}
          </div>
          <div className="space-y-6">
            {rightColumn}
          </div>
        </div>
      </div>
    );
  }

  // Desktop layout: original 3-column grid
  return (
    <div className={`space-y-6 ${className}`}>
      {children}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {leftColumn}
        </div>
        <div className="space-y-8">
          {rightColumn}
        </div>
      </div>
    </div>
  );
};

export default ResponsiveLayout;