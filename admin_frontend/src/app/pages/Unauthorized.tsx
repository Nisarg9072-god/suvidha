import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router';

export default function Unauthorized() {
  const navigate = useNavigate();
  return (
    <div className="p-6 flex items-center justify-center">
      <Card className="max-w-md w-full p-8 text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">403 — Unauthorized</h1>
        <p className="text-gray-600">You do not have permission to access this page.</p>
        <Button onClick={() => navigate('/dashboard')} className="w-full">Go to Dashboard</Button>
      </Card>
    </div>
  );
}
