// supabase/functions/pitch-deck-processor/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import pdf from 'npm:pdf-parse@1.1.1';

console.log("Function cold start: Initializing...");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-company-id, x-file-name, x-file-type',
};

serve(async (req) => {
  console.log(`[${new Date().toISOString()}] Received request: ${req.method}`);
  
  if (req.method === 'OPTIONS') {
    console.log("Responding to OPTIONS preflight request.");
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Step 1: Authenticate the user
    console.log("Step 1: Authenticating user...");
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error(`User not authenticated: ${userError?.message}`);
    }
    console.log(`User authenticated: ${user.id}`);

    // Step 2: Get file and metadata
    console.log("Step 2: Getting file and metadata from request...");
    const file = await req.blob();
    const companyId = req.headers.get('x-company-id');
    const fileName = req.headers.get('x-file-name') || `deck-${Date.now()}.pdf`;
    console.log(`File: ${fileName}, Company ID: ${companyId}`);

    if (!companyId) {
      throw new Error('Company ID (x-company-id) header is missing.');
    }

    // Step 3: Upload file to Storage
    const filePath = `${user.id}/${companyId}/${Date.now()}_${fileName}`;
    console.log(`Step 3: Uploading file to Storage at path: ${filePath}`);
    const { error: uploadError } = await supabaseClient.storage
      .from('pitchdecks')
      .upload(filePath, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      throw new Error(`Storage Error: ${uploadError.message}`);
    }
    console.log("File uploaded to Storage successfully.");

    // Step 4: Parse PDF text
    console.log("Step 4: Parsing PDF content...");
    const fileBuffer = await file.arrayBuffer();
    const pdfData = await pdf(fileBuffer);
    
    // *** THE FIX IS HERE ***
    // Sanitize the extracted text to remove null characters ('\u0000')
    const sanitizedText = pdfData.text.replace(/\u0000/g, '');
    console.log(`PDF parsed and sanitized. Extracted ${sanitizedText.length} characters.`);

    // Step 5: Save metadata to database
    console.log("Step 5: Inserting record into 'pitch_decks' table...");
    const { data: pitchRecord, error: dbError } = await supabaseClient
      .from('pitch_decks')
      .insert({
        user_id: user.id,
        company_id: companyId,
        deck_name: fileName.replace(/\.[^/.]+$/, ''),
        storage_path: filePath,
        extracted_text: sanitizedText, // Use the sanitized text
        file_size: file.size,
        file_type: file.type,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database Insert Error:", dbError);
      await supabaseClient.storage.from('pitchdecks').remove([filePath]);
      throw new Error(`Database Error: ${dbError.message}`);
    }
    console.log(`Database record inserted successfully. ID: ${pitchRecord.id}`);

    // Step 6: Return success response
    console.log("Step 6: Returning successful response.");
    return new Response(JSON.stringify(pitchRecord), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    console.error('!!! Function crashed:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
