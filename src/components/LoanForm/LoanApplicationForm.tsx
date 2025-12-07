import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { DollarSign, Calendar, FileText, Loader2, CheckCircle } from 'lucide-react';

export default function LoanApplicationForm() {
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [tenure, setTenure] = useState('12');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { profile } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-loan-application`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: parseFloat(amount),
            purpose,
            tenure_months: parseInt(tenure),
            user_data: {
              monthly_income: profile?.monthly_income || 50000,
              employment_type: profile?.employment_type || 'Salaried',
              pan_number: profile?.pan_number,
            },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application');
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setAmount('');
        setPurpose('');
        setTenure('12');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const maxEligibleAmount = (profile?.monthly_income || 50000) * 60;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Apply for Personal Loan</h2>
        <p className="text-gray-600">
          Fill out the form below and our AI agents will process your application instantly
        </p>
        {profile?.monthly_income && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              Based on your income, you're eligible for loans up to{' '}
              <span className="font-bold">₹{maxEligibleAmount.toLocaleString()}</span>
            </p>
          </div>
        )}
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 animate-fadeIn">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <div>
            <p className="font-semibold text-green-900">Application Submitted Successfully!</p>
            <p className="text-sm text-green-700">Our AI agents are processing your request.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
            Loan Amount (₹)
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="50000"
              max={maxEligibleAmount}
              step="1000"
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter amount (min ₹50,000)"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">Minimum: ₹50,000 | Maximum: ₹{maxEligibleAmount.toLocaleString()}</p>
        </div>

        <div>
          <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-2">
            Loan Purpose
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <select
              id="purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              required
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
            >
              <option value="">Select purpose</option>
              <option value="Home Renovation">Home Renovation</option>
              <option value="Wedding">Wedding</option>
              <option value="Education">Education</option>
              <option value="Medical Emergency">Medical Emergency</option>
              <option value="Debt Consolidation">Debt Consolidation</option>
              <option value="Business Expansion">Business Expansion</option>
              <option value="Travel">Travel</option>
              <option value="Vehicle Purchase">Vehicle Purchase</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="tenure" className="block text-sm font-medium text-gray-700 mb-2">
            Loan Tenure
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              id="tenure"
              value={tenure}
              onChange={(e) => setTenure(e.target.value)}
              required
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
            >
              <option value="6">6 months</option>
              <option value="12">12 months</option>
              <option value="18">18 months</option>
              <option value="24">24 months</option>
              <option value="36">36 months</option>
              <option value="48">48 months</option>
              <option value="60">60 months</option>
            </select>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <h3 className="font-semibold text-gray-900">Estimated EMI</h3>
          {amount && (
            <p className="text-2xl font-bold text-blue-600">
              ₹{Math.round((parseFloat(amount) * (1 + 0.105 * parseInt(tenure) / 12)) / parseInt(tenure)).toLocaleString()}
              <span className="text-sm text-gray-600 font-normal">/month</span>
            </p>
          )}
          <p className="text-xs text-gray-500">
            * Estimated at 10.5% interest rate. Actual rate may vary based on credit profile.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing Application...
            </>
          ) : (
            'Submit Application'
          )}
        </button>

        <p className="text-xs text-gray-500 text-center">
          By submitting, you agree to our terms and conditions. Your data is secure and encrypted.
        </p>
      </form>
    </div>
  );
}
