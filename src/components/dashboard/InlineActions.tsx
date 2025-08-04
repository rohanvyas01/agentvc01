import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MoreHorizontal, 
  Eye, 
  Download, 
  Trash2, 
  Edit3,
  Play,
  Pause,
  Square,
  RotateCcw
} from 'lucide-react';

interface InlineAction {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  action: () => void;
  variant?: 'default' | 'danger' | 'primary';
  disabled?: boolean;
}

interface InlineActionsProps {
  actions: InlineAction[];
  trigger?: 'hover' | 'click';
  position?: 'right' | 'left' | 'center';
  className?: string;
}

const InlineActions: React.FC<InlineActionsProps> = ({
  actions,
  trigger = 'hover',
  position = 'right',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    if (trigger === 'click') {
      setIsOpen(!isOpen);
    }
  };

  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      setIsOpen(false);
    }
  };

  const getVariantStyles = (variant: string = 'default') => {
    switch (variant) {
      case 'danger':
        return 'text-red-400 hover:text-red-300 hover:bg-red-500/20';
      case 'primary':
        return 'text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/20';
      default:
        return 'text-slate-400 hover:text-white hover:bg-slate-600/50';
    }
  };

  const getPositionStyles = () => {
    switch (position) {
      case 'left':
        return 'right-full mr-2';
      case 'center':
        return 'left-1/2 transform -translate-x-1/2';
      default:
        return 'left-full ml-2';
    }
  };

  if (actions.length === 0) {
    return null;
  }

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger Button */}
      <button
        onClick={handleToggle}
        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-600/50 transition-colors duration-200"
        aria-label="More actions"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {/* Actions Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.15 }}
          className={`
            absolute top-0 z-50 min-w-[160px]
            bg-slate-800/95 backdrop-blur-sm border border-slate-700/50 rounded-lg shadow-xl
            ${getPositionStyles()}
          `}
        >
          <div className="py-1">
            {actions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => {
                    action.action();
                    setIsOpen(false);
                  }}
                  disabled={action.disabled}
                  className={`
                    w-full flex items-center px-3 py-2 text-sm transition-colors duration-150
                    ${action.disabled 
                      ? 'text-slate-500 cursor-not-allowed' 
                      : getVariantStyles(action.variant)
                    }
                  `}
                >
                  <IconComponent className="w-4 h-4 mr-3" />
                  {action.label}
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Predefined action creators for common use cases
export const createDeckActions = (
  deckId: string,
  onView: (id: string) => void,
  onDownload: (id: string) => void,
  onDelete: (id: string) => void
): InlineAction[] => [
  {
    id: 'view',
    label: 'View Deck',
    icon: Eye,
    action: () => onView(deckId)
  },
  {
    id: 'download',
    label: 'Download',
    icon: Download,
    action: () => onDownload(deckId)
  },
  {
    id: 'delete',
    label: 'Delete',
    icon: Trash2,
    action: () => onDelete(deckId),
    variant: 'danger'
  }
];

export const createSessionActions = (
  sessionId: string,
  sessionStatus: string,
  onView: (id: string) => void,
  onRestart: (id: string) => void,
  onDelete: (id: string) => void
): InlineAction[] => {
  const actions: InlineAction[] = [
    {
      id: 'view',
      label: 'View Details',
      icon: Eye,
      action: () => onView(sessionId)
    }
  ];

  // Add status-specific actions
  if (sessionStatus === 'completed') {
    actions.push({
      id: 'restart',
      label: 'Practice Again',
      icon: RotateCcw,
      action: () => onRestart(sessionId),
      variant: 'primary'
    });
  }

  actions.push({
    id: 'delete',
    label: 'Delete Session',
    icon: Trash2,
    action: () => onDelete(sessionId),
    variant: 'danger'
  });

  return actions;
};

export const createCompanyActions = (
  onEdit: () => void
): InlineAction[] => [
  {
    id: 'edit',
    label: 'Edit Details',
    icon: Edit3,
    action: onEdit
  }
];

export default InlineActions;