import { LoanApplication } from '../../types';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ApplicationCardProps {
  application: LoanApplication;
  isSelected: boolean;
  onClick: () => void;
}

export default function ApplicationCard({ application, isSelected, onClick }: ApplicationCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sanctioned':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'underwriting':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sanctioned':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'underwriting':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatStatus = (status: string) => {
    return status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border-2 transition-all transform hover:scale-[1.02] ${
        isSelected
          ? 'border-blue-500 bg-blue-50 shadow-lg'
          : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 text-lg">
            ₹{application.amount.toLocaleString()}
          </h3>
          <p className="text-sm text-gray-600">{application.purpose}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(application.status)}`}>
          {getStatusIcon(application.status)}
          {formatStatus(application.status)}
        </span>
      </div>

      <div className="space-y-1 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Tenure:</span>
          <span className="font-medium">{application.tenure_months} months</span>
        </div>
        {application.credit_score && (
          <div className="flex justify-between">
            <span>Credit Score:</span>
            <span className={`font-medium ${application.credit_score >= 700 ? 'text-green-600' : 'text-yellow-600'}`}>
              {application.credit_score}
            </span>
          </div>
        )}
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Applied:</span>
          <span>{new Date(application.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    </button>
  );
}
