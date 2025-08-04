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
    // Use service role key to bypass RLS
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const body = await req.json()
    const user_id = body.user_id

    console.log('Received request with user_id:', user_id)

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Simple founder name - just use "Founder" for now
    const founderName = 'Founder'

    console.log('Creating session for user:', user_id)

    // Get user's company and pitch deck info
    const { data: company } = await supabase
      .from('companies')
      .select('*')
      .eq('user_id', user_id)
      .single()

    const { data: pitchDeck } = await supabase
      .from('pitch_decks')
      .select('*')
      .eq('user_id', user_id)
      .eq('processing_status', 'processed')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Create session with minimal required fields
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        user_id: user_id,
        company_id: company?.id || null,
        pitch_deck_id: pitchDeck?.id || null,
        tavus_persona_id: 'rohan-vyas', // Static persona for now
        status: 'created'
      })
      .select()
      .single()

    console.log('Insert result:', { session, sessionError })

    if (sessionError) {
      console.error('Database error:', sessionError)
      return new Response(
        JSON.stringify({ 
          error: 'Database error', 
          details: sessionError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Session created successfully:', session.id)

    return new Response(
      JSON.stringify({ 
        session_id: session.id,
        founder_name: founderName,
        company: company,
        pitch_deck: pitchDeck,
        success: true 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})