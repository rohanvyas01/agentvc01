import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Edit3, Globe, TrendingUp, AlertCircle } from 'lucide-react';
import { CompanyDetailsProps } from '../../types/dashboard';

const CompanyDetailsSection: React.FC<CompanyDetailsProps> = ({ 
  company, 
  profile, 
  onEdit 
}) => {
  // Calculate completion percentage based on available data
  const calculateCompletionPercentage = () => {
    const fields = [
      company?.name,
      company?.industry,
      company?.stage,
      profile?.one_liner,
      profile?.website,
      profile?.full_name,
      profile?.linkedin_url
    ];
    
    const completedFields = fields.filter(field => field && field.trim() !== '').length;
    return Math.round((completedFields / fields.length) * 100);
  };

  const completionPercentage = calculateCompletionPercentage();
  const isIncomplete = completionPercentage < 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass rounded-2xl p-6 border border-slate-700/30"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-3">
          <Building2 className="w-5 h-5 text-indigo-400" />
          Company Details
        </h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onEdit}
          className="btn-secondary text-sm flex items-center gap-2"
        >
          <Edit3 className="w-4 h-4" />
          Edit
        </motion.button>
      </div>

      {isIncomplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
            <div>
              <p className="text-yellow-300 font-medium">Profile {completionPercentage}% Complete</p>
              <p className="text-yellow-200/80 text-sm">Complete your profile for better AI analysis</p>
            </div>
          </div>
          <div className="mt-3">
            <div className="w-full bg-slate-800 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        </motion.div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Company Name</label>
            <p className="text-white font-medium">
              {company?.name || <span className="text-slate-500 italic">Not provided</span>}
            </p>
          </div>
          
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Industry</label>
            <p className="text-white font-medium">
              {company?.industry || <span className="text-slate-500 italic">Not provided</span>}
            </p>
          </div>
          
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Stage</label>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <p className="text-white font-medium">
                {company?.stage || <span className="text-slate-500 italic">Not provided</span>}
              </p>
            </div>
          </div>
          
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Website</label>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              {profile?.website ? (
                <a 
                  href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium truncate"
                  title={profile.website}
                >
                  {profile.website.length > 30 ? `${profile.website.substring(0, 30)}...` : profile.website}
                </a>
              ) : (
                <span className="text-slate-500 italic">Not provided</span>
              )}
            </div>
          </div>
        </div>

        {profile?.one_liner && (
          <div>
            <label className="text-sm text-slate-400 mb-2 block">One-Liner</label>
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
              <p className="text-white leading-relaxed">
                "{profile.one_liner}"
              </p>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-slate-700/50">
          <label className="text-sm text-slate-400 mb-1 block">Founder</label>
          <p className="text-white font-medium">
            {profile?.full_name || <span className="text-slate-500 italic">Not provided</span>}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default CompanyDetailsSection;