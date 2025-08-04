import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

console.log("Generate Report PDF function initializing...");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PDFRequest {
  session_id: string;
  report_data: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { session_id, report_data }: PDFRequest = await req.json();

    if (!session_id || !report_data) {
      throw new Error('session_id and report_data are required');
    }

    console.log(`Generating PDF report for session ${session_id}`);

    // Generate HTML content for PDF
    const htmlContent = generatePDFHTML(report_data);

    // For now, return the HTML content as a simple PDF alternative
    // In production, you would use a service like Puppeteer or similar to generate actual PDFs
    const pdfContent = generateSimplePDF(report_data);

    return new Response(pdfContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="session-report-${session_id}.pdf"`
      },
    });

  } catch (error) {
    console.error('Error in generate-report-pdf function:', error);
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

function generatePDFHTML(reportData: any): string {
  const companyName = reportData.summary?.company_name || 'Your Company';
  const sessionDate = new Date(reportData.summary?.session_date || Date.now()).toLocaleDateString();
  const overallScore = reportData.analysis?.overall_score || 0;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Session Report - ${companyName}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 2px solid #4f46e5;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #4f46e5;
          margin-bottom: 10px;
        }
        .score-section {
          background: #f8fafc;
          padding: 30px;
          border-radius: 8px;
          text-align: center;
          margin: 30px 0;
          border: 2px solid #e2e8f0;
        }
        .score {
          font-size: 60px;
          font-weight: bold;
          color: #4f46e5;
          margin-bottom: 10px;
        }
        .section {
          margin: 30px 0;
          page-break-inside: avoid;
        }
        .section h3 {
          color: #1e293b;
          margin-bottom: 15px;
          font-size: 20px;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 5px;
        }
        .content-box {
          background: #f8fafc;
          padding: 20px;
          border-radius: 6px;
          border-left: 4px solid #4f46e5;
        }
        .strengths-box {
          border-left-color: #22c55e;
          background: #f0fdf4;
        }
        .improvements-box {
          border-left-color: #eab308;
          background: #fefce8;
        }
        ul {
          margin: 10px 0;
          padding-left: 25px;
        }
        li {
          margin: 8px 0;
        }
        .transcript-section {
          margin-top: 40px;
        }
        .transcript-item {
          margin: 15px 0;
          padding: 15px;
          border-radius: 6px;
          border-left: 4px solid #e2e8f0;
        }
        .founder-message {
          background: #eff6ff;
          border-left-color: #3b82f6;
        }
        .investor-message {
          background: #f8fafc;
          border-left-color: #64748b;
        }
        .speaker {
          font-weight: bold;
          margin-bottom: 5px;
        }
        .timestamp {
          font-size: 12px;
          color: #64748b;
          margin-left: 10px;
        }
        .footer {
          margin-top: 50px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          text-align: center;
          color: #64748b;
          font-size: 14px;
        }
        @media print {
          body { margin: 0; padding: 20px; }
          .section { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">AgentVC</div>
        <h1>Session Report</h1>
        <p><strong>Company:</strong> ${companyName}</p>
        <p><strong>Session Date:</strong> ${sessionDate}</p>
        <p><strong>Duration:</strong> ${reportData.summary?.duration_minutes || 0} minutes</p>
      </div>

      <div class="score-section">
        <div class="score">${overallScore}/10</div>
        <p><strong>Overall Pitch Performance Score</strong></p>
      </div>

      ${reportData.analysis?.key_strengths?.length > 0 ? `
      <div class="section">
        <h3>🎯 Key Strengths</h3>
        <div class="content-box strengths-box">
          <ul>
            ${reportData.analysis.key_strengths.map((strength: string) => `<li>${strength}</li>`).join('')}
          </ul>
        </div>
      </div>
      ` : ''}

      ${reportData.analysis?.improvement_areas?.length > 0 ? `
      <div class="section">
        <h3>📈 Areas for Improvement</h3>
        <div class="content-box improvements-box">
          <ul>
            ${reportData.analysis.improvement_areas.map((area: string) => `<li>${area}</li>`).join('')}
          </ul>
        </div>
      </div>
      ` : ''}

      ${reportData.analysis?.detailed_feedback ? `
      <div class="section">
        <h3>📝 Detailed Feedback</h3>
        <div class="content-box">
          <p>${reportData.analysis.detailed_feedback}</p>
        </div>
      </div>
      ` : ''}

      ${reportData.recommendations?.length > 0 ? `
      <div class="section">
        <h3>💡 Recommendations</h3>
        <div class="content-box">
          <ul>
            ${reportData.recommendations.map((rec: string) => `<li>${rec}</li>`).join('')}
          </ul>
        </div>
      </div>
      ` : ''}

      ${reportData.next_steps?.length > 0 ? `
      <div class="section">
        <h3>🚀 Next Steps</h3>
        <div class="content-box">
          <ul>
            ${reportData.next_steps.map((step: string) => `<li>${step}</li>`).join('')}
          </ul>
        </div>
      </div>
      ` : ''}

      ${reportData.follow_up_questions?.length > 0 ? `
      <div class="section">
        <h3>❓ Follow-up Questions for Practice</h3>
        <div class="content-box">
          <ul>
            ${reportData.follow_up_questions.map((question: string) => `<li>${question}</li>`).join('')}
          </ul>
        </div>
      </div>
      ` : ''}

      ${reportData.transcript?.length > 0 ? `
      <div class="section transcript-section">
        <h3>💬 Conversation Transcript</h3>
        ${reportData.transcript.map((item: any) => `
          <div class="transcript-item ${item.speaker === 'founder' ? 'founder-message' : 'investor-message'}">
            <div class="speaker">
              ${item.speaker === 'founder' ? 'You' : 'AI Investor'}
              <span class="timestamp">${item.formatted_time || formatTimestamp(item.timestamp_ms)}</span>
            </div>
            <p>${item.content}</p>
          </div>
        `).join('')}
      </div>
      ` : ''}

      <div class="footer">
        <p><strong>Generated by AgentVC</strong></p>
        <p>Report generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        <p>Keep practicing to improve your pitch performance!</p>
      </div>
    </body>
    </html>
  `;
}

function generateSimplePDF(reportData: any): string {
  // This is a simplified text-based PDF alternative
  // In production, you would use a proper PDF generation library
  const companyName = reportData.summary?.company_name || 'Your Company';
  const sessionDate = new Date(reportData.summary?.session_date || Date.now()).toLocaleDateString();
  const overallScore = reportData.analysis?.overall_score || 0;
  
  let content = `
SESSION REPORT
==============

Company: ${companyName}
Session Date: ${sessionDate}
Duration: ${reportData.summary?.duration_minutes || 0} minutes
Overall Score: ${overallScore}/10

`;

  if (reportData.analysis?.key_strengths?.length > 0) {
    content += `
KEY STRENGTHS
-------------
${reportData.analysis.key_strengths.map((s: string) => `• ${s}`).join('\n')}

`;
  }

  if (reportData.analysis?.improvement_areas?.length > 0) {
    content += `
AREAS FOR IMPROVEMENT
--------------------
${reportData.analysis.improvement_areas.map((a: string) => `• ${a}`).join('\n')}

`;
  }

  if (reportData.analysis?.detailed_feedback) {
    content += `
DETAILED FEEDBACK
-----------------
${reportData.analysis.detailed_feedback}

`;
  }

  if (reportData.recommendations?.length > 0) {
    content += `
RECOMMENDATIONS
---------------
${reportData.recommendations.map((r: string) => `• ${r}`).join('\n')}

`;
  }

  if (reportData.next_steps?.length > 0) {
    content += `
NEXT STEPS
----------
${reportData.next_steps.map((s: string) => `• ${s}`).join('\n')}

`;
  }

  if (reportData.follow_up_questions?.length > 0) {
    content += `
FOLLOW-UP QUESTIONS
-------------------
${reportData.follow_up_questions.map((q: string) => `• ${q}`).join('\n')}

`;
  }

  if (reportData.transcript?.length > 0) {
    content += `
CONVERSATION TRANSCRIPT
-----------------------
${reportData.transcript.map((item: any) => `
[${item.formatted_time || formatTimestamp(item.timestamp_ms)}] ${item.speaker.toUpperCase()}: ${item.content}
`).join('')}

`;
  }

  content += `
---
Report generated by AgentVC on ${new Date().toLocaleDateString()}
Keep practicing to improve your pitch performance!
`;

  return content;
}

function formatTimestamp(timestampMs: number): string {
  const minutes = Math.floor(timestampMs / 60000);
  const seconds = Math.floor((timestampMs % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}