import { AgentActivity } from '../../types';
import { Bot, CheckCircle, Clock, XCircle } from 'lucide-react';

interface AgentTimelineProps {
  activities: AgentActivity[];
}

export default function AgentTimeline({ activities }: AgentTimelineProps) {
  const getAgentColor = (agentType: string) => {
    switch (agentType) {
      case 'master':
        return 'from-purple-500 to-pink-500';
      case 'sales':
        return 'from-blue-500 to-cyan-500';
      case 'verification':
        return 'from-green-500 to-emerald-500';
      case 'underwriting':
        return 'from-yellow-500 to-orange-500';
      case 'sanction':
        return 'from-red-500 to-rose-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getAgentName = (agentType: string) => {
    return agentType.charAt(0).toUpperCase() + agentType.slice(1) + ' Agent';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4" />;
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (activities.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No agent activities yet. Processing will begin shortly...</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-cyan-200 to-transparent"></div>

      <div className="space-y-6">
        {activities.map((activity, index) => (
          <div key={activity.id} className="relative flex gap-4 animate-fadeIn" style={{ animationDelay: `${index * 100}ms` }}>
            <div className={`flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br ${getAgentColor(activity.agent_type)} flex items-center justify-center shadow-lg z-10`}>
              <Bot className="w-6 h-6 text-white" />
            </div>

            <div className="flex-1 bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {getAgentName(activity.agent_type)}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{activity.action}</p>
                </div>
                <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  activity.status === 'success'
                    ? 'bg-green-100 text-green-700'
                    : activity.status === 'failed'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {getStatusIcon(activity.status)}
                  {activity.status}
                </span>
              </div>

              {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(activity.metadata).map(([key, value]) => {
                      if (typeof value === 'object') return null;
                      return (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-600 capitalize">
                            {key.replace(/_/g, ' ')}:
                          </span>
                          <span className="font-medium text-gray-900">
                            {typeof value === 'number' && key.includes('rate')
                              ? `${value.toFixed(2)}%`
                              : typeof value === 'number' && key.includes('amount')
                              ? `₹${value.toLocaleString()}`
                              : typeof value === 'boolean'
                              ? value ? '✓' : '✗'
                              : value}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mt-2 text-xs text-gray-500">
                {new Date(activity.created_at).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
