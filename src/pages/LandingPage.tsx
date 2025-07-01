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
  TrendingUp as Growth
} from 'lucide-react';
import Header from '../components/Header';
import VideoPlayer from '../components/VideoPlayer';

const LandingPage: React.FC = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -100]);
  const y3 = useTransform(scrollY, [0, 500], [0, -150]);

  const handleJoinWaitlist = () => {
    window.open('https://docs.google.com/forms/d/1tTsmTy3NZqoOw6cgRpzGWdRdNflcvHgQlarPLZ_k2R8/viewform', '_blank');
  };

  const handleVideoEnd = () => {
    console.log('Rohan intro video ended');
  };

  const handleVideoStart = () => {
    console.log('Rohan intro video started');
  };

  // Reusable glass button component
  const GlassButton = ({ children, onClick, className = "", ...props }: any) => (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl relative group overflow-hidden ${className}`}
      {...props}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
      <div className="relative z-10 flex items-center gap-2">
        {children}
      </div>
    </motion.button>
  );

  // Reusable glass text box component
  const GlassTextBox = ({ children, className = "", delay = 0, ...props }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay }}
      viewport={{ once: true }}
      whileHover={{ y: -2, scale: 1.01 }}
      className={`glass rounded-2xl p-4 sm:p-6 lg:p-8 transition-all duration-300 hover:shadow-xl ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Clean Minimal Background */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Simple gradient base */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        
        {/* Subtle radial gradients */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
          <div className="absolute top-3/4 left-3/4 w-64 h-64 bg-cyan-500/5 rounded-full blur-2xl" />
        </div>
        
        {/* Minimal grid overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
        
        {/* Single floating element */}
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-indigo-500/3 via-purple-500/3 to-cyan-500/3 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
      
      <Header />
      
      {/* Hero Section with Video Intro */}
      <section className="relative overflow-hidden min-h-screen flex items-center justify-center">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            className="text-center max-w-5xl mx-auto"
          >
            {/* Video Introduction */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="mb-8 sm:mb-12"
            >
              <div className="relative max-w-4xl mx-auto">
                {/* Video Title */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  className="mb-6 sm:mb-8"
                >
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500/20 to-purple-600/20 border border-indigo-500/30 rounded-full px-4 py-2 mb-4">
                    <Video className="w-4 h-4 text-indigo-400" />
                    <span className="text-sm font-medium text-white">Meet Your AI Investor</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4">
                    Meet <span className="text-gradient-accent">Rohan Vyas</span>
                  </h1>
                  <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto">
                    The world's first AI investor who gives you real feedback and helps you raise capital faster
                  </p>
                </div>

                {/* Video Player */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="relative"
                >
                  <div className="glass rounded-2xl p-2 sm:p-4 border border-slate-700/30">
                    <VideoPlayer
                      videoUrl="https://videos.pexels.com/video-files/3196284/3196284-uhd_2560_1440_25fps.mp4"
                      autoPlay={true}
                      showControls={true}
                      onVideoEnd={handleVideoEnd}
                      onVideoStart={handleVideoStart}
                      className="w-full h-64 sm:h-80 lg:h-96 rounded-xl"
                    />
                  </div>
                  
                  {/* Video overlay with Rohan's info */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className="absolute -bottom-4 sm:-bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-md"
                  >
                    <div className="glass rounded-xl p-4 border border-slate-700/30 bg-slate-900/80 backdrop-blur-xl">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src="/5874fe52-4169-461c-aff3-3c84ab6638fc.png"
                            alt="Rohan Vyas"
                            className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500/30"
                          />
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-white">Rohan Vyas</h3>
                          <p className="text-sm text-indigo-400">Your AI Investor • Available 24/7</p>
                        </div>
                        <div className="flex gap-1">
                          <span className="bg-green-500/20 border border-green-500/30 rounded-full px-2 py-1 text-xs text-green-300">
                            Live
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 sm:mb-16"
            >
              <GlassButton onClick={handleJoinWaitlist} className="w-full sm:w-auto text-xl px-10 py-5">
                <Rocket className="w-5 h-5 sm:w-6 sm:h-6" />
                Start Training with Rohan
                <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
              </GlassButton>
            </motion.div>

            {/* Statistics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.8 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12"
            >
              <div className="text-center">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-indigo-400 mb-3">5000+</div>
                <div className="text-white text-base sm:text-lg">Pitch Decks Analyzed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-purple-400 mb-3">3x</div>
                <div className="text-white text-base sm:text-lg">Faster Capital Raising</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-cyan-400 mb-3">24/7</div>
                <div className="text-white text-base sm:text-lg">AI Investor Available</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="relative py-16 sm:py-24">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold tracking-tight mb-4 sm:mb-6 text-white leading-tight">
              Why Founders <span className="text-red-400">Struggle</span> to Raise Capital
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl max-w-3xl mx-auto text-white leading-relaxed px-4">
              Most founders practice with the wrong people and get the wrong feedback. 
              Rohan asks tough questions you've never heard before.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: <Users className="w-6 h-6 sm:w-8 sm:h-8 text-red-400" />,
                title: "Practice with Friends",
                description: "Your friends and family give you encouragement, not the brutal honesty real investors will deliver.",
              },
              {
                icon: <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-orange-400" />,
                title: "Softball Questions",
                description: "Generic questions like 'tell me about your business' don't prepare you for investor due diligence.",
              },
              {
                icon: <Target className="w-6 h-6 sm:w-8 sm:h-8 text-pink-400" />,
                title: "Vague Feedback",
                description: "Hearing 'sounds good' doesn't help you improve. You need specific insights on what investors actually care about.",
              }
            ].map((item, index) => (
              <GlassTextBox
                key={index}
                delay={index * 0.2}
                className="text-center group"
              >
                <motion.div 
                  className="flex justify-center mb-4 sm:mb-6"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  {item.icon}
                </motion.div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">{item.title}</h3>
                <p className="text-white text-sm sm:text-base leading-relaxed">{item.description}</p>
              </GlassTextBox>
            ))}
          </div>
        </div>
      </section>

      {/* Meet Rohan Section */}
      <section className="relative py-16 sm:py-24">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <motion.div 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500/20 to-purple-600/20 border border-indigo-500/30 rounded-full px-3 sm:px-4 py-2 mb-4 sm:mb-6"
              whileHover={{ scale: 1.05 }}
            >
              <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-400" />
              <span className="text-xs sm:text-sm font-medium text-white">Meet Your AI Investor</span>
            </motion.div>
            
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold tracking-tight mb-4 sm:mb-6 text-white leading-tight">
              Meet <span className="text-gradient-accent">Rohan Vyas</span>
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl max-w-3xl mx-auto text-white leading-relaxed px-4">
              The world's first AI investor with a legendary track record. 
              Rohan has seen it all, invested in everything, and knows exactly what makes VCs say yes.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            {/* Rohan's Photo and Basic Info */}
            <GlassTextBox className="text-center lg:text-left">
              <div className="relative inline-block mb-6 sm:mb-8">
                <motion.div
                  className="relative"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <img
                    src="/5874fe52-4169-461c-aff3-3c84ab6638fc.png"
                    alt="Rohan Vyas - Your AI Investor"
                    className="w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 object-cover object-center rounded-2xl border-4 border-gradient-to-br from-indigo-500/30 to-purple-600/30 shadow-2xl mx-auto lg:mx-0"
                    style={{
                      objectPosition: 'center top',
                      filter: 'brightness(1.1) contrast(1.1)'
                    }}
                  />
                  <div className="absolute -top-2 -right-2 w-4 h-4 sm:w-6 sm:h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white animate-pulse"></div>
                </motion.div>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-2xl sm:text-3xl font-bold text-white">Rohan Vyas</h3>
                <p className="text-lg sm:text-xl text-indigo-400 font-medium">Your AI Investor</p>
                <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                  <span className="bg-gradient-to-r from-indigo-500/20 to-purple-600/20 border border-indigo-500/30 rounded-full px-2 sm:px-3 py-1 text-xs sm:text-sm text-white">
                    Available 24/7
                  </span>
                  <span className="bg-gradient-to-r from-green-500/20 to-emerald-600/20 border border-green-500/30 rounded-full px-2 sm:px-3 py-1 text-xs sm:text-sm text-white">
                    Never Judges
                  </span>
                  <span className="bg-gradient-to-r from-purple-500/20 to-pink-600/20 border border-purple-500/30 rounded-full px-2 sm:px-3 py-1 text-xs sm:text-sm text-white">
                    Unlimited Practice
                  </span>
                </div>
              </div>
            </GlassTextBox>

            {/* Rohan's Background */}
            <GlassTextBox>
              <h4 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                <Award className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                Complete Background
              </h4>
              <div className="space-y-2 sm:space-y-3 text-white text-sm sm:text-base">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p><span className="font-semibold">NYU Electronics Bachelor's</span> - Graduated summa cum laude with honors in electrical engineering</p>
                </div>
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p><span className="font-semibold">Harvard MS in Electrical Engineering</span> - Specialized in AI and machine learning systems</p>
                </div>
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p><span className="font-semibold">Stanford MBA</span> - Focus on venture capital and entrepreneurship</p>
                </div>
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p><span className="font-semibold">4-time founder</span> - Built and scaled companies across fintech, AI, and enterprise software</p>
                </div>
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p><span className="font-semibold">Exited 4 times</span> - Successful acquisitions by Google, Microsoft, Amazon, and Salesforce</p>
                </div>
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-pink-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p><span className="font-semibold">Now an investor</span> - Partner at top-tier VC firms with $2B+ in deployed capital</p>
                </div>
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p><span className="font-semibold">Evaluated 5000+ decks</span> - Knows every pattern, red flag, and success indicator</p>
                </div>
              </div>
            </GlassTextBox>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mt-12 sm:mt-16"
          >
            <GlassButton onClick={handleJoinWaitlist} className="w-full sm:w-auto">
              <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
              Meet Rohan Vyas
              <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
            </GlassButton>
          </motion.div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="relative py-16 sm:py-24">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold tracking-tight mb-4 sm:mb-6 text-white leading-tight">
              Practice smart, not hard.
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl max-w-3xl mx-auto text-white leading-relaxed px-4">
              Traditional pitch practice vs. AI-powered training. See the difference Rohan makes in your fundraising journey.
            </p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              viewport={{ once: true }}
              className="mt-6 sm:mt-8"
            >
              <GlassButton onClick={handleJoinWaitlist} className="w-full sm:w-auto">
                Meet Rohan Vyas
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </GlassButton>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Without Rohan */}
            <GlassTextBox className="bg-gradient-to-br from-red-900/20 to-red-800/20 border border-red-500/30">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <X className="w-3 h-3 sm:w-5 sm:h-5 text-red-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">Without Rohan</h3>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {[
                  {
                    emoji: "👥",
                    text: "Practice with friends who ask easy questions"
                  },
                  {
                    emoji: "💬",
                    text: "Get generic feedback like 'sounds great!'"
                  },
                  {
                    emoji: "⏰",
                    text: "Spend months preparing for investor meetings"
                  },
                  {
                    emoji: "📉",
                    text: "Face rejection without knowing why"
                  },
                  {
                    emoji: "⚠️",
                    text: "Miss critical investor concerns"
                  },
                  {
                    emoji: "🎯",
                    text: "Struggle to articulate value proposition clearly"
                  }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-2 sm:gap-3 text-red-300 text-sm sm:text-base"
                  >
                    <span className="text-lg flex-shrink-0">{item.emoji}</span>
                    <span>{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </GlassTextBox>

            {/* With Rohan */}
            <GlassTextBox className="bg-gradient-to-br from-green-900/20 to-emerald-800/20 border border-green-500/30">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Check className="w-3 h-3 sm:w-5 sm:h-5 text-green-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">With Rohan Vyas</h3>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {[
                  {
                    emoji: "🧠",
                    text: "Practice with AI that thinks like top VCs"
                  },
                  {
                    emoji: "📊",
                    text: "Get detailed analysis and actionable insights"
                  },
                  {
                    emoji: "⚡",
                    text: "Perfect your pitch in days, not months"
                  },
                  {
                    emoji: "📈",
                    text: "Raise capital 3x faster with confidence"
                  },
                  {
                    emoji: "🛡️",
                    text: "Address investor concerns before they arise"
                  },
                  {
                    emoji: "🚀",
                    text: "Deliver compelling pitches that convert"
                  }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-2 sm:gap-3 text-green-300 text-sm sm:text-base"
                  >
                    <span className="text-lg flex-shrink-0">{item.emoji}</span>
                    <span>{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </GlassTextBox>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mt-8 sm:mt-12"
          >
            <GlassButton onClick={handleJoinWaitlist} className="w-full sm:w-auto">
              Get started for free
              <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
            </GlassButton>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-16 sm:py-24">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold tracking-tight mb-4 sm:mb-6 text-white leading-tight">
              How Your <span className="text-gradient-accent">AI Investor</span> Works
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl max-w-3xl mx-auto text-white leading-relaxed px-4">
              From pitch deck to funding-ready in three simple steps.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                step: "01",
                icon: <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />,
                title: "Upload Your Pitch Deck",
                description: "Your AI investor analyzes your deck to understand your business model, market opportunity, and competitive landscape.",
                time: "30 seconds"
              },
              {
                step: "02",
                icon: <Mic className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />,
                title: "Practice Your Pitch",
                description: "Present to your AI investor who asks tough questions based on real VC conversation patterns and your specific business.",
                time: "10-15 minutes"
              },
              {
                step: "03",
                icon: <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />,
                title: "Get Real Feedback",
                description: "Receive detailed analysis of your performance with specific recommendations to improve your pitch and raise capital faster.",
                time: "Instant results"
              }
            ].map((item, index) => (
              <GlassTextBox
                key={index}
                delay={index * 0.2}
                className="relative group text-center"
              >
                <motion.div 
                  className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-2 sm:px-3 py-1 rounded-full font-semibold text-xs sm:text-sm"
                  whileHover={{ scale: 1.1 }}
                >
                  {item.step}
                </motion.div>
                
                <div className="mt-6 sm:mt-8 mb-4 sm:mb-6 flex justify-center">
                  <motion.div 
                    className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl flex items-center justify-center border border-slate-600/30"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    {item.icon}
                  </motion.div>
                </div>
                
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">
                  {item.title}
                </h3>
                <p className="text-white mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">
                  {item.description}
                </p>
                
                <div className="text-center">
                  <motion.span 
                    className="bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600/30 rounded-full px-2 sm:px-3 py-1 text-xs sm:text-sm text-white font-medium"
                    whileHover={{ scale: 1.05 }}
                  >
                    {item.time}
                  </motion.span>
                </div>
              </GlassTextBox>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative py-16 sm:py-24">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold tracking-tight mb-4 sm:mb-6 text-white leading-tight">
              How can Rohan help you raise your round?
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                icon: <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />,
                title: "Thinks Like Real VCs",
                description: "Trained on actual investor conversations from top-tier firms"
              },
              {
                icon: <Target className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />,
                title: "Asks Tough Questions",
                description: "Challenges you on market size, competition, and business model"
              },
              {
                icon: <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />,
                title: "Never Judges You",
                description: "Practice unlimited times without fear of rejection"
              },
              {
                icon: <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />,
                title: "Detailed Performance Analysis",
                description: "Get specific feedback on every aspect of your pitch"
              },
              {
                icon: <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />,
                title: "Actionable Insights",
                description: "Learn exactly what to improve before your next investor meeting"
              },
              {
                icon: <Growth className="w-5 h-5 sm:w-6 sm:h-6 text-pink-400" />,
                title: "Faster Capital Raising",
                description: "Founders using AI training raise capital 3x faster"
              }
            ].map((feature, index) => (
              <GlassTextBox
                key={index}
                delay={index * 0.1}
                className="text-center group"
              >
                <div className="flex flex-col items-center mb-3 sm:mb-4">
                  <motion.div 
                    className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl flex items-center justify-center border border-slate-600/30 mb-3 sm:mb-4"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    {feature.icon}
                  </motion.div>
                  <h3 className="text-base sm:text-lg font-semibold text-white">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-white text-sm sm:text-base leading-relaxed">{feature.description}</p>
              </GlassTextBox>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-16 sm:py-24">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold tracking-tight mb-6 sm:mb-8 text-white leading-tight">
              Stop Practicing with Friends.
              <br />
              <span className="text-gradient-accent">Start Training with AI.</span>
            </h2>
            
            <p className="text-lg sm:text-xl lg:text-2xl mb-8 sm:mb-12 max-w-2xl mx-auto text-white leading-relaxed">
              Join thousands of founders who are using AI to perfect their pitch 
              and raise capital faster. Your AI investor is waiting to help you succeed.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
              <GlassButton onClick={handleJoinWaitlist} className="w-full sm:w-auto">
                <Rocket className="w-4 h-4 sm:w-5 sm:h-5" />
                Join Waitlist
                <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
              </GlassButton>
              
              <div className="text-white text-sm sm:text-base text-center sm:text-left">
                <p>✓ No credit card required</p>
                <p>✓ Unlimited practice sessions</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-slate-700/30 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <GlassTextBox className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 text-center sm:text-left">
            <div className="sm:col-span-2 lg:col-span-1">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center justify-center sm:justify-start gap-2">
                <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
                AgentVC
              </h3>
              <p className="text-white text-sm sm:text-base leading-relaxed">
                The world's first AI investor that helps founders raise capital faster through real feedback and unlimited practice.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">Product</h4>
              <ul className="space-y-2 text-white text-sm sm:text-base">
                <li><a href="#features" className="hover:text-indigo-400 transition-colors">AI Investor Features</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">How It Works</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">Support</h4>
              <ul className="space-y-2 text-white text-sm sm:text-base">
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700/30 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-white text-xs sm:text-sm">
            <p>&copy; 2025 AgentVC. The world's first AI investor. All rights reserved.</p>
          </div>
        </GlassTextBox>
      </footer>
    </div>
  );
};

export default LandingPage;