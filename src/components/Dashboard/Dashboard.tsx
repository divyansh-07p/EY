import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { LoanApplication, AgentActivity } from '../../types';
import {
  Clock,
  CheckCircle,
  Activity,
  DollarSign,
  BarChart3,
} from 'lucide-react';
import ApplicationCard from './ApplicationCard';
import AgentTimeline from './AgentTimeline';
import StatsCard from './StatsCard';

export default function Dashboard() {
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [activities, setActivities] = useState<AgentActivity[]>([]);
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();

  useEffect(() => {
    loadApplications();
    const subscription = supabase
      .channel('loan_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'loan_applications',
          filter: `user_id=eq.${user?.id}`,
        },
        () => {
          loadApplications();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  useEffect(() => {
    if (selectedApp) {
      loadActivities(selectedApp);
      const activitySub = supabase
        .channel('activity_updates')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'agent_activities',
            filter: `loan_application_id=eq.${selectedApp}`,
          },
          () => {
            loadActivities(selectedApp);
          }
        )
        .subscribe();

      return () => {
        activitySub.unsubscribe();
      };
    }
  }, [selectedApp]);

  const loadApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('loan_applications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
      if (data && data.length > 0 && !selectedApp) {
        setSelectedApp(data[0].id);
      }
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadActivities = async (appId: string) => {
    try {
      const { data, error } = await supabase
        .from('agent_activities')
        .select('*')
        .eq('loan_application_id', appId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error loading activities:', error);
    }
  };

  const stats = {
    total: applications.length,
    pending: applications.filter((a) =>
      ['initiated', 'kyc_pending', 'verification_complete', 'underwriting'].includes(a.status)
    ).length,
    approved: applications.filter((a) => a.status === 'sanctioned').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
    totalAmount: applications
      .filter((a) => a.status === 'sanctioned')
      .reduce((sum, a) => sum + a.amount, 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {profile?.full_name}!
          </h1>
          <p className="text-gray-600 mt-1">Here's an overview of your loan applications</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Applications"
          value={stats.total}
          icon={BarChart3}
          color="blue"
        />
        <StatsCard
          title="In Progress"
          value={stats.pending}
          icon={Clock}
          color="yellow"
        />
        <StatsCard
          title="Approved"
          value={stats.approved}
          icon={CheckCircle}
          color="green"
        />
        <StatsCard
          title="Total Sanctioned"
          value={`₹${(stats.totalAmount / 100000).toFixed(1)}L`}
          icon={DollarSign}
          color="cyan"
        />
      </div>

      {applications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Applications Yet
          </h3>
          <p className="text-gray-600">
            Start a conversation with our AI assistant to apply for a loan!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Your Applications</h2>
            {applications.map((app) => (
              <ApplicationCard
                key={app.id}
                application={app}
                isSelected={selectedApp === app.id}
                onClick={() => setSelectedApp(app.id)}
              />
            ))}
          </div>

          <div className="lg:col-span-2">
            {selectedApp && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  AI Agent Activity Timeline
                </h2>
                <AgentTimeline activities={activities} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
