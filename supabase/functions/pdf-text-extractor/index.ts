import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import pdf from 'pdf-parse'

console.log("PDF Text Extractor function initializing...");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  let recordId = null;
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const requestBody = await req.json();
    console.log("Received request body:", JSON.stringify(requestBody, null, 2));
    const { record } = requestBody;
    
    if (!record || !record.id || !record.pitch_deck_storage_path) {
      throw new Error("Invalid request body. 'record' with 'id' and 'pitch_deck_storage_path' is required.");
    }
    
    recordId = record.id;
    console.log(`Processing record ID: ${recordId}`);

    // STEP 1: Download the file from Supabase Storage.
    console.log("Step 1: Downloading file from storage...");
    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from('pitchdecks')
      .download(record.pitch_deck_storage_path);

    if (downloadError) {
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }
    console.log("File downloaded successfully.");

    // STEP 2: Parse the PDF to extract text
    console.log("Step 2: Parsing PDF content...");
    const buffer = await fileData.arrayBuffer();
    const parsedPdf = await pdf(buffer);
    let extractedText = parsedPdf.text ? parsedPdf.text.trim() : '';
    
    // Sanitize the extracted text to prevent Unicode escape sequence errors
    extractedText = extractedText.replace(/\\/g, '\\\\');
    
    if (!extractedText) {
      console.warn(`PDF parsing for ${recordId} resulted in empty text. The PDF might be image-based.`);
      await supabaseAdmin
        .from('pitches')
        .update({ status: 'processed_no_text', transcript_text: '' })
        .eq('id', recordId);

      return new Response(JSON.stringify({ success: true, message: "Processed, but no text content found." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    console.log(`Extracted ${extractedText.length} characters.`);

    // STEP 3: Update the record in the 'pitches' table.
    console.log("Step 3: Updating database record...");
    const { error: updateError } = await supabaseAdmin
      .from('pitches')
      .update({
        transcript_text: extractedText,
        status: 'processed',
      })
      .eq('id', recordId);

    if (updateError) {
      throw new Error(`Failed to update database: ${updateError.message}`);
    }
    console.log(`Record ${recordId} updated successfully.`);

    return new Response(JSON.stringify({ success: true, message: `Successfully processed deck ${recordId}` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('An error occurred in the processor function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    
    if (recordId) {
      await supabaseAdmin
        .from('pitches')
        .update({ status: 'failed', error_message: errorMessage })
        .eq('id', recordId);
    }
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
