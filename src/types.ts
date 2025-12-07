export interface UserProfile {
  id: string;
  full_name: string;
  phone?: string;
  pan_number?: string;
  aadhaar_number?: string;
  employment_type?: string;
  monthly_income?: number;
  onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoanApplication {
  id: string;
  user_id: string;
  amount: number;
  purpose: string;
  tenure_months: number;
  status: 'initiated' | 'kyc_pending' | 'verification_complete' | 'underwriting' | 'sanctioned' | 'rejected';
  credit_score?: number;
  eligibility_result?: {
    eligible: boolean;
    max_amount: number;
    recommended_tenure: number;
  };
  created_at: string;
  updated_at: string;
}

export interface AgentActivity {
  id: string;
  loan_application_id: string;
  agent_type: 'master' | 'sales' | 'verification' | 'underwriting' | 'sanction';
  action: string;
  status: 'pending' | 'success' | 'failed';
  metadata: Record<string, any>;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface AnalyticsEvent {
  id: string;
  user_id?: string;
  event_type: string;
  event_data: Record<string, any>;
  created_at: string;
}
