import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AnalysisRequest {
  session_id: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { session_id }: AnalysisRequest = await req.json()
    console.log('Starting analysis for session:', session_id)

    // Get session details
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', session_id)
      .single()

    if (sessionError || !session) {
      throw new Error('Session not found')
    }

    // Get conversation transcripts
    const { data: transcripts, error: transcriptError } = await supabase
      .from('conversation_transcripts')
      .select('*')
      .eq('session_id', session_id)
      .order('timestamp', { ascending: true })

    if (transcriptError) {
      console.error('Error fetching transcripts:', transcriptError)
    }

    console.log(`Found ${transcripts?.length || 0} transcript entries for analysis`)

    // For now, create a mock analysis
    const mockAnalysis = {
      session_id: session_id,
      overall_score: Math.floor(Math.random() * 30) + 70, // 70-100
      strengths: [
        "Clear problem articulation",
        "Strong market understanding",
        "Compelling value proposition"
      ],
      areas_for_improvement: [
        "Provide more specific metrics",
        "Elaborate on competitive advantages",
        "Clarify funding use cases"
      ],
      detailed_feedback: {
        problem_solution_fit: "Good understanding of the problem space with a clear solution approach.",
        market_opportunity: "Demonstrated awareness of market size and target customer segments.",
        business_model: "Revenue model is clear but could benefit from more detailed unit economics.",
        team_strength: "Strong founding team with relevant experience.",
        traction: "Early traction indicators are promising but need more quantitative data.",
        competition: "Competitive landscape analysis could be more thorough.",
        funding_ask: "Funding amount is reasonable but use of funds needs more specificity.",
        risks_challenges: "Good awareness of potential challenges with mitigation strategies."
      },
      follow_up_questions: [
        "What are your customer acquisition costs and lifetime value?",
        "How do you plan to scale your team with the funding?",
        "What are your key metrics for measuring success?"
      ],
      next_steps: [
        "Prepare detailed financial projections",
        "Gather more customer testimonials",
        "Develop a comprehensive go-to-market strategy"
      ],
      created_at: new Date().toISOString()
    }

    // Save analysis to database
    const { error: analysisError } = await supabase
      .from('session_analyses')
      .insert(mockAnalysis)

    if (analysisError) {
      console.error('Error saving analysis:', analysisError)
      // Don't fail if analysis table doesn't exist yet
    }

    // Update session status to completed
    await supabase
      .from('sessions')
      .update({ 
        status: 'completed',
        analysis_completed_at: new Date().toISOString()
      })
      .eq('id', session_id)

    console.log('✅ Analysis completed for session:', session_id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        session_id,
        analysis: mockAnalysis
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Analysis error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Analysis failed' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})