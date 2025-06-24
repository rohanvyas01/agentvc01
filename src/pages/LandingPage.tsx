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
              className="text-display mb-6 text-white text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Perfect Your Pitch
              <br />
              Before It's Too Late
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-subtitle mb-8 max-w-3xl mx-auto text-white text-center"
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
              Rohan asks tough questions you've never heard before.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Users className="w-8 h-8 text-red-400" />,
                title: "Practice with Friends",
                description: "Your friends and family give you encouragement, not the brutal honesty real investors will deliver.",
              },
              {
                icon: <MessageSquare className="w-8 h-8 text-orange-400" />,
                title: "Softball Questions",
                description: "Generic questions like 'tell me about your business' don't prepare you for investor due diligence.",
              },
              {
                icon: <Target className="w-8 h-8 text-pink-400" />,
                title: "Vague Feedback",
                description: "Hearing 'sounds good' doesn't help you improve. You need specific insights on what investors actually care about.",
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
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500/20 to-purple-600/20 border border-indigo-500/30 rounded-full px-4 py-2 mb-6"
              whileHover={{ scale: 1.05 }}
            >
              <Bot className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-medium text-white">Meet Your AI Investor</span>
            </motion.div>
            
            <h2 className="text-headline mb-6 text-white">
              Meet <span className="text-gradient-accent">Rohan</span>
            </h2>
            <p className="text-subtitle max-w-3xl mx-auto text-white">
              The world's first AI investor with a legendary track record. 
              Rohan has seen it all, invested in everything, and knows exactly what makes VCs say yes.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Rohan's Photo and Basic Info */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center lg:text-left"
            >
              <div className="relative inline-block mb-8">
                <motion.div
                  className="relative"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <img
                    src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=800"
                    alt="Rohan - Your AI Investor"
                    className="w-96 h-96 object-cover rounded-2xl border-4 border-gradient-to-br from-indigo-500/30 to-purple-600/30 shadow-2xl"
                  />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white animate-pulse"></div>
                </motion.div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-3xl font-bold text-white">Rohan Kapoor</h3>
                <p className="text-xl text-indigo-400 font-medium">Your AI Investor</p>
                <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                  <span className="bg-gradient-to-r from-indigo-500/20 to-purple-600/20 border border-indigo-500/30 rounded-full px-3 py-1 text-sm text-white">
                    Available 24/7
                  </span>
                  <span className="bg-gradient-to-r from-green-500/20 to-emerald-600/20 border border-green-500/30 rounded-full px-3 py-1 text-sm text-white">
                    Never Judges
                  </span>
                  <span className="bg-gradient-to-r from-purple-500/20 to-pink-600/20 border border-purple-500/30 rounded-full px-3 py-1 text-sm text-white">
                    Unlimited Practice
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Rohan's Crazy Professional History */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 border border-slate-600/30 rounded-xl p-6">
                <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-400" />
                  Legendary Track Record
                </h4>
                <div className="space-y-3 text-white">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p><span className="font-semibold">Former Partner at Sequoia Capital</span> - Led investments in 47 unicorns including Airbnb, WhatsApp, and Stripe</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p><span className="font-semibold">Ex-Managing Director at Andreessen Horowitz</span> - Pioneered AI investing with $2.3B deployed across 89 startups</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p><span className="font-semibold">Founded three $1B+ companies</span> - Sold to Google, Microsoft, and Amazon before age 35</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 border border-slate-600/30 rounded-xl p-6">
                <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-indigo-400" />
                  Unmatched Experience
                </h4>
                <div className="space-y-3 text-white">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p><span className="font-semibold">Evaluated 50,000+ pitch decks</span> - Knows every red flag and success pattern</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p><span className="font-semibold">Sat through 12,000+ founder meetings</span> - From pre-seed to Series C across every industry</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-pink-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p><span className="font-semibold">Trained by Marc Andreessen, Reid Hoffman, and Peter Thiel</span> - Learned from the absolute best</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 border border-slate-600/30 rounded-xl p-6">
                <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Rocket className="w-5 h-5 text-purple-400" />
                  Why He's Now AI
                </h4>
                <div className="space-y-3 text-white">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p><span className="font-semibold">Democratize access to top-tier feedback</span> - Every founder deserves world-class preparation</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p><span className="font-semibold">Available 24/7 without ego or bias</span> - Pure focus on helping you succeed</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p><span className="font-semibold">Unlimited patience for practice</span> - Perfect your pitch without burning real relationships</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mt-16"
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
                <Bot className="w-5 h-5" />
                Meet Rohan
                <ExternalLink className="w-4 h-4" />
              </div>
            </motion.button>
          </motion.div>
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
        <div className="max-w-7xl mx-auto text-center">
          <div className="grid md:grid-cols-3 gap-8 justify-items-center">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center justify-center gap-2">
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