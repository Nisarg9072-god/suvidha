import { useEffect, useState } from 'react';
import { adminApi } from '../lib/axios';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import * as AlertDialog from '@radix-ui/react-alert-dialog';

export default function AssignDialog({ ticketId, onAssigned, trigger }: { ticketId: number, onAssigned?: () => void, trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [staff, setStaff] = useState<Array<{ id: number, name?: string, phone?: string }>>([]);
  const [selected, setSelected] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    (async () => {
      setError(null);
      try {
        const res = await adminApi.get('/admin/staff');
        const rows = Array.isArray(res.data?.items) ? res.data.items : (Array.isArray(res.data) ? res.data : []);
        setStaff(rows.map((r: any) => ({ id: r.id, name: r.name, phone: r.phone })));
      } catch (e: any) {
        const msg = e?.response?.data?.error?.message || e?.message || 'Failed to load staff';
        setError(msg);
      }
    })();
  }, [open]);

  const assign = async () => {
    if (!selected) return;
    setLoading(true);
    setError(null);
    try {
      await adminApi.patch(`/admin/tickets/${ticketId}/assign`, { assigned_to: parseInt(selected, 10) });
      setOpen(false);
      onAssigned?.();
    } catch (e: any) {
      const msg = e?.response?.data?.error?.message || e?.message || 'Failed to assign ticket';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Trigger asChild>
        {trigger}
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/20" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] bg-white rounded-lg shadow-lg p-6 space-y-4">
          <AlertDialog.Title className="text-lg font-semibold">Assign Ticket #{ticketId}</AlertDialog.Title>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Select Staff</label>
            <Select value={selected} onValueChange={setSelected}>
              <SelectTrigger>
                <SelectValue placeholder="Choose staff" />
              </SelectTrigger>
              <SelectContent>
                {staff.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.name || s.phone || `Staff #${s.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <AlertDialog.Cancel asChild>
              <Button variant="outline">Cancel</Button>
            </AlertDialog.Cancel>
            <Button onClick={assign} disabled={!selected || loading}>
              {loading ? 'Assigning...' : 'Assign'}
            </Button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
