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
            <motion.h1 
              className="text-display mb-6 text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Meet the World's First AI Investor

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-subtitle mb-8 max-w-3xl mx-auto text-white"
            >
              Get real feedback from an AI that thinks like top VCs. Practice unlimited times, 
              perfect your pitch, and <span className="font-bold text-indigo-400">raise capital faster</span> than ever before.
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
                  <Rocket className="w-5 h-5" />
                  Join Waitlist
                  <ExternalLink className="w-4 h-4" />
                </div>
              </motion.button>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="flex items-center justify-center gap-8 text-sm text-white/80"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Unlimited practice sessions</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Real VC-style questions</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Instant detailed feedback</span>
              </div>
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
              Why Founders <span className="text-red-400">Struggle</span> to Raise Capital
            </h2>
            <p className="text-subtitle max-w-3xl mx-auto text-white">
              Most founders practice with the wrong people and get the wrong feedback. 
              Real investors ask tough questions you've never heard before.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Users className="w-8 h-8 text-red-400" />,
                title: "Practice with Friends",
                description: "Your friends and family give you encouragement, not the brutal honesty real investors will deliver.",
                stat: "87% practice with non-investors"
              },
              {
                icon: <MessageSquare className="w-8 h-8 text-orange-400" />,
                title: "Softball Questions",
                description: "Generic questions like 'tell me about your business' don't prepare you for investor due diligence.",
                stat: "Only 23% face hard questions"
              },
              {
                icon: <Target className="w-8 h-8 text-pink-400" />,
                title: "Vague Feedback",
                description: "Hearing 'sounds good' doesn't help you improve. You need specific insights on what investors actually care about.",
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
              Why Your AI Investor is <span className="text-gradient-accent">Different</span>
            </h2>
            <p className="text-subtitle max-w-3xl mx-auto text-white">
              Built by analyzing thousands of real VC conversations and successful funding rounds.
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
            <h2 className="text-headline mb-8 text-white">
              Stop Practicing with Friends.
              <br />
              <span className="text-gradient-accent">Start Training with AI.</span>
            </h2>
            
            <p className="text-subtitle mb-12 max-w-2xl mx-auto text-white">
              Join thousands of founders who are using AI to perfect their pitch 
              and raise capital faster. Your AI investor is waiting to help you succeed.
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
                  <Rocket className="w-5 h-5" />
                  Join Waitlist
                  <ExternalLink className="w-4 h-4" />
                </div>
              </motion.button>
              
              <div className="text-white text-sm">
                <p>✓ No credit card required</p>
                <p>✓ Unlimited practice sessions</p>
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
                <Bot className="w-5 h-5 text-indigo-400" />
                AgentVC
              </h3>
              <p className="text-white">
                The world's first AI investor that helps founders raise capital faster through real feedback and unlimited practice.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-white">
                <li><a href="#features" className="hover:text-indigo-400 transition-colors">AI Investor Features</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">How It Works</a></li>
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
            <p>&copy; 2025 AgentVC. The world's first AI investor. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;