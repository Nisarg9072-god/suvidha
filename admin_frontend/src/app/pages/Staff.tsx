import { useEffect, useState } from 'react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { adminApi } from '../lib/axios';
import { Button } from '../components/ui/button';
import AddStaffDialog from '../components/AddStaffDialog';

export default function Staff() {
  const [rows, setRows] = useState<Array<{id:number, name:string, phone:string, department_id:number|null, active:boolean}>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await adminApi.get('/admin/staff', { signal: controller.signal });
        const data = res.data;
        if (!mounted) return;
        if (Array.isArray(data)) setRows(data);
        else if (Array.isArray(data?.items)) setRows(data.items);
        else setRows([]);
      } catch (e: any) {
        const msg = e?.response?.data?.error?.message || e?.message || 'Failed to load staff';
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

  const getAvailabilityBadge = (availability: string) => {
    const styles = {
      Available: 'bg-green-100 text-green-800',
      Busy: 'bg-orange-100 text-orange-800',
      Offline: 'bg-gray-100 text-gray-800',
    };
    return (
      <Badge className={styles[availability as keyof typeof styles]}>
        {availability}
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Staff Control</h1>
        <p className="text-sm text-gray-600">Monitor staff performance and assignments</p>
      </div>
      <div className="flex justify-end">
        <AddStaffDialog
          onAdded={() => {
            (async () => {
              try {
                const res = await adminApi.get('/admin/staff');
                const data = res.data;
                if (Array.isArray(data)) setRows(data);
                else if (Array.isArray(data?.items)) setRows(data.items);
              } catch {}
            })();
          }}
          trigger={<Button variant="outline">Add Staff</Button>}
        />
      </div>

      {/* Staff Table */}
      <Card>
        <div className="overflow-x-auto">
          {loading && <div className="p-6 text-center text-gray-500">Loading staff...</div>}
          {error && !loading && <div className="p-6 text-center text-red-600">{error}</div>}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Department ID</TableHead>
                <TableHead>Active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!loading && !error && rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No staff members found
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-sm">{s.id}</TableCell>
                    <TableCell className="font-semibold">{s.name}</TableCell>
                    <TableCell className="font-mono text-sm">{s.phone}</TableCell>
                    <TableCell className="font-mono text-sm">{s.department_id ?? '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{s.active ? 'Yes' : 'No'}</Badge>
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
