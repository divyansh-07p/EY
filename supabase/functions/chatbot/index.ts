import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface ChatMessage {
  message: string;
  context?: any;
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

    const { message, context }: ChatMessage = await req.json();

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    const response = await generateResponse(message, profile, context);

    await supabase.from('analytics_events').insert({
      user_id: user.id,
      event_type: 'chat_interaction',
      event_data: { message, response },
    });

    return new Response(JSON.stringify({ 
      response,
      timestamp: new Date().toISOString(),
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

function generateResponse(message: string, profile: any, context: any): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('loan') && (lowerMessage.includes('apply') || lowerMessage.includes('need'))) {
    return `Hello${profile?.full_name ? ' ' + profile.full_name : ''}! I can help you apply for a personal loan. Our AI-powered system can approve loans up to ₹50 lakhs with instant processing. What amount are you looking for?`;
  }

  if (lowerMessage.includes('interest') || lowerMessage.includes('rate')) {
    return 'Our interest rates start from 10.5% per annum and vary based on your credit profile. The rates are highly competitive and transparent. Would you like to check your eligibility?';
  }

  if (lowerMessage.includes('document') || lowerMessage.includes('require')) {
    return 'You will need: PAN card, Aadhaar card, and last 3 months salary slips. Our AI agents will verify these documents instantly through secure APIs.';
  }

  if (lowerMessage.includes('time') || lowerMessage.includes('fast') || lowerMessage.includes('quick')) {
    return 'With our AI-powered system, loan approvals happen in under 10 minutes! Our worker agents handle verification, underwriting, and sanction simultaneously.';
  }

  if (lowerMessage.includes('eligib')) {
    if (profile?.monthly_income) {
      const maxAmount = profile.monthly_income * 60;
      return `Based on your monthly income of ₹${profile.monthly_income.toLocaleString()}, you are eligible for loans up to ₹${maxAmount.toLocaleString()}. Would you like to apply now?`;
    }
    return 'To check eligibility, I need some information. Generally, you can get a loan up to 60 times your monthly income. Shall we start your application?';
  }

  if (lowerMessage.includes('status') || lowerMessage.includes('track')) {
    return 'You can track your application status in real-time on your dashboard. Our AI agents update the status at each stage: Sales → Verification → Underwriting → Sanction.';
  }

  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return `Hello${profile?.full_name ? ' ' + profile.full_name : ''}! I'm your AI loan assistant powered by advanced agentic AI. I can help you with personal loans from ₹50,000 to ₹50,00,000. How can I assist you today?`;
  }

  if (lowerMessage.includes('thank')) {
    return 'You\'re welcome! I\'m here 24/7 to help you with your loan needs. Feel free to ask anything else!';
  }

  return 'I\'m here to help you with personal loans. You can ask me about loan amounts, interest rates, eligibility, required documents, or start a new application. What would you like to know?';
}