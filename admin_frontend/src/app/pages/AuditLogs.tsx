import { useEffect, useState } from 'react';
import { Card } from '../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { format } from 'date-fns';
import { adminApi } from '../lib/axios';

export default function AuditLogs() {
  const [actionFilter, setActionFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = { page, limit };
      if (actionFilter !== 'all') params.action = actionFilter;
      const res = await adminApi.get('/admin/audit', { params, signal });
      const data = res.data || {};
      const items = Array.isArray(data.items) ? data.items : (Array.isArray(data) ? data : []);
      setRows(items);
      setTotal(typeof data.total === 'number' ? data.total : items.length);
    } catch (e: any) {
      const msg = e?.response?.data?.error?.message || e?.message || 'Failed to load audit logs';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchLogs(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, actionFilter]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
        <p className="text-sm text-gray-600">
          Track all administrative actions and system changes
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-64">
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="TICKET_ASSIGNED">TICKET_ASSIGNED</SelectItem>
                <SelectItem value="TICKET_STATUS_UPDATED">TICKET_STATUS_UPDATED</SelectItem>
                <SelectItem value="ANALYTICS_VIEWED">ANALYTICS_VIEWED</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Logs Table */}
      <Card>
        <div className="overflow-x-auto">
          {loading && <div className="p-6 text-center text-gray-500">Loading logs...</div>}
          {error && !loading && <div className="p-6 text-center text-red-600">{error}</div>}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!loading && !error && rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No audit logs found
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((log) => (
                  <TableRow key={log.id} className="hover:bg-gray-50">
                    <TableCell className="text-sm">
                      {format(new Date(log.created_at || log.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {log.actor_id} ({log.actor_role})
                    </TableCell>
                    <TableCell className="font-mono text-xs">{log.action}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {log.entity_type}/{log.entity_id ?? '-'}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-gray-600">
                      {log.ip_address || log.ip || '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {!loading && !error && rows.length > 0 && (
            <div className="flex items-center justify-between p-4">
              <button
                className="text-sm text-blue-600 disabled:text-gray-400"
                disabled={page <= 1}
                onClick={() => setPage(Math.max(1, page - 1))}
              >
                Previous
              </button>
              <div className="text-sm text-gray-600">
                Page {page} of {Math.max(1, Math.ceil(total / limit))}
              </div>
              <button
                className="text-sm text-blue-600 disabled:text-gray-400"
                disabled={page >= Math.max(1, Math.ceil(total / limit))}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
