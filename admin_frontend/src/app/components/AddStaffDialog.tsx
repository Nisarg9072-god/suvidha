import { useState } from 'react';
import { adminApi } from '../lib/axios';
import { Button } from './ui/button';
import { Input } from './ui/input';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { toast } from 'sonner';

export default function AddStaffDialog({ trigger, onAdded }: { trigger: React.ReactNode, onAdded?: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [departmentCode, setDepartmentCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!phone) { setError('Phone required'); return; }
    setLoading(true);
    setError(null);
    try {
      await adminApi.post('/admin/staff', { name, phone, departmentCode });
      toast.success('Staff created');
      setOpen(false);
      onAdded?.();
    } catch (e: any) {
      const msg = e?.response?.data?.error?.message || e?.message || 'Failed to create staff';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Trigger asChild>{trigger}</AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/20" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] bg-white rounded-lg shadow-lg p-6 space-y-4">
          <AlertDialog.Title className="text-lg font-semibold">Add Staff</AlertDialog.Title>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-600">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Optional" />
            </div>
            <div>
              <label className="text-xs text-gray-600">Phone</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91XXXXXXXXXX or 10-digit" />
            </div>
            <div>
              <label className="text-xs text-gray-600">Department Code (GAS/ELEC/MUNI)</label>
              <Input value={departmentCode} onChange={(e) => setDepartmentCode(e.target.value)} placeholder="Optional" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <AlertDialog.Cancel asChild>
              <Button variant="outline">Cancel</Button>
            </AlertDialog.Cancel>
            <Button onClick={submit} disabled={loading || !phone}>
              {loading ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
