import React, { useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Target, 
  Users, 
  TrendingUp, 
  CheckCircle, 
  ArrowRight, 
  Star,
  Zap,
  Shield,
  Upload,
  MessageSquare,
  BarChart3,
  Clock,
  DollarSign,
  AlertTriangle,
  Brain,
  Rocket,
  Eye,
  Award,
  Lightbulb,
  CheckCircle2,
  TrendingDown,
  Building,
  Briefcase,
  PieChart,
  Sparkles,
  ChevronRight,
  Quote,
  Mail,
  Bell,
  ExternalLink,
  Database,
  X,
  Check,
  Bot,
  Mic,
  Video,
  TrendingUp as Growth,
  Handshake,
  UserCheck,
  Briefcase as Business
} from 'lucide-react';
import Header from '../components/Header';

const LandingPage: React.FC = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -100]);

  const handleJoinWaitlist = () => {
    window.open('https://docs.google.com/forms/d/1tTsmTy3NZqoOw6cgRpzGWdRdNflcvHgQlarPLZ_k2R8/viewform', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-pattern-dots opacity-30" />
      
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent"
          style={{ y: y1 }}
        />
        
        <div className="relative max-w-7xl mx-auto container-padding section-spacing">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Announcement Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8 border border-red-500/20"
            >
              <motion.div
                animate={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <TrendingDown className="w-4 h-4 text-red-400" />
              </motion.div>
              <span className="text-red-300 font-medium text-sm">38% of startups fail due to running out of cash</span>
            </motion.div>

            <motion.h1 
              className="text-display mb-6 text-white text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Perfect Your Pitch
              <br />
              <span className="text-slate-400">Before It's Too Late</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-subtitle mb-8 max-w-3xl mx-auto text-white text-center"
            >
              Get real feedback from AI investors who simulate actual VC conversations.
              <br />
              <span className="font-semibold">Make raising capital easier and faster.</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            >
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleJoinWaitlist}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-lg px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl relative group overflow-hidden"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0"
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
                <div className="relative z-10 flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Join the Waitlist
                  <ExternalLink className="w-4 h-4" />
                </div>
              </motion.button>
            </motion.div>

            {/* Quick Access to VC Database */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 border border-slate-600/30"
            >
              <Database className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-300 text-sm">Looking for investors?</span>
              <a
                href="#"
                className="text-cyan-400 hover:text-cyan-300 font-medium text-sm transition-colors flex items-center gap-1"
              >
                Browse VC Database
                <ChevronRight className="w-3 h-3" />
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="relative section-spacing">
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-transparent"
          style={{ y: y2 }}
        />
        
        <div className="relative max-w-7xl mx-auto container-padding">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div 
              className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-6 border border-red-500/20"
              whileHover={{ scale: 1.05 }}
            >
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-sm font-medium text-red-300">The Hard Truth</span>
            </motion.div>
            
            <h2 className="text-headline mb-6 text-white">
              Why Most Pitches <span className="text-red-400">Fail</span>
            </h2>
            <p className="text-subtitle max-w-3xl mx-auto text-white">
              You practice with friends who ask easy questions. Real investors ask the hard ones.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Users className="w-8 h-8 text-red-400" />,
                title: "Wrong Practice Partners",
                description: "Friends and family give encouragement, not the brutal honesty you need to prepare for real investors.",
                stat: "87% practice with non-investors"
              },
              {
                icon: <MessageSquare className="w-8 h-8 text-orange-400" />,
                title: "Softball Questions",
                description: "Generic questions like 'tell me about your business' don't prepare you for investor-specific concerns.",
                stat: "Only 23% face hard questions"
              },
              {
                icon: <Target className="w-8 h-8 text-pink-400" />,
                title: "No Real Feedback",
                description: "Vague praise doesn't help you improve. You need specific, actionable insights on what investors care about.",
                stat: "91% get generic feedback"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="card hover-lift hover-glow text-center group"
                whileHover={{ y: -4 }}
              >
                <motion.div 
                  className="flex justify-center mb-6"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  {item.icon}
                </motion.div>
                <h3 className="text-title mb-4">{item.title}</h3>
                <p className="text-body mb-4">{item.description}</p>
                <motion.div 
                  className="inline-flex items-center gap-2 glass rounded-full px-3 py-1 border border-red-500/20"
                  whileHover={{ scale: 1.05 }}
                >
                  <span className="text-sm text-red-300 font-medium">{item.stat}</span>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet Rohan Section */}
      <section className="relative section-spacing">
        <div className="max-w-7xl mx-auto container-padding">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div 
              className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-6 border border-indigo-500/30"
              whileHover={{ scale: 1.05 }}
            >
              <Bot className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-medium text-indigo-300">Meet Your AI Investor</span>
            </motion.div>
            
            <h2 className="text-headline mb-6 text-white">
              Meet <span className="text-gradient-accent">Rohan</span>
            </h2>
            <p className="text-subtitle max-w-3xl mx-auto text-white">
              Your AI investor who thinks like a top-tier VC. Trained on thousands of real investor conversations 
              to give you the practice and feedback you need to succeed.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Rohan's Profile */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="card-elevated glow-accent text-center"
            >
              <motion.div 
                className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 relative overflow-hidden"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <Bot className="w-12 h-12 text-white relative z-10" />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-purple-600 to-indigo-500 opacity-0"
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
              
              <h3 className="text-2xl font-bold text-white mb-2">Rohan</h3>
              <p className="text-indigo-400 font-medium mb-4">Your AI Investor</p>
              
              <div className="text-left space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <Business className="w-5 h-5 text-indigo-400" />
                  <span className="text-white">Partner at top-tier VC firm</span>
                </div>
                <div className="flex items-center gap-3">
                  <Growth className="w-5 h-5 text-purple-400" />
                  <span className="text-white">$500M+ in investments</span>
                </div>
                <div className="flex items-center gap-3">
                  <UserCheck className="w-5 h-5 text-cyan-400" />
                  <span className="text-white">100+ successful exits</span>
                </div>
                <div className="flex items-center gap-3">
                  <Brain className="w-5 h-5 text-green-400" />
                  <span className="text-white">AI-powered insights</span>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-lg p-4">
                <p className="text-white text-sm italic">
                  "I've seen thousands of pitches. Let me help you perfect yours before you face real investors."
                </p>
              </div>
            </motion.div>

            {/* What Rohan Does */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">
                  What Makes Rohan Different?
                </h3>
                
                <div className="space-y-6">
                  {[
                    {
                      icon: <Brain className="w-6 h-6 text-indigo-400" />,
                      title: "Thinks Like Real VCs",
                      description: "Trained on actual investor conversations from Sequoia, a16z, and other top firms"
                    },
                    {
                      icon: <Target className="w-6 h-6 text-purple-400" />,
                      title: "Asks Tough Questions",
                      description: "Challenges you on market size, unit economics, competitive moats, and scalability"
                    },
                    {
                      icon: <BarChart3 className="w-6 h-6 text-cyan-400" />,
                      title: "Gives Real Feedback",
                      description: "Detailed analysis of your pitch with specific recommendations for improvement"
                    },
                    {
                      icon: <Shield className="w-6 h-6 text-green-400" />,
                      title: "Never Judges You",
                      description: "Practice unlimited times in a safe environment without fear of rejection"
                    }
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-start gap-4 p-4 glass rounded-lg border border-slate-700/30 hover:border-indigo-500/30 transition-colors"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-slate-800 to-slate-700 rounded-lg flex items-center justify-center border border-slate-600/30 flex-shrink-0">
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-2">{item.title}</h4>
                        <p className="text-white">{item.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <motion.button
                  onClick={handleJoinWaitlist}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="flex items-center gap-2">
                    <Handshake className="w-5 h-5" />
                    Meet Rohan
                    <ExternalLink className="w-4 h-4" />
                  </div>
                </motion.button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Without Rohan vs With Rohan Comparison */}
      <section className="relative section-spacing">
        <div className="max-w-7xl mx-auto container-padding">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-headline mb-6 text-white">
              Practice smart, not hard.
            </h2>
            <p className="text-subtitle max-w-3xl mx-auto text-white">
              Traditional pitch practice vs. AI-powered training. See the difference Rohan makes in your fundraising journey.
            </p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              viewport={{ once: true }}
              className="mt-8"
            >
              <motion.button
                onClick={handleJoinWaitlist}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Meet Rohan
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Without Rohan */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-red-900/20 to-red-800/20 border border-red-500/30 rounded-2xl p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <X className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">Without Rohan</h3>
              </div>

              <div className="space-y-4">
                {[
                  {
                    icon: <Users className="w-5 h-5" />,
                    text: "Practice with friends who ask easy questions"
                  },
                  {
                    icon: <MessageSquare className="w-5 h-5" />,
                    text: "Get generic feedback like 'sounds great!'"
                  },
                  {
                    icon: <Clock className="w-5 h-5" />,
                    text: "Spend months preparing for investor meetings"
                  },
                  {
                    icon: <TrendingDown className="w-5 h-5" />,
                    text: "Face rejection without knowing why"
                  },
                  {
                    icon: <AlertTriangle className="w-5 h-5" />,
                    text: "Miss critical investor concerns"
                  },
                  {
                    icon: <Target className="w-5 h-5" />,
                    text: "Struggle to articulate value proposition clearly"
                  }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3 text-red-300"
                  >
                    <div className="text-red-400 flex-shrink-0">{item.icon}</div>
                    <span>{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* With Rohan */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-green-900/20 to-emerald-800/20 border border-green-500/30 rounded-2xl p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">With Rohan</h3>
              </div>

              <div className="space-y-4">
                {[
                  {
                    icon: <Brain className="w-5 h-5" />,
                    text: "Practice with AI that thinks like top VCs"
                  },
                  {
                    icon: <BarChart3 className="w-5 h-5" />,
                    text: "Get detailed analysis and actionable insights"
                  },
                  {
                    icon: <Zap className="w-5 h-5" />,
                    text: "Perfect your pitch in days, not months"
                  },
                  {
                    icon: <Growth className="w-5 h-5" />,
                    text: "Raise capital 3x faster with confidence"
                  },
                  {
                    icon: <Shield className="w-5 h-5" />,
                    text: "Address investor concerns before they arise"
                  },
                  {
                    icon: <Rocket className="w-5 h-5" />,
                    text: "Deliver compelling pitches that convert"
                  }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3 text-green-300"
                  >
                    <div className="text-green-400 flex-shrink-0">{item.icon}</div>
                    <span>{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <motion.button
              onClick={handleJoinWaitlist}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-lg px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl relative group overflow-hidden"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0"
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
              <div className="relative z-10 flex items-center gap-2">
                Get started for free
                <ExternalLink className="w-4 h-4" />
              </div>
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative section-spacing">
        <div className="max-w-7xl mx-auto container-padding">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-headline mb-6 text-white">
              How Your <span className="text-gradient-accent">AI Investor</span> Works
            </h2>
            <p className="text-subtitle max-w-3xl mx-auto text-white">
              From pitch deck to funding-ready in three simple steps.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: <Upload className="w-6 h-6 text-indigo-400" />,
                title: "Upload Your Pitch Deck",
                description: "Your AI investor analyzes your deck to understand your business model, market opportunity, and competitive landscape.",
                time: "30 seconds"
              },
              {
                step: "02",
                icon: <Mic className="w-6 h-6 text-purple-400" />,
                title: "Practice Your Pitch",
                description: "Present to your AI investor who asks tough questions based on real VC conversation patterns and your specific business.",
                time: "10-15 minutes"
              },
              {
                step: "03",
                icon: <BarChart3 className="w-6 h-6 text-cyan-400" />,
                title: "Get Real Feedback",
                description: "Receive detailed analysis of your performance with specific recommendations to improve your pitch and raise capital faster.",
                time: "Instant results"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative group text-center"
              >
                <motion.div 
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-1 rounded-full font-semibold text-sm"
                  whileHover={{ scale: 1.1 }}
                >
                  {item.step}
                </motion.div>
                
                <div className="mt-8 mb-6 flex justify-center">
                  <motion.div 
                    className="w-12 h-12 bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl flex items-center justify-center border border-slate-600/30"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    {item.icon}
                  </motion.div>
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-4">
                  {item.title}
                </h3>
                <p className="text-white mb-6">
                  {item.description}
                </p>
                
                <div className="text-center">
                  <motion.span 
                    className="bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600/30 rounded-full px-3 py-1 text-sm text-white font-medium"
                    whileHover={{ scale: 1.05 }}
                  >
                    {item.time}
                  </motion.span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative section-spacing">
        <div className="max-w-7xl mx-auto container-padding">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-headline mb-6 text-white">
              How can Rohan help you raise your round?
            </h2>
            <p className="text-subtitle max-w-3xl mx-auto text-white">
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Brain className="w-6 h-6 text-indigo-400" />,
                title: "Thinks Like Real VCs",
                description: "Trained on actual investor conversations from top-tier firms"
              },
              {
                icon: <Target className="w-6 h-6 text-purple-400" />,
                title: "Asks Tough Questions",
                description: "Challenges you on market size, competition, and business model"
              },
              {
                icon: <Shield className="w-6 h-6 text-green-400" />,
                title: "Never Judges You",
                description: "Practice unlimited times without fear of rejection"
              },
              {
                icon: <BarChart3 className="w-6 h-6 text-cyan-400" />,
                title: "Detailed Performance Analysis",
                description: "Get specific feedback on every aspect of your pitch"
              },
              {
                icon: <Lightbulb className="w-6 h-6 text-yellow-400" />,
                title: "Actionable Insights",
                description: "Learn exactly what to improve before your next investor meeting"
              },
              {
                icon: <Growth className="w-6 h-6 text-pink-400" />,
                title: "Faster Capital Raising",
                description: "Founders using AI training raise capital 3x faster"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group text-center"
                whileHover={{ y: -2 }}
              >
                <div className="flex flex-col items-center mb-4">
                  <motion.div 
                    className="w-12 h-12 bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl flex items-center justify-center border border-slate-600/30 mb-4"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    {feature.icon}
                  </motion.div>
                  <h3 className="text-lg font-semibold text-white">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-white">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative section-spacing">
        <div className="max-w-4xl mx-auto container-padding text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="p-8 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl"
          >
            <motion.div 
              className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8 border border-red-500/20"
              whileHover={{ scale: 1.05 }}
            >
              <Rocket className="w-4 h-4 text-red-400" />
              <span className="text-sm font-medium text-red-300">Ready to Start?</span>
            </motion.div>

            <h2 className="text-headline mb-8 text-white">
              Don't Let Your Startup Become
              <br />
              <span className="text-red-400">Part of the 38%</span>
            </h2>
            
            <p className="text-subtitle mb-12 max-w-2xl mx-auto text-white">
              Join the waitlist of founders who are preparing to perfect their pitch 
              and raise capital faster. Your next investor meeting could change everything.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleJoinWaitlist}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-lg px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl relative group overflow-hidden"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0"
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
                <div className="relative z-10 flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Join the Waitlist
                  <ExternalLink className="w-4 h-4" />
                </div>
              </motion.button>
              
              <div className="text-white text-sm">
                <p>No credit card required</p>
                <p>Early access guaranteed</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-slate-700/30 py-12 container-padding">
        <div className="max-w-7xl mx-auto text-center">
          <div className="grid md:grid-cols-3 gap-8 justify-items-center">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center justify-center gap-2">
                <Bot className="w-5 h-5 text-indigo-400" />
                AgentVC
              </h3>
              <p className="text-white">
                AI-powered pitch training for founders who want to raise capital faster.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-white">
                <li><a href="#features" className="hover:text-indigo-400 transition-colors">Features</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-white">
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700/30 mt-8 pt-8 text-center text-white">
            <p>&copy; 2025 AgentVC. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;