export interface ConversationScript {
  greeting_and_intro: string;
  founder_introduction_request: string;
  pitch_request: string;
  wrap_up: string;
}

export const createConversationScript = (founderName: string): ConversationScript => {
  return {
    greeting_and_intro: `Hi ${founderName}! Welcome to AgentVC. I'm Rohan Vyas, and I'm excited to hear about your startup today. Let me quickly introduce AgentVC - we're an AI-powered platform that helps founders like you practice and perfect your investor pitches. I'm here to listen to your pitch and provide you with detailed feedback and analysis. After our conversation, you'll receive a comprehensive report that will help you feel more confident when you pitch to actual investors. Now, before we dive into your pitch, could you please introduce yourself and tell me a bit about your background?`,
    
    founder_introduction_request: `Great to meet you, ${founderName}! Thank you for that introduction. Now I'm really excited to hear about your startup.`,
    
    pitch_request: `Perfect! Now, I'd love to hear your full startup pitch. Please go ahead and present your startup as if you're pitching to a real investor. Take your time, cover everything you think is important - your problem, solution, market, business model, traction, team, funding needs, whatever you feel is crucial for me to understand your venture. I'm all ears!`,
    
    wrap_up: `Thank you ${founderName}, that was an excellent pitch! I've captured everything you've shared with me today. Our AI analysis has begun and you'll receive a comprehensive report with detailed feedback, strengths, areas for improvement, and strategic recommendations within the next couple of hours. You can check your dashboard to see when the analysis is complete. If you'd like to practice again or refine your pitch, you can always restart a new session. Thanks for using AgentVC, and best of luck with your fundraising journey. I'll be in touch soon!`
  };
};

export const INVESTOR_PERSONAS = {
  angel: {
    name: "Angel Investor",
    description: "Experienced angel investor focused on early-stage startups",
    greeting_prefix: "Hi there! I'm an angel investor who specializes in early-stage companies."
  },
  vc: {
    name: "VC Partner", 
    description: "Venture Capital partner focused on Series A and growth stage",
    greeting_prefix: "Hello! I'm a VC partner who focuses on Series A and growth-stage investments."
  }
} as const;