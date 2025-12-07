import { User, Mail, Briefcase, Phone, MapPin, BadgeCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Profile() {
  const { profile } = useAuth();

  // Safely access extra fields (if they exist in your profile table)
  const email = (profile as any)?.email;
  const phone = (profile as any)?.phone;
  const address = (profile as any)?.address;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 sm:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-md">
            <User className="w-9 h-9 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold tracking-widest text-blue-500 uppercase">
              Customer Profile
            </p>
            <h2 className="text-2xl font-bold text-slate-900">
              {profile?.full_name || 'Your Name'}
            </h2>
            <p className="text-sm text-slate-500">
              {profile?.employment_type || 'Employment type not set'}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-start sm:items-end gap-1 text-xs text-slate-500">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700 border border-emerald-100">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Profile Active
          </span>
          <span>
            Customer ID:{' '}
            <span className="font-semibold text-slate-800">
              {profile?.id || 'Not available'}
            </span>
          </span>
        </div>
      </div>

      {/* Details grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Email */}
        <div className="border border-slate-100 rounded-2xl p-4 flex items-start gap-3 bg-slate-50/60">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Mail className="w-5 h-5 text-blue-600" />
          </div>
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-wide text-slate-400">
              Email
            </p>
            <p className="text-sm font-medium text-slate-900 break-all">
              {email || 'Not available'}
            </p>
          </div>
        </div>

        {/* Employment Type */}
        <div className="border border-slate-100 rounded-2xl p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-blue-600" />
          </div>
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-wide text-slate-400">
              Employment Type
            </p>
            <p className="text-sm font-medium text-slate-900">
              {profile?.employment_type || 'Not set'}
            </p>
          </div>
        </div>

        {/* Phone */}
        <div className="border border-slate-100 rounded-2xl p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Phone className="w-5 h-5 text-blue-600" />
          </div>
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-wide text-slate-400">
              Phone
            </p>
            <p className="text-sm font-medium text-slate-900">
              {phone || 'Not added'}
            </p>
          </div>
        </div>

        {/* Address */}
        <div className="border border-slate-100 rounded-2xl p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-blue-600" />
          </div>
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-wide text-slate-400">
              Address
            </p>
            <p className="text-sm font-medium text-slate-900 whitespace-pre-line">
              {address || 'Not provided'}
            </p>
          </div>
        </div>
      </div>

      {/* Meta / badges */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-slate-100">
        <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1 border border-slate-100">
            <BadgeCheck className="w-3 h-3" />
            <span>KYC linked to this profile</span>
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1 border border-slate-100">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            <span>Eligible for AI loan assistance</span>
          </span>
        </div>

        <div className="text-[11px] text-slate-400">
          Last updated:{' '}
          {profile?.updated_at
            ? new Date(profile.updated_at).toLocaleString()
            : 'N/A'}
        </div>
      </div>
    </div>
  );
}
