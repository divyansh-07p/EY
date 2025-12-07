import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface LoanRequest {
  amount: number;
  purpose: string;
  tenure_months: number;
  user_data: {
    monthly_income: number;
    employment_type: string;
    pan_number?: string;
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const loanRequest: LoanRequest = await req.json();

    const { data: application, error: insertError } = await supabase
      .from('loan_applications')
      .insert({
        user_id: user.id,
        amount: loanRequest.amount,
        purpose: loanRequest.purpose,
        tenure_months: loanRequest.tenure_months,
        status: 'initiated',
      })
      .select()
      .single();

    if (insertError) throw insertError;

    await supabase.from('agent_activities').insert({
      loan_application_id: application.id,
      agent_type: 'master',
      action: 'Application initiated',
      status: 'success',
      metadata: { message: 'Master Agent received loan application' },
    });

    setTimeout(async () => {
      await simulateSalesAgent(supabase, application.id, loanRequest);
    }, 2000);

    return new Response(JSON.stringify({ 
      success: true, 
      application_id: application.id,
      message: 'Loan application initiated. Our AI agents are processing your request.',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function simulateSalesAgent(supabase: any, loanId: string, request: LoanRequest) {
  await supabase.from('agent_activities').insert({
    loan_application_id: loanId,
    agent_type: 'sales',
    action: 'Negotiating loan terms',
    status: 'success',
    metadata: { 
      suggested_amount: request.amount,
      suggested_tenure: request.tenure_months,
      interest_rate: 10.5 + Math.random() * 2,
    },
  });

  await supabase.from('loan_applications').update({
    status: 'kyc_pending',
  }).eq('id', loanId);

  setTimeout(() => simulateVerificationAgent(supabase, loanId, request), 3000);
}

async function simulateVerificationAgent(supabase: any, loanId: string, request: LoanRequest) {
  await supabase.from('agent_activities').insert({
    loan_application_id: loanId,
    agent_type: 'verification',
    action: 'KYC verification complete',
    status: 'success',
    metadata: { 
      pan_verified: true,
      aadhaar_verified: true,
      cibil_check: 'passed',
    },
  });

  await supabase.from('loan_applications').update({
    status: 'verification_complete',
  }).eq('id', loanId);

  setTimeout(() => simulateUnderwritingAgent(supabase, loanId, request), 3000);
}

async function simulateUnderwritingAgent(supabase: any, loanId: string, request: LoanRequest) {
  const creditScore = Math.floor(650 + Math.random() * 200);
  const maxEligibleAmount = request.user_data.monthly_income * 60;
  const eligible = request.amount <= maxEligibleAmount && creditScore >= 650;

  await supabase.from('agent_activities').insert({
    loan_application_id: loanId,
    agent_type: 'underwriting',
    action: 'Credit evaluation complete',
    status: 'success',
    metadata: { 
      credit_score: creditScore,
      max_eligible_amount: maxEligibleAmount,
      debt_to_income_ratio: 0.35,
    },
  });

  await supabase.from('loan_applications').update({
    status: 'underwriting',
    credit_score: creditScore,
    eligibility_result: {
      eligible,
      max_amount: maxEligibleAmount,
      recommended_tenure: request.tenure_months,
    },
  }).eq('id', loanId);

  setTimeout(() => simulateSanctionAgent(supabase, loanId, eligible), 3000);
}

async function simulateSanctionAgent(supabase: any, loanId: string, eligible: boolean) {
  const finalStatus = eligible ? 'sanctioned' : 'rejected';
  
  await supabase.from('agent_activities').insert({
    loan_application_id: loanId,
    agent_type: 'sanction',
    action: eligible ? 'Sanction letter generated' : 'Application rejected',
    status: 'success',
    metadata: { 
      sanction_status: finalStatus,
      sanction_letter_url: eligible ? '/documents/sanction_letter.pdf' : null,
    },
  });

  await supabase.from('loan_applications').update({
    status: finalStatus,
  }).eq('id', loanId);
}