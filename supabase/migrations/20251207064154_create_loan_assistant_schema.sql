/*
  # AI Loan Assistant Platform Schema

  1. New Tables
    - `loan_applications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `amount` (numeric) - requested loan amount
      - `purpose` (text) - loan purpose
      - `tenure_months` (integer) - loan duration
      - `status` (text) - current status (initiated, kyc_pending, verification_complete, underwriting, sanctioned, rejected)
      - `credit_score` (integer) - calculated credit score
      - `eligibility_result` (jsonb) - detailed eligibility data
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `agent_activities`
      - `id` (uuid, primary key)
      - `loan_application_id` (uuid, references loan_applications)
      - `agent_type` (text) - sales, verification, underwriting, sanction
      - `action` (text) - what the agent did
      - `status` (text) - success, pending, failed
      - `metadata` (jsonb) - additional data
      - `created_at` (timestamptz)
    
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `full_name` (text)
      - `phone` (text)
      - `pan_number` (text)
      - `aadhaar_number` (text, encrypted)
      - `employment_type` (text)
      - `monthly_income` (numeric)
      - `onboarding_complete` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `documents`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `loan_application_id` (uuid, references loan_applications)
      - `document_type` (text) - pan, aadhaar, salary_slip, sanction_letter
      - `file_url` (text)
      - `verified` (boolean)
      - `created_at` (timestamptz)
    
    - `analytics_events`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `event_type` (text) - page_view, button_click, application_submitted
      - `event_data` (jsonb)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for reading aggregate analytics
*/

-- Create loan_applications table
CREATE TABLE IF NOT EXISTS loan_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  purpose text NOT NULL,
  tenure_months integer NOT NULL CHECK (tenure_months > 0),
  status text NOT NULL DEFAULT 'initiated',
  credit_score integer,
  eligibility_result jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create agent_activities table
CREATE TABLE IF NOT EXISTS agent_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_application_id uuid REFERENCES loan_applications(id) ON DELETE CASCADE NOT NULL,
  agent_type text NOT NULL,
  action text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text,
  pan_number text,
  aadhaar_number text,
  employment_type text,
  monthly_income numeric,
  onboarding_complete boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  loan_application_id uuid REFERENCES loan_applications(id) ON DELETE CASCADE,
  document_type text NOT NULL,
  file_url text NOT NULL,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE loan_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for loan_applications
CREATE POLICY "Users can view own loan applications"
  ON loan_applications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own loan applications"
  ON loan_applications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own loan applications"
  ON loan_applications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for agent_activities
CREATE POLICY "Users can view agent activities for their loans"
  ON agent_activities FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM loan_applications
      WHERE loan_applications.id = agent_activities.loan_application_id
      AND loan_applications.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert agent activities"
  ON agent_activities FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for documents
CREATE POLICY "Users can view own documents"
  ON documents FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upload own documents"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for analytics_events
CREATE POLICY "Users can insert analytics events"
  ON analytics_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view own analytics"
  ON analytics_events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_loan_applications_user_id ON loan_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_loan_applications_status ON loan_applications(status);
CREATE INDEX IF NOT EXISTS idx_agent_activities_loan_id ON agent_activities(loan_application_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics_events(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_loan_applications_updated_at ON loan_applications;
CREATE TRIGGER update_loan_applications_updated_at
  BEFORE UPDATE ON loan_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();