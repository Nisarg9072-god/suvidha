import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '../components/ui/card';
import { useEffect, useState } from 'react';
import { adminApi } from '../lib/axios';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function Analytics() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<any | null>(null);
  const [areas, setAreas] = useState<Array<{ area: string; complaints: number }>>([]);
  const [hotspots, setHotspots] = useState<Array<{ name: string; count: number }>>([]);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [ov, ar, hs] = await Promise.all([
          adminApi.get('/analytics/overview', { signal: controller.signal }),
          adminApi.get('/analytics/areas', { signal: controller.signal }),
          adminApi.get('/analytics/hotspots', { signal: controller.signal }),
        ]);
        if (mounted) setOverview(ov.data || null);
        const areasData = Array.isArray(ar.data?.items)
          ? ar.data.items
          : Array.isArray(ar.data)
          ? ar.data
          : [];
        if (mounted) setAreas(
          areasData.map((x: any) => ({
            area: x.area || x.name || 'N/A',
            complaints: x.count ?? x.complaints ?? 0,
          }))
        );
        const hsData = Array.isArray(hs.data?.items)
          ? hs.data.items
          : Array.isArray(hs.data)
          ? hs.data
          : [];
        if (mounted) setHotspots(
          hsData.map((x: any) => ({
            name: x.name || x.area || 'N/A',
            count: x.count ?? 0,
          }))
        );
      } catch (e: any) {
        const msg = e?.response?.data?.error?.message || e?.message || 'Failed to load analytics';
        if (mounted) setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-600">Data insights and performance metrics</p>
      </div>
      <Card className="p-4">
        {loading && <div className="text-center text-gray-500">Loading analytics...</div>}
        {error && !loading && <div className="text-center text-red-600">{error}</div>}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-600">Total Tickets</p>
              <p className="text-2xl font-bold text-gray-900">{overview?.totals?.tickets_total ?? '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Open</p>
              <p className="text-2xl font-bold text-gray-900">{overview?.totals?.open ?? '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">{overview?.totals?.in_progress ?? '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-gray-900">{overview?.totals?.resolved ?? '-'}</p>
            </div>
          </div>
        )}
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Avg Resolution Time</p>
              <p className="text-2xl font-bold text-gray-900">4.4h</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingDown className="h-3 w-3 text-green-600" />
                <span className="text-xs text-green-600">12% faster</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div>
            <p className="text-xs text-gray-600">Resolution Rate</p>
            <p className="text-2xl font-bold text-gray-900">93%</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600">+3% this month</span>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div>
            <p className="text-xs text-gray-600">Citizen Satisfaction</p>
            <p className="text-2xl font-bold text-gray-900">4.6/5</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600">+0.2 pts</span>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div>
            <p className="text-xs text-gray-600">Staff Utilization</p>
            <p className="text-2xl font-bold text-gray-900">87%</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-orange-600" />
              <span className="text-xs text-orange-600">+5% usage</span>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Area Complaint Comparison</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={areas}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="area" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="complaints" name="Complaints" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Hotspots</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={hotspots}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="count" name="Count" stroke="#ef4444" />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
