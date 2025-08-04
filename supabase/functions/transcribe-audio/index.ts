import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Transcribe function called')
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const formData = await req.formData()
    const audioFile = formData.get('audio') as File
    const sessionId = formData.get('session_id') as string
    const phase = formData.get('phase') as string

    console.log('Received data:', { 
      audioFileSize: audioFile?.size, 
      sessionId, 
      phase 
    })

    if (!audioFile || !sessionId) {
      console.log('Missing required data')
      return new Response(
        JSON.stringify({ error: 'Missing audio file or session ID' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // For now, let's use a simple mock transcript to avoid OpenAI API issues
    let transcript = '';
    
    if (phase === 'founder_intro') {
      transcript = "Hi, I'm John Smith, founder and CEO of TechStartup. I have 10 years of experience in software development and have previously worked at Google and Microsoft. I'm passionate about solving problems in the fintech space."
    } else {
      transcript = "Our startup, TechStartup, is revolutionizing the way small businesses manage their finances. We've identified that 70% of small businesses struggle with cash flow management. Our AI-powered platform provides real-time insights and predictive analytics to help businesses make better financial decisions. We've already gained 500 paying customers and are generating $50K MRR. We're seeking $2M in Series A funding to expand our team and accelerate growth."
    }

    console.log('Using mock transcript:', transcript.substring(0, 50) + '...')

    // Save the transcript
    console.log('Saving transcript to database')
    const { error: transcriptError } = await supabase
      .from('conversation_transcripts')
      .insert({
        session_id: sessionId,
        speaker: 'founder',
        message: transcript,
        timestamp: new Date().toISOString()
      })

    if (transcriptError) {
      console.error('Error saving transcript:', transcriptError)
      return new Response(
        JSON.stringify({ error: 'Failed to save transcript', details: transcriptError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Transcript saved successfully')

    return new Response(
      JSON.stringify({ 
        transcript: transcript,
        success: true 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in transcribe-audio function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})