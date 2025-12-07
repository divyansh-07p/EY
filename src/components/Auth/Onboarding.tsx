import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Briefcase, DollarSign, CreditCard, Phone } from 'lucide-react';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { updateProfile, profile } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await updateProfile({
        phone,
        employment_type: employmentType,
        monthly_income: parseFloat(monthlyIncome),
        pan_number: panNumber.toUpperCase(),
        onboarding_complete: true,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && (!phone || phone.length !== 10)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    if (step === 2 && !employmentType) {
      setError('Please select employment type');
      return;
    }
    if (step === 3 && (!monthlyIncome || parseFloat(monthlyIncome) <= 0)) {
      setError('Please enter a valid monthly income');
      return;
    }
    setError('');
    setStep(step + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {profile?.full_name}!
          </h1>
          <p className="text-gray-600">Let's set up your profile to get you the best loan offers</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    i <= step
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {i}
                </div>
                {i < 4 && (
                  <div
                    className={`w-12 md:w-24 h-1 mx-2 transition-all ${
                      i < step ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="text-center mb-6">
                <Phone className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                <h2 className="text-2xl font-bold text-gray-900">Contact Information</h2>
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="10-digit mobile number"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="text-center mb-6">
                <Briefcase className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                <h2 className="text-2xl font-bold text-gray-900">Employment Details</h2>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Employment Type
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {['Salaried', 'Self-Employed', 'Business Owner', 'Professional'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setEmploymentType(type)}
                      className={`p-4 border-2 rounded-lg font-medium transition-all ${
                        employmentType === type
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="text-center mb-6">
                <DollarSign className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                <h2 className="text-2xl font-bold text-gray-900">Income Information</h2>
              </div>
              <div>
                <label htmlFor="income" className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Income (in Rupees)
                </label>
                <input
                  id="income"
                  type="number"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="e.g., 50000"
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="text-center mb-6">
                <CreditCard className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                <h2 className="text-2xl font-bold text-gray-900">Identity Verification</h2>
              </div>
              <div>
                <label htmlFor="pan" className="block text-sm font-medium text-gray-700 mb-2">
                  PAN Number
                </label>
                <input
                  id="pan"
                  type="text"
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value.toUpperCase().slice(0, 10))}
                  required
                  pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all uppercase"
                  placeholder="ABCDE1234F"
                />
                <p className="mt-2 text-sm text-gray-500">Format: ABCDE1234F</p>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all"
              >
                Back
              </button>
            )}
            {step < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-[1.02]"
              >
                Continue
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02]"
              >
                {loading ? 'Completing...' : 'Complete Setup'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
