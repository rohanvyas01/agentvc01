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
  Check
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
              className="inline-flex items-center gap-3 bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-full px-6 py-3 mb-8"
            >
              <motion.div
                animate={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="flex items-center justify-center w-8 h-8 bg-red-500/20 rounded-full"
              >
                <TrendingDown className="w-4 h-4 text-red-400" />
              </motion.div>
              <span className="text-white font-semibold">38% of startups fail due to running out of cash</span>
            </motion.div>

            <motion.h1 
              className="text-display mb-6 text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Perfect Your Pitch
              <br />
              <span className="text-white/80">Before It's Too Late</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-subtitle mb-8 max-w-3xl mx-auto text-white"
            >
              The fastest path from pitch deck to term sheet. Streamline your fundraise with AI-driven prep that gets you funded and back to building.
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
                  <Mail className="w-5 h-5" />
                  Get access to 200 VC's emails
                  <ExternalLink className="w-4 h-4" />
                </div>
              </motion.button>
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
                className="text-center group"
                whileHover={{ y: -4 }}
              >
                <motion.div 
                  className="flex justify-center mb-6"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  {item.icon}
                </motion.div>
                <h3 className="text-xl font-semibold text-white mb-4">{item.title}</h3>
                <p className="text-white mb-4">{item.description}</p>
                <motion.div 
                  className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-2"
                  whileHover={{ scale: 1.05 }}
                >
                  <span className="text-sm text-red-300 font-medium">{item.stat}</span>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section - Two Column Comparison */}
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
              Meet Your <span className="text-gradient-accent">AI Investors</span>
            </h2>
            <p className="text-subtitle max-w-3xl mx-auto text-white">
              Train with AI that thinks like real VCs. Get the tough questions and honest feedback 
              you need to perfect your pitch and raise capital faster.
            </p>
          </motion.div>

          {/* Two Column Comparison Layout */}
          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Without AgentVC - Red */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-red-900/20 to-red-800/10 border border-red-500/30 rounded-2xl p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <X className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">Without AgentVC</h3>
              </div>
              
              <div className="space-y-4">
                {[
                  "Practice with friends who give softball questions",
                  "Get vague feedback like 'sounds good'",
                  "Face real investors unprepared",
                  "Struggle with tough follow-up questions",
                  "Miss funding opportunities due to poor performance",
                  "Waste months preparing the wrong way"
                ].map((item, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <span className="text-white">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* With AgentVC - Green */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-green-900/20 to-green-800/10 border border-green-500/30 rounded-2xl p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">With AgentVC</h3>
              </div>
              
              <div className="space-y-4">
                {[
                  "Practice with AI that asks real investor questions",
                  "Get detailed, actionable feedback on your performance",
                  "Face real investors with confidence",
                  "Handle tough questions like a pro",
                  "Increase your chances of securing funding",
                  "Perfect your pitch in days, not months"
                ].map((item, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-white">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
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
              Three Steps to <span className="text-gradient-accent">Pitch Mastery</span>
            </h2>
            <p className="text-subtitle max-w-3xl mx-auto text-white">
              From upload to confidence in minutes, not months.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: <Upload className="w-6 h-6 text-indigo-400" />,
                title: "Upload Your Deck",
                description: "Our AI analyzes your pitch deck to understand your business model, market, and key value propositions.",
                time: "30 seconds"
              },
              {
                step: "02",
                icon: <MessageSquare className="w-6 h-6 text-purple-400" />,
                title: "Face AI Investors",
                description: "Practice with different investor personas who ask questions based on real VC conversation patterns.",
                time: "10-15 minutes"
              },
              {
                step: "03",
                icon: <BarChart3 className="w-6 h-6 text-cyan-400" />,
                title: "Get Detailed Feedback",
                description: "Receive specific insights on your performance with actionable recommendations for improvement.",
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
              Everything You Need to <span className="text-gradient-accent">Succeed</span>
            </h2>
            <p className="text-subtitle max-w-3xl mx-auto text-white">
              Built for founders who want to raise capital faster and with more confidence.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Brain className="w-6 h-6 text-indigo-400" />,
                title: "AI Investor Personas",
                description: "Angel, Seed, Series A investors with unique questioning styles"
              },
              {
                icon: <Target className="w-6 h-6 text-purple-400" />,
                title: "Contextual Questions",
                description: "Questions tailored to your specific business and industry"
              },
              {
                icon: <Shield className="w-6 h-6 text-green-400" />,
                title: "Private & Secure",
                description: "Your pitch data remains completely confidential"
              },
              {
                icon: <BarChart3 className="w-6 h-6 text-cyan-400" />,
                title: "Performance Analytics",
                description: "Track your improvement over time with detailed metrics"
              },
              {
                icon: <Lightbulb className="w-6 h-6 text-yellow-400" />,
                title: "Instant Feedback",
                description: "Get actionable insights immediately after each session"
              },
              {
                icon: <Rocket className="w-6 h-6 text-pink-400" />,
                title: "Unlimited Practice",
                description: "Train as much as you need to build real confidence"
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
                  <Mail className="w-5 h-5" />
                  Get access to 200 VC's emails
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
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-400" />
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