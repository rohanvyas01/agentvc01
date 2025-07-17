import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle,
  TrendingUp,
  Building,
  Target,
  Briefcase
} from 'lucide-react';
import { PersonaSelectionProps, InvestorPersona } from '../../types/dashboard';

// Rohan Vyas investor personas
const investorPersonas: InvestorPersona[] = [
  {
    id: 'rohan-angel',
    name: 'Rohan Vyas',
    description: 'Angel Investor',
    specialty: 'Early Stage Startups, Seed Funding',
    experience: 'Serial entrepreneur and angel investor',
    conversationStyle: 'Founder-friendly, focused on vision and execution',
    focusAreas: ['Team Dynamics', 'Market Opportunity', 'Product Vision', 'Go-to-Market'],
    avatarUrl: '/avatars/rohan-angel.jpg'
  },
  {
    id: 'rohan-vc',
    name: 'Rohan Vyas',
    description: 'Venture Capital',
    specialty: 'Growth Stage, Series A/B Funding',
    experience: 'VC partner with portfolio of successful exits',
    conversationStyle: 'Metrics-driven, thorough due diligence approach',
    focusAreas: ['Scalability', 'Unit Economics', 'Market Size', 'Competitive Advantage'],
    avatarUrl: '/avatars/rohan-vc.jpg'
  }
];

const PersonaSelection: React.FC<PersonaSelectionProps> = ({
  personas,
  onSelect,
  selectedPersona
}) => {
  // Use provided personas or default ones
  const displayPersonas = personas || investorPersonas;
  const getPersonaIcon = (personaId: string) => {
    const iconMap = {
      'rohan-angel': Target,
      'rohan-vc': TrendingUp
    };
    return iconMap[personaId as keyof typeof iconMap] || Target;
  };

  const getPersonaColorClasses = (personaId: string) => {
    const colorMap = {
      'rohan-angel': 'border-green-500/30 bg-green-500/10 text-green-300',
      'rohan-vc': 'border-blue-500/30 bg-blue-500/10 text-blue-300'
    };
    return colorMap[personaId as keyof typeof colorMap] || 'border-green-500/30 bg-green-500/10 text-green-300';
  };

  return (
    <div className="space-y-4">
      {displayPersonas.map((persona, index) => {
        const Icon = getPersonaIcon(persona.id);
        const isSelected = selectedPersona?.id === persona.id;
        
        return (
          <motion.div
            key={persona.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => onSelect(persona)}
            className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
              isSelected
                ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/20'
                : 'border-slate-600 hover:border-slate-500 hover:bg-slate-800/30'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                {/* Persona Icon */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getPersonaColorClasses(persona.id)}`}>
                  <Icon className="w-6 h-6" />
                </div>
                
                {/* Persona Details */}
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-white">{persona.name}</h3>
                    {isSelected && (
                      <CheckCircle className="w-5 h-5 text-indigo-400" />
                    )}
                  </div>
                  
                  <p className="text-slate-300 font-medium mb-2">{persona.description}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-slate-400 font-medium">Specialty:</span>
                      <span className="text-slate-300 ml-2">{persona.specialty}</span>
                    </div>
                    
                    <div>
                      <span className="text-slate-400 font-medium">Experience:</span>
                      <span className="text-slate-300 ml-2">{persona.experience}</span>
                    </div>
                    
                    <div>
                      <span className="text-slate-400 font-medium">Style:</span>
                      <span className="text-slate-300 ml-2">{persona.conversationStyle}</span>
                    </div>
                  </div>
                  
                  {/* Focus Areas */}
                  <div className="mt-4">
                    <span className="text-slate-400 font-medium text-sm mb-2 block">Focus Areas:</span>
                    <div className="flex flex-wrap gap-2">
                      {persona.focusAreas.map((focus, focusIndex) => (
                        <span
                          key={focusIndex}
                          className={`px-3 py-1 text-xs rounded-full ${
                            isSelected 
                              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {focus}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Selection Indicator */}
            {isSelected && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg"
              >
                <div className="flex items-center space-x-2 text-indigo-300">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Selected - Ready to practice with {persona.name}
                  </span>
                </div>
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default PersonaSelection;