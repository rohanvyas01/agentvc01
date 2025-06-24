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

  // Reusable glass button component
  const GlassButton = ({ children, onClick, className = "", ...props }: any) => (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-lg px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl relative group overflow-hidden ${className}`}
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
      className={`glass rounded-2xl p-8 transition-all duration-300 hover:shadow-xl ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );

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
          <GlassTextBox className="text-center max-w-4xl mx-auto">
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
              <GlassButton onClick={handleJoinWaitlist}>
                <Rocket className="w-5 h-5" />
                Join Waitlist
                <ExternalLink className="w-4 h-4" />
              </GlassButton>
            </motion.div>
          </GlassTextBox>
        </div>
      </section>

      {/* Problem Section */}
      <section className="relative section-spacing">
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-transparent"
          style={{ y: y2 }}
        />
        
        <div className="relative max-w-7xl mx-auto container-padding">
          <GlassTextBox className="text-center mb-16">
            <h2 className="text-headline mb-6 text-white">
              Why Founders <span className="text-red-400">Struggle</span> to Raise Capital
            </h2>
            <p className="text-subtitle max-w-3xl mx-auto text-white">
              Most founders practice with the wrong people and get the wrong feedback. 
              Rohan asks tough questions you've never heard before.
            </p>
          </GlassTextBox>

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
              <GlassTextBox
                key={index}
                delay={index * 0.2}
                className="text-center group"
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
              </GlassTextBox>
            ))}
          </div>
        </div>
      </section>

      {/* Meet Rohan Section */}
      <section className="relative section-spacing">
        <div className="max-w-7xl mx-auto container-padding">
          <GlassTextBox className="text-center mb-16">
            <motion.div 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500/20 to-purple-600/20 border border-indigo-500/30 rounded-full px-4 py-2 mb-6"
              whileHover={{ scale: 1.05 }}
            >
              <Bot className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-medium text-white">Meet Your AI Investor</span>
            </motion.div>
            
            <h2 className="text-headline mb-6 text-white">
              Meet <span className="text-gradient-accent">Rohan Vyas</span>
            </h2>
            <p className="text-subtitle max-w-3xl mx-auto text-white">
              The world's first AI investor with a legendary track record. 
              Rohan has seen it all, invested in everything, and knows exactly what makes VCs say yes.
            </p>
          </GlassTextBox>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Rohan's Photo and Basic Info */}
            <GlassTextBox className="text-center lg:text-left">
              <div className="relative inline-block mb-8">
                <motion.div
                  className="relative"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <img
                    src="/5874fe52-4169-461c-aff3-3c84ab6638fc.png"
                    alt="Rohan Vyas - Your AI Investor"
                    className="w-80 h-80 object-cover object-center rounded-2xl border-4 border-gradient-to-br from-indigo-500/30 to-purple-600/30 shadow-2xl"
                    style={{
                      objectPosition: 'center top',
                      filter: 'brightness(1.1) contrast(1.1)'
                    }}
                  />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white animate-pulse"></div>
                </motion.div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-3xl font-bold text-white">Rohan Vyas</h3>
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
            </GlassTextBox>

            {/* Rohan's Comprehensive Background */}
            <GlassTextBox>
              <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-400" />
                Complete Background
              </h4>
              <div className="space-y-3 text-white">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p><span className="font-semibold">NYU Electronics Bachelor's</span> - Graduated summa cum laude with honors in electrical engineering</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p><span className="font-semibold">Harvard MS in Electrical Engineering</span> - Specialized in AI and machine learning systems</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p><span className="font-semibold">Stanford MBA</span> - Focus on venture capital and entrepreneurship</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p><span className="font-semibold">4-time founder</span> - Built and scaled companies across fintech, AI, and enterprise software</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p><span className="font-semibold">Exited 4 times</span> - Successful acquisitions by Google, Microsoft, Amazon, and Salesforce</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-pink-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p><span className="font-semibold">Now an investor</span> - Partner at top-tier VC firms with $2B+ in deployed capital</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p><span className="font-semibold">Evaluated 5000+ decks</span> - Knows every pattern, red flag, and success indicator</p>
                </div>
              </div>
            </GlassTextBox>
          </div>

          <GlassTextBox className="text-center mt-16">
            <GlassButton onClick={handleJoinWaitlist}>
              <Bot className="w-5 h-5" />
              Meet Rohan Vyas
              <ExternalLink className="w-4 h-4" />
            </GlassButton>
          </GlassTextBox>
        </div>
      </section>

      {/* Without Rohan vs With Rohan Comparison */}
      <section className="relative section-spacing">
        <div className="max-w-7xl mx-auto container-padding">
          <GlassTextBox className="text-center mb-16">
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
              <GlassButton onClick={handleJoinWaitlist}>
                Meet Rohan Vyas
                <ArrowRight className="w-4 h-4" />
              </GlassButton>
            </motion.div>
          </GlassTextBox>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Without Rohan */}
            <GlassTextBox className="bg-gradient-to-br from-red-900/20 to-red-800/20 border border-red-500/30">
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
            </GlassTextBox>

            {/* With Rohan */}
            <GlassTextBox className="bg-gradient-to-br from-green-900/20 to-emerald-800/20 border border-green-500/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">With Rohan Vyas</h3>
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
            </GlassTextBox>
          </div>

          <GlassTextBox className="text-center mt-12">
            <GlassButton onClick={handleJoinWaitlist}>
              Get started for free
              <ExternalLink className="w-4 h-4" />
            </GlassButton>
          </GlassTextBox>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative section-spacing">
        <div className="max-w-7xl mx-auto container-padding">
          <GlassTextBox className="text-center mb-16">
            <h2 className="text-headline mb-6 text-white">
              How can Rohan help you raise your round?
            </h2>
            <p className="text-subtitle max-w-3xl mx-auto text-white">
            </p>
          </GlassTextBox>

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
              <GlassTextBox
                key={index}
                delay={index * 0.1}
                className="text-center group"
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
              </GlassTextBox>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative section-spacing">
        <div className="max-w-4xl mx-auto container-padding text-center">
          <GlassTextBox className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
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
              <GlassButton onClick={handleJoinWaitlist}>
                <Rocket className="w-5 h-5" />
                Join Waitlist
                <ExternalLink className="w-4 h-4" />
              </GlassButton>
              
              <div className="text-white text-sm">
                <p>✓ No credit card required</p>
                <p>✓ Unlimited practice sessions</p>
              </div>
            </div>
          </GlassTextBox>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-slate-700/30 py-12 container-padding">
        <GlassTextBox className="max-w-7xl mx-auto">
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
        </GlassTextBox>
      </footer>
    </div>
  );
};

export default LandingPage;