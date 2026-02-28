import { useEffect, useState } from 'react';
import { Card } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Button } from '../components/ui/button';
import { adminApi } from '../lib/axios';
import { format } from 'date-fns';

export default function Sessions() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.get('/admin/sessions');
      const items = Array.isArray(res.data?.items) ? res.data.items : (Array.isArray(res.data) ? res.data : []);
      setRows(items);
    } catch (e:any) {
      const msg = e?.response?.data?.error?.message || e?.message || 'Failed to load sessions';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const revoke = async (id: number) => {
    try {
      await adminApi.patch(`/admin/sessions/${id}/revoke`);
      setRows((prev) => prev.map((r) => r.id === id ? { ...r, revoked: true, revoked_at: new Date().toISOString(), revoked_by: 'me' } : r));
    } catch (e:any) {
      const msg = e?.response?.data?.error?.message || e?.message || 'Failed to revoke';
      setError(msg);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Active Sessions</h1>
          <p className="text-sm text-gray-600">View and revoke user tokens</p>
        </div>
        <Button variant="outline" onClick={load}>Refresh</Button>
      </div>
      <Card>
        <div className="overflow-x-auto">
          {loading && <div className="p-6 text-center text-gray-500">Loading sessions...</div>}
          {error && !loading && <div className="p-6 text-center text-red-600">{error}</div>}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Issued</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Revoked</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!loading && !error && rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No sessions found
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-sm">{s.id}</TableCell>
                    <TableCell className="font-mono text-sm">{s.user_id}</TableCell>
                    <TableCell>{s.role}</TableCell>
                    <TableCell className="text-sm">{s.issued_at ? format(new Date(s.issued_at), 'MMM dd, yyyy HH:mm') : ''}</TableCell>
                    <TableCell className="text-sm">{s.expires_at ? format(new Date(s.expires_at), 'MMM dd, yyyy HH:mm') : ''}</TableCell>
                    <TableCell>{s.revoked ? 'Yes' : 'No'}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" disabled={s.revoked} onClick={() => revoke(s.id)}>
                        Revoke
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
