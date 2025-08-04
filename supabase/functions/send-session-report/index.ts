import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

console.log("Send Session Report function initializing...");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Email service configuration (using Resend as example)
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'reports@agentvc.com';

interface EmailRequest {
  session_id: string;
  report_id: string;
  recipient_email?: string;
  subject?: string;
  include_attachment?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    // Validate email service configuration
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is not configured');
    }

    // Parse request body
    const {
      session_id,
      report_id,
      recipient_email,
      subject,
      include_attachment = false
    }: EmailRequest = await req.json();

    if (!session_id || !report_id) {
      throw new Error('session_id and report_id are required');
    }

    console.log(`Sending email report for session ${session_id}`);

    // Get session and report data
    const { data: sessionData, error: sessionError } = await supabaseAdmin
      .from('sessions')
      .select(`
        *,
        companies(*),
        pitch_decks(deck_name),
        session_reports!inner(*)
      `)
      .eq('id', session_id)
      .eq('session_reports.id', report_id)
      .single();

    if (sessionError || !sessionData) {
      throw new Error(`Session or report not found: ${sessionError?.message}`);
    }

    // Get user email if not provided
    let emailRecipient = recipient_email;
    if (!emailRecipient) {
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(sessionData.user_id);
      if (userError || !userData.user?.email) {
        throw new Error('Could not determine recipient email address');
      }
      emailRecipient = userData.user.email;
    }

    const report = sessionData.session_reports[0];
    const reportData = report.report_data;

    // Generate email content
    const emailContent = generateEmailContent(sessionData, reportData);
    
    // Send email using Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [emailRecipient],
        subject: subject || `Your Session Report - ${new Date(sessionData.created_at).toLocaleDateString()}`,
        html: emailContent.html,
        text: emailContent.text,
        ...(include_attachment && {
          attachments: [{
            filename: `session-report-${session_id}.json`,
            content: btoa(JSON.stringify(reportData, null, 2)),
            type: 'application/json'
          }]
        })
      })
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      throw new Error(`Email sending failed: ${emailResponse.status} ${errorText}`);
    }

    const emailResult = await emailResponse.json();
    console.log(`Email sent successfully for session ${session_id}:`, emailResult.id);

    // Update report as sent
    await supabaseAdmin
      .from('session_reports')
      .update({
        email_sent: true,
        email_sent_at: new Date().toISOString()
      })
      .eq('id', report_id);

    return new Response(JSON.stringify({
      success: true,
      message: `Report emailed successfully to ${emailRecipient}`,
      email_id: emailResult.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in send-session-report function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateEmailContent(sessionData: any, reportData: any) {
  const companyName = sessionData.companies?.name || 'Your Company';
  const sessionDate = new Date(sessionData.created_at).toLocaleDateString();
  const overallScore = reportData.analysis?.overall_score || 0;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Session Report - ${companyName}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8fafc;
        }
        .container {
          background: white;
          border-radius: 12px;
          padding: 32px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 2px solid #e2e8f0;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #4f46e5;
          margin-bottom: 8px;
        }
        .score-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 24px;
          border-radius: 8px;
          text-align: center;
          margin: 24px 0;
        }
        .score {
          font-size: 48px;
          font-weight: bold;
          margin-bottom: 8px;
        }
        .section {
          margin: 24px 0;
        }
        .section h3 {
          color: #1e293b;
          margin-bottom: 12px;
          font-size: 18px;
        }
        .strengths {
          background: #f0fdf4;
          border-left: 4px solid #22c55e;
          padding: 16px;
          border-radius: 4px;
        }
        .improvements {
          background: #fefce8;
          border-left: 4px solid #eab308;
          padding: 16px;
          border-radius: 4px;
        }
        .recommendations {
          background: #f0f9ff;
          border-left: 4px solid #3b82f6;
          padding: 16px;
          border-radius: 4px;
        }
        ul {
          margin: 8px 0;
          padding-left: 20px;
        }
        li {
          margin: 4px 0;
        }
        .footer {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #e2e8f0;
          text-align: center;
          color: #64748b;
          font-size: 14px;
        }
        .cta {
          background: #4f46e5;
          color: white;
          padding: 12px 24px;
          border-radius: 6px;
          text-decoration: none;
          display: inline-block;
          margin: 16px 0;
          font-weight: 500;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">AgentVC</div>
          <h1>Your Session Report</h1>
          <p>Session Date: ${sessionDate} | Company: ${companyName}</p>
        </div>

        <div class="score-section">
          <div class="score">${overallScore}/10</div>
          <p>Overall Pitch Performance Score</p>
        </div>

        ${reportData.analysis?.key_strengths?.length > 0 ? `
        <div class="section">
          <h3>🎯 Key Strengths</h3>
          <div class="strengths">
            <ul>
              ${reportData.analysis.key_strengths.map((strength: string) => `<li>${strength}</li>`).join('')}
            </ul>
          </div>
        </div>
        ` : ''}

        ${reportData.analysis?.improvement_areas?.length > 0 ? `
        <div class="section">
          <h3>📈 Areas for Improvement</h3>
          <div class="improvements">
            <ul>
              ${reportData.analysis.improvement_areas.map((area: string) => `<li>${area}</li>`).join('')}
            </ul>
          </div>
        </div>
        ` : ''}

        ${reportData.recommendations?.length > 0 ? `
        <div class="section">
          <h3>💡 Recommendations</h3>
          <div class="recommendations">
            <ul>
              ${reportData.recommendations.map((rec: string) => `<li>${rec}</li>`).join('')}
            </ul>
          </div>
        </div>
        ` : ''}

        ${reportData.next_steps?.length > 0 ? `
        <div class="section">
          <h3>🚀 Next Steps</h3>
          <ul>
            ${reportData.next_steps.map((step: string) => `<li>${step}</li>`).join('')}
          </ul>
        </div>
        ` : ''}

        <div class="section" style="text-align: center;">
          <a href="${Deno.env.get('FRONTEND_URL') || 'https://app.agentvc.com'}/dashboard" class="cta">
            View Full Report in Dashboard
          </a>
        </div>

        <div class="footer">
          <p>This report was generated automatically by AgentVC.</p>
          <p>Keep practicing to improve your pitch performance!</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
AgentVC Session Report

Company: ${companyName}
Session Date: ${sessionDate}
Overall Score: ${overallScore}/10

${reportData.analysis?.key_strengths?.length > 0 ? `
Key Strengths:
${reportData.analysis.key_strengths.map((s: string) => `• ${s}`).join('\n')}
` : ''}

${reportData.analysis?.improvement_areas?.length > 0 ? `
Areas for Improvement:
${reportData.analysis.improvement_areas.map((a: string) => `• ${a}`).join('\n')}
` : ''}

${reportData.recommendations?.length > 0 ? `
Recommendations:
${reportData.recommendations.map((r: string) => `• ${r}`).join('\n')}
` : ''}

${reportData.next_steps?.length > 0 ? `
Next Steps:
${reportData.next_steps.map((s: string) => `• ${s}`).join('\n')}
` : ''}

View your full report at: ${Deno.env.get('FRONTEND_URL') || 'https://app.agentvc.com'}/dashboard

This report was generated automatically by AgentVC.
Keep practicing to improve your pitch performance!
  `;

  return { html, text };
}