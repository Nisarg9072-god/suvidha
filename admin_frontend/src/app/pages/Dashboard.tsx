import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Ticket, AlertTriangle, Clock, CheckCircle2, TrendingUp, Activity } from 'lucide-react';
import { Card } from '../components/ui/card';
import { ScrollArea } from '../components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { adminApi } from '../lib/axios';

export default function Dashboard() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await adminApi.get('/analytics/overview');
        setOverview(res.data || null);
      } catch (e:any) {
        const msg = e?.response?.data?.error?.message || e?.message || 'Failed to load overview';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const kpiData = [
    {
      title: 'Total Tickets',
      value: 128,
      icon: Ticket,
      color: 'bg-blue-500',
      filter: '',
    },
    {
      title: 'Open',
      value: 24,
      icon: AlertTriangle,
      color: 'bg-yellow-500',
      filter: 'status=open',
    },
    {
      title: 'In Progress',
      value: 31,
      icon: Activity,
      color: 'bg-purple-500',
      filter: 'status=progress',
    },
    {
      title: 'Emergency',
      value: 5,
      icon: AlertTriangle,
      color: 'bg-red-500',
      filter: 'priority=emergency',
    },
    {
      title: 'Overdue',
      value: 7,
      icon: Clock,
      color: 'bg-orange-500',
      filter: 'overdue=true',
    },
    {
      title: 'Resolved Today',
      value: 12,
      icon: CheckCircle2,
      color: 'bg-green-500',
      filter: 'resolved=today',
    },
  ];

  const departmentData = [
    { name: 'Water', value: 32 },
    { name: 'Roads', value: 27 },
    { name: 'Sanitation', value: 19 },
    { name: 'Electricity', value: 24 },
    { name: 'Other', value: 26 },
  ];

  const statusData = [
    { name: 'Open', value: overview?.totals?.open ?? 0, color: '#eab308' },
    { name: 'In Progress', value: overview?.totals?.in_progress ?? 0, color: '#a855f7' },
    { name: 'Resolved', value: overview?.totals?.resolved ?? 0, color: '#22c55e' },
    { name: 'Rejected', value: overview?.totals?.rejected ?? 0, color: '#ef4444' },
  ];

  const monthlyTrend = [
    { month: 'Jan', tickets: 145, resolved: 132 },
    { month: 'Feb', tickets: 128, resolved: 119 },
    { month: 'Mar', tickets: 156, resolved: 148 },
    { month: 'Apr', tickets: 142, resolved: 138 },
    { month: 'May', tickets: 168, resolved: 155 },
    { month: 'Jun', tickets: 134, resolved: 128 },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-600">Real-time system overview and metrics</p>
      </div>

      {/* KPI Cards */}
      <Card className="p-4">
        {loading && <div className="text-center text-gray-500">Loading metrics...</div>}
        {error && !loading && <div className="text-center text-red-600">{error}</div>}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="p-3 bg-gray-50 rounded">
              <p className="text-xs text-gray-600">Total Tickets</p>
              <p className="text-2xl font-bold text-gray-900">{overview?.totals?.tickets_total ?? '-'}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded cursor-pointer" onClick={() => navigate('/tickets?status=open')}>
              <p className="text-xs text-gray-600">Open</p>
              <p className="text-2xl font-bold text-gray-900">{overview?.totals?.open ?? '-'}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded cursor-pointer" onClick={() => navigate('/tickets?status=in_progress')}>
              <p className="text-xs text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">{overview?.totals?.in_progress ?? '-'}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded cursor-pointer" onClick={() => navigate('/tickets?status=resolved')}>
              <p className="text-xs text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-gray-900">{overview?.totals?.resolved ?? '-'}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded cursor-pointer" onClick={() => navigate('/tickets?priority=emergency')}>
              <p className="text-xs text-gray-600">Emergency</p>
              <p className="text-2xl font-bold text-gray-900">{overview?.totals?.emergency_count ?? '-'}</p>
            </div>
          </div>
        )}
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Distribution */}
        <Card className="p-4 lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Department Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={departmentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Status Breakdown */}
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Status Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend */}
        <Card className="p-4 lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Monthly Trend
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="tickets"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="resolved"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* SLA Compliance */}
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            SLA Compliance
          </h3>
          <div className="flex flex-col items-center justify-center h-64">
            <div className="relative">
              <svg className="w-40 h-40">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="12"
                  strokeDasharray={`${2 * Math.PI * 70 * 0.86} ${2 * Math.PI * 70}`}
                  strokeLinecap="round"
                  transform="rotate(-90 80 80)"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900">
                    {overview?.totals?.sla_compliance_percent ?? '--'}%
                  </p>
                  <p className="text-xs text-gray-600">Compliance</p>
                </div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-green-600">{overview?.totals?.sla_within ?? '-'}</span> tickets within SLA
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-red-600">{overview?.totals?.sla_breached_count ?? '-'}</span> SLA breaches
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Live Activity Feed */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Live Activity Feed</h3>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </div>
        <ScrollArea className="h-72">
          <div className="space-y-3 text-center text-sm text-gray-500">No live feed available</div>
        </ScrollArea>
      </Card>
    </div>
  );
}
