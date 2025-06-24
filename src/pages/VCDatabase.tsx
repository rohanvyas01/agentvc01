import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Filter, ExternalLink, MapPin, DollarSign, Building, Users, Globe, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VCDatabase: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  const vcData = [
    {
      name: "100xVc",
      foundingYear: "2019",
      location: "Mumbai",
      aum: "Undisclosed",
      chequeSize: "$150K",
      stages: "Pre-Seed/Seed",
      sectors: "Sector Agnostic, B2B Commerce/SaaS, Consumer Products, Technology, MedTech/Biotech/Life Sciences",
      keyContacts: "Ninad Karpe",
      contactInfo: "",
      website: "100X.VC",
      philosophy: "100X.VC aims to fund exceptional Indian founders, believing in their capacity to achieve ambitious goals. The firm not only provides seed capital but also offers extensive mentoring, dedicating over 100 hours to assist startups in refining their products and go-to-market strategies."
    },
    {
      name: "2am VC",
      foundingYear: "2021",
      location: "Mumbai/Bangalore/LA",
      aum: "$20 M",
      chequeSize: "$ 100K - $ 500K",
      stages: "Pre-Seed/Seed, Series A",
      sectors: "B2B Commerce/SaaS, Supply Chain/Logistics",
      keyContacts: "Jatira Narkar",
      contactInfo: "jaitra@2amvc.com",
      website: "2am VC",
      philosophy: ""
    },
    {
      name: "360 One Asset Management",
      foundingYear: "2008",
      location: "Mumbai",
      aum: "$68 B",
      chequeSize: "$ 1M - $ 50M",
      stages: "Pre-Seed/Seed, Series A, Series B, Series C +",
      sectors: "Sector Agnostic, B2B Commerce/SaaS, HealthTech, Consumer Products",
      keyContacts: "Sandeep Maheshwari",
      contactInfo: "winssandeep@gmail.com",
      website: "360 ONE",
      philosophy: "360 ONE Asset Management focuses on delivering long-term performance through a holistic approach to wealth and asset management."
    },
    {
      name: "3one4 Capital",
      foundingYear: "2016",
      location: "Bengaluru",
      aum: "$750 M",
      chequeSize: "$ 200K - $ 5M",
      stages: "Pre-Seed/Seed, Series A, Series B",
      sectors: "Sector Agnostic, B2B Commerce/SaaS, ConsumerTech, HealthTech, Media",
      keyContacts: "Siddarth Pai",
      contactInfo: "",
      website: "3one4 Capital",
      philosophy: "3one4 Capital is committed to supporting generational innovation engines emerging from India, focusing on inclusive value creation and sustainable growth."
    },
    {
      name: "8i Ventures",
      foundingYear: "2018",
      location: "Mumbai",
      aum: "$50M",
      chequeSize: "$ 250K - $ 2M",
      stages: "Pre-Seed/Seed, Series A",
      sectors: "Sector Agnostic, B2B Commerce/SaaS, FinTech, ConsumerTech",
      keyContacts: "Vishwanath V",
      contactInfo: "vishy@8ivc.com",
      website: "8i Ventures",
      philosophy: "8i Ventures backs founders creating fintech and consumer category leaders in India."
    },
    {
      name: "Accel Partners",
      foundingYear: "1983",
      location: "Bengaluru",
      aum: "Undisclosed",
      chequeSize: "$1M- $50M",
      stages: "Pre-Seed/Seed, Series A, Series B, Series C +",
      sectors: "Sector Agnostic, B2B Commerce/SaaS, ConsumerTech, FinTech, AI/ML, HealthTech, Technology, Gaming",
      keyContacts: "",
      contactInfo: "",
      website: "",
      philosophy: "Accel operates on the principle of partnering with exceptional teams from inception through all phases of private company growth."
    },
    {
      name: "Blume Ventures",
      foundingYear: "2010",
      location: "Mumbai",
      aum: "$40 m",
      chequeSize: "$ 200k - $ 2.5M",
      stages: "Pre-Seed/Seed, Series A",
      sectors: "Sector Agnostic, B2B Commerce/SaaS, ConsumerTech, DeepTech, FinTech, Clean energy/Sustainability, EdTech",
      keyContacts: "Sarita Raichura",
      contactInfo: "sarita@blume.vc",
      website: "Blume Ventures",
      philosophy: "Blume Ventures aims to reimagine startup financing in India by supporting founders from the startup phase through scaling."
    },
    {
      name: "Sequoia Capital India",
      foundingYear: "2006",
      location: "Bengaluru/Mumbai/Delhi/Singapore/Dubai",
      aum: "$9 B",
      chequeSize: "$1M - $100M",
      stages: "Pre-Seed/Seed, Series A, Series B, Series C +",
      sectors: "Sector Agnostic, B2B Commerce/SaaS, ConsumerTech, FinTech, Clean energy/Sustainability, HealthTech, Consumer Products, Technology",
      keyContacts: "Aditya Sood",
      contactInfo: "aaditya@peakxv.com",
      website: "https://www.peakxv.com/",
      philosophy: "Peak XV Partners is dedicated to supporting visionary founders in building enduring businesses that stand tall and inspire greatness."
    }
  ];

  // Extract unique values for filters
  const allStages = useMemo(() => {
    const stages = new Set<string>();
    vcData.forEach(vc => {
      vc.stages.split(', ').forEach(stage => stages.add(stage.trim()));
    });
    return Array.from(stages).sort();
  }, []);

  const allSectors = useMemo(() => {
    const sectors = new Set<string>();
    vcData.forEach(vc => {
      vc.sectors.split(', ').forEach(sector => sectors.add(sector.trim()));
    });
    return Array.from(sectors).sort();
  }, []);

  const allLocations = useMemo(() => {
    const locations = new Set<string>();
    vcData.forEach(vc => {
      vc.location.split('/').forEach(loc => locations.add(loc.trim()));
    });
    return Array.from(locations).sort();
  }, []);

  // Filter VCs based on search and filters
  const filteredVCs = useMemo(() => {
    return vcData.filter(vc => {
      const matchesSearch = searchTerm === '' || 
        vc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vc.sectors.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vc.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStage = selectedStage === '' || vc.stages.includes(selectedStage);
      const matchesSector = selectedSector === '' || vc.sectors.includes(selectedSector);
      const matchesLocation = selectedLocation === '' || vc.location.includes(selectedLocation);
      
      return matchesSearch && matchesStage && matchesSector && matchesLocation;
    });
  }, [searchTerm, selectedStage, selectedSector, selectedLocation]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStage('');
    setSelectedSector('');
    setSelectedLocation('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <motion.header 
        className="header-glass border-b border-slate-700/30"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto container-padding">
          <div className="flex items-center h-16">
            <motion.button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
              whileHover={{ x: -4 }}
              transition={{ duration: 0.2 }}
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </motion.button>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto container-padding py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div 
            className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-6 border border-slate-600/30"
            whileHover={{ scale: 1.05 }}
          >
            <Building className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-medium text-slate-300">VC Database</span>
          </motion.div>
          
          <h1 className="text-headline mb-6 text-gradient">
            Indian VC <span className="text-gradient-accent">Directory</span>
          </h1>
          <p className="text-subtitle max-w-3xl mx-auto">
            Comprehensive database of Indian venture capital firms with contact information, 
            investment focus, and funding details.
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card mb-8"
        >
          <div className="grid md:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search VCs, sectors, locations..."
                className="input-field pl-10"
              />
            </div>

            {/* Stage Filter */}
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="input-field"
            >
              <option value="">All Stages</option>
              {allStages.map(stage => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </select>

            {/* Sector Filter */}
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="input-field"
            >
              <option value="">All Sectors</option>
              {allSectors.map(sector => (
                <option key={sector} value={sector}>{sector}</option>
              ))}
            </select>

            {/* Location Filter */}
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="input-field"
            >
              <option value="">All Locations</option>
              {allLocations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-slate-400">
              Showing {filteredVCs.length} of {vcData.length} VCs
            </p>
            {(searchTerm || selectedStage || selectedSector || selectedLocation) && (
              <motion.button
                onClick={clearFilters}
                className="btn-secondary text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Clear Filters
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* VC Cards Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {filteredVCs.map((vc, index) => (
            <motion.div
              key={vc.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card hover-lift hover-glow"
              whileHover={{ y: -2 }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{vc.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{vc.location}</span>
                    </div>
                    <span>•</span>
                    <span>Founded {vc.foundingYear}</span>
                  </div>
                </div>
                {vc.website && (
                  <motion.a
                    href={`https://${vc.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800/50"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ExternalLink className="w-5 h-5" />
                  </motion.a>
                )}
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="glass rounded-lg p-3 border border-slate-700/30">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-slate-400">AUM</span>
                  </div>
                  <span className="text-white font-semibold">{vc.aum}</span>
                </div>
                <div className="glass rounded-lg p-3 border border-slate-700/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Building className="w-4 h-4 text-blue-400" />
                    <span className="text-xs text-slate-400">Cheque Size</span>
                  </div>
                  <span className="text-white font-semibold">{vc.chequeSize}</span>
                </div>
              </div>

              {/* Investment Focus */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-slate-300 mb-2">Investment Stages</h4>
                <div className="flex flex-wrap gap-2">
                  {vc.stages.split(', ').map((stage, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded text-xs border border-indigo-500/30"
                    >
                      {stage.trim()}
                    </span>
                  ))}
                </div>
              </div>

              {/* Sectors */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-slate-300 mb-2">Sectors</h4>
                <div className="flex flex-wrap gap-2">
                  {vc.sectors.split(', ').slice(0, 4).map((sector, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs border border-purple-500/30"
                    >
                      {sector.trim()}
                    </span>
                  ))}
                  {vc.sectors.split(', ').length > 4 && (
                    <span className="px-2 py-1 bg-slate-500/20 text-slate-300 rounded text-xs border border-slate-500/30">
                      +{vc.sectors.split(', ').length - 4} more
                    </span>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              {(vc.keyContacts || vc.contactInfo) && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-slate-300 mb-2">Key Contacts</h4>
                  <div className="space-y-1">
                    {vc.keyContacts && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-300 text-sm">{vc.keyContacts}</span>
                      </div>
                    )}
                    {vc.contactInfo && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <a
                          href={`mailto:${vc.contactInfo}`}
                          className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
                        >
                          {vc.contactInfo}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Philosophy */}
              {vc.philosophy && (
                <div className="border-t border-slate-700/30 pt-4">
                  <h4 className="text-sm font-semibold text-slate-300 mb-2">Investment Philosophy</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {vc.philosophy.length > 150 
                      ? `${vc.philosophy.substring(0, 150)}...` 
                      : vc.philosophy
                    }
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* No Results */}
        {filteredVCs.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Search className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-300 mb-2">
              No VCs Found
            </h3>
            <p className="text-slate-500 mb-6">
              Try adjusting your search criteria or clearing the filters
            </p>
            <motion.button
              onClick={clearFilters}
              className="btn-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Clear All Filters
            </motion.button>
          </motion.div>
        )}

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-16 card"
        >
          <h3 className="text-xl font-bold text-white mb-4">
            Complete VC Database
          </h3>
          <p className="text-slate-400 mb-6">
            This database contains comprehensive information about Indian venture capital firms, 
            including contact details, investment focus, and funding criteria. Perfect for founders 
            looking to connect with the right investors.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-slate-500">
            <span>Last Updated: January 2025</span>
            <span>•</span>
            <span>{vcData.length} VCs Listed</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VCDatabase;