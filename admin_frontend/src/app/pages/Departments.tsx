import { useEffect, useState } from 'react';
import { Card } from '../components/ui/card';
import { adminApi } from '../lib/axios';

export default function Departments() {
  const [rows, setRows] = useState<Array<{id:number, code:string, name:string}>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await adminApi.get('/admin/departments');
        const data = res.data;
        if (Array.isArray(data)) setRows(data);
        else if (Array.isArray(data?.items)) setRows(data.items);
        else setRows([]);
      } catch (e: any) {
        const msg = e?.response?.data?.error?.message || e?.message || 'Failed to load departments';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
        <p className="text-sm text-gray-600">Registered departments</p>
      </div>

      {/* Departments Grid */}
      <Card className="p-6">
        {loading && <div className="text-center text-gray-500">Loading departments...</div>}
        {error && !loading && <div className="text-center text-red-600">{error}</div>}
        {!loading && !error && rows.length === 0 && (
          <div className="text-center text-gray-500">No departments found</div>
        )}
        {!loading && !error && rows.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rows.map((dept) => (
              <Card key={dept.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{dept.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">Code: {dept.code}</p>
                  </div>
                  <span className="text-sm text-gray-600">#{dept.id}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
