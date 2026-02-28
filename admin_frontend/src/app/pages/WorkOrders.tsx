import { useState } from 'react';
import { Card } from '../components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default function WorkOrders() {
  const [_] = useState(false);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Work Orders</h1>
        <p className="text-sm text-gray-600">Use ticket detail to create/view work orders</p>
      </div>

      <Card>
        <div className="p-8 text-center text-gray-600">
          <div className="flex items-center justify-center mb-3">
            <AlertTriangle className="h-6 w-6 text-gray-400" />
          </div>
          <p>No standalone work order listing available.</p>
          <p className="text-sm mt-1">Open a ticket to create and view work orders.</p>
        </div>
      </Card>
    </div>
  );
}
