import React from 'react';
import { motion } from 'framer-motion';
import { ClipLoader, PulseLoader, ScaleLoader } from 'react-spinners';
import { Loader2, Zap, Upload, MessageSquare, BarChart3 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = '#6366f1',
  className = '' 
}) => {
  const sizeMap = {
    sm: 16,
    md: 24,
    lg: 32
  };

  return (
    <ClipLoader 
      color={color} 
      size={sizeMap[size]} 
      className={className}
    />
  );
};

interface LoadingCardProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const LoadingCard: React.FC<LoadingCardProps> = ({
  title = 'Loading...',
  description,
  icon,
  className = ''
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass rounded-2xl p-6 ${className}`}
    >
      <div className="text-center">
        {icon && (
          <div className="mb-4">
            {icon}
          </div>
        )}
        <div className="mb-4">
          <LoadingSpinner size="md" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        {description && (
          <p className="text-slate-400 text-sm">{description}</p>
        )}
      </div>
    </motion.div>
  );
};

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`glass rounded-2xl p-6 ${className}`}>
      <div className="animate-pulse">
        <div className="h-4 bg-slate-700 rounded w-3/4 mb-3"></div>
        <div className="h-3 bg-slate-700 rounded w-1/2 mb-4"></div>
        <div className="space-y-2">
          <div className="h-3 bg-slate-700 rounded"></div>
          <div className="h-3 bg-slate-700 rounded w-5/6"></div>
        </div>
      </div>
    </div>
  );
};

export const DashboardLoadingState: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-2xl p-8 text-center max-w-md mx-auto"
        >
          <div className="mb-6">
            <Loader2 className="w-12 h-12 text-indigo-400 mx-auto animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Loading Dashboard
          </h2>
          <p className="text-slate-400 text-sm mb-4">
            Preparing your personalized experience...
          </p>
          <div className="flex justify-center">
            <PulseLoader color="#6366f1" size={8} />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

interface SectionLoadingProps {
  section: string;
  icon?: React.ReactNode;
  message?: string;
}

export const SectionLoading: React.FC<SectionLoadingProps> = ({
  section,
  icon,
  message
}) => {
  const getDefaultIcon = (sectionName: string) => {
    switch (sectionName.toLowerCase()) {
      case 'sessions':
      case 'session history':
        return <MessageSquare className="w-8 h-8 text-indigo-400" />;
      case 'decks':
      case 'uploaded decks':
        return <Upload className="w-8 h-8 text-indigo-400" />;
      case 'analytics':
      case 'reports':
        return <BarChart3 className="w-8 h-8 text-indigo-400" />;
      default:
        return <Zap className="w-8 h-8 text-indigo-400" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6"
    >
      <div className="text-center">
        <div className="mb-4">
          {icon || getDefaultIcon(section)}
        </div>
        <div className="mb-4">
          <ScaleLoader color="#6366f1" height={20} width={3} />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          Loading {section}
        </h3>
        <p className="text-slate-400 text-sm">
          {message || `Fetching your ${section.toLowerCase()}...`}
        </p>
      </div>
    </motion.div>
  );
};

interface InlineLoadingProps {
  text?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const InlineLoading: React.FC<InlineLoadingProps> = ({
  text = 'Loading...',
  size = 'sm',
  className = ''
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <LoadingSpinner size={size} />
      <span className="text-slate-400 text-sm">{text}</span>
    </div>
  );
};

interface ButtonLoadingProps {
  loading: boolean;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export const ButtonLoading: React.FC<ButtonLoadingProps> = ({
  loading,
  children,
  className = '',
  disabled = false
}) => {
  return (
    <button
      disabled={loading || disabled}
      className={`relative ${className} ${loading ? 'cursor-not-allowed opacity-75' : ''}`}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner size="sm" color="currentColor" />
        </div>
      )}
      <div className={loading ? 'opacity-0' : 'opacity-100'}>
        {children}
      </div>
    </button>
  );
};

export const DataLoadingPlaceholder: React.FC<{ 
  rows?: number; 
  className?: string;
}> = ({ rows = 3, className = '' }) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-slate-700 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-700 rounded w-3/4"></div>
              <div className="h-3 bg-slate-700 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};