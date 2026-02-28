import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  UserPlus,
  AlertTriangle,
  Wrench,
  Clock,
  MapPin,
  Phone,
  FileText,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { adminApi } from '../lib/axios';

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [confirmAction, setConfirmAction] = useState<{
    open: boolean;
    action: string;
    title: string;
    description: string;
  }>({ open: false, action: '', title: '', description: '' });

  const [ticket, setTicket] = useState<any | null>(null);
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    const load = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const [detailRes, updatesRes] = await Promise.all([
          adminApi.get(`/admin/tickets/${id}`, { signal: controller.signal }),
          adminApi.get(`/admin/tickets/${id}/updates`, { signal: controller.signal })
        ]);
        const t = detailRes.data?.ticket || null;
        if (mounted) setTicket(t);
        const upd = updatesRes.data?.items ?? updatesRes.data ?? [];
        if (mounted) setUpdates(Array.isArray(upd) ? upd : []);
      } catch (e: any) {
        const msg = e?.response?.data?.error?.message || e?.message || 'Failed to load ticket';
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
  }, [id]);

  if (loading) {
    return (
      <div className="p-6">
        <Card className="p-8 text-center">
          <p className="text-gray-600">Loading ticket...</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="p-8 text-center">
          <p className="text-red-600">{error}</p>
          <Button onClick={() => navigate('/tickets')} className="mt-4">
            Back to Tickets
          </Button>
        </Card>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-6">
        <Card className="p-8 text-center">
          <p className="text-gray-600">Ticket not found</p>
          <Button onClick={() => navigate('/tickets')} className="mt-4">
            Back to Tickets
          </Button>
        </Card>
      </div>
    );
  }

  const handleAction = (action: string, title: string, description: string) => {
    setConfirmAction({ open: true, action, title, description });
  };

  const confirmActionHandler = () => {
    setConfirmAction({ open: false, action: '', title: '', description: '' });
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      Low: 'text-gray-600 bg-gray-100',
      Medium: 'text-blue-600 bg-blue-100',
      High: 'text-orange-600 bg-orange-100',
      Emergency: 'text-red-600 bg-red-100',
    };
    return colors[priority as keyof typeof colors] || colors.Medium;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      Open: 'text-yellow-600 bg-yellow-100',
      'In Progress': 'text-purple-600 bg-purple-100',
      Resolved: 'text-green-600 bg-green-100',
      Closed: 'text-gray-600 bg-gray-100',
      Rejected: 'text-red-600 bg-red-100',
    };
    return colors[status as keyof typeof colors] || colors.Open;
  };

  const timeUntilSLA = () => {
    const now = new Date();
    const deadline = new Date(ticket.slaDeadline);
    const diff = deadline.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (diff < 0) {
      return <span className="text-red-600 font-semibold">SLA BREACHED</span>;
    }

    return (
      <span className={hours < 2 ? 'text-orange-600 font-semibold' : 'text-gray-900'}>
        {hours}h {minutes}m remaining
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/tickets')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{ticket.id}</h1>
            <p className="text-sm text-gray-600">Ticket Details</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
          <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Ticket Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ticket Information</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-600">Ticket ID</label>
                  <p className="font-mono text-sm font-semibold">{ticket.id}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-600">Created Date</label>
                  <p className="text-sm">
                    {ticket.createdDate ? format(new Date(ticket.createdDate), 'MMM dd, yyyy HH:mm') : ''}
                  </p>
                  <p className="text-xs text-gray-500">
                    {ticket.createdDate ? formatDistanceToNow(new Date(ticket.createdDate), { addSuffix: true }) : ''}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-600 flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    Citizen Phone
                  </label>
                  <p className="font-mono text-sm font-semibold">{ticket.citizenPhone}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-600 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Location
                  </label>
                  <p className="text-sm">{ticket.location}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-600">Department</label>
                  <p className="text-sm font-semibold">{ticket.department}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-600">Category</label>
                  <p className="text-sm">{ticket.category}</p>
                </div>
              </div>

              <Separator />

              <div>
                <label className="text-xs text-gray-600 flex items-center gap-1 mb-2">
                  <FileText className="h-3 w-3" />
                  Description
                </label>
                <p className="text-sm text-gray-700">{ticket.description}</p>
              </div>

              <Separator />

              <div>
                <label className="text-xs text-gray-600">Assigned Staff</label>
                <p className="text-sm font-semibold">
                  {ticket.assignedStaff === 'Unassigned' ? (
                    <span className="text-gray-400 italic">Not assigned</span>
                  ) : (
                    ticket.assignedStaff
                  )}
                </p>
              </div>
            </div>
          </Card>

          {/* SLA Information */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              SLA Information
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Deadline</span>
                <span className="text-sm font-semibold">
                  {ticket.slaDeadline ? format(new Date(ticket.slaDeadline), 'MMM dd, yyyy HH:mm') : ''}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Time Remaining</span>
                {timeUntilSLA()}
              </div>
              <div className="mt-4 bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full ${
                    new Date(ticket.slaDeadline) < new Date()
                      ? 'bg-red-600'
                      : 'bg-green-600'
                  }`}
                  style={{
                    width: `${Math.min(
                      100,
                      ((new Date().getTime() - new Date(ticket.createdDate).getTime()) /
                        (new Date(ticket.slaDeadline).getTime() -
                          new Date(ticket.createdDate).getTime())) *
                        100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>
          </Card>

          {/* Updates Timeline */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Updates</h2>
            {updates.length === 0 ? (
              <p className="text-sm text-gray-500">No updates available</p>
            ) : (
              <div className="space-y-3">
                {updates.map((u) => (
                  <div key={u.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{u.status || 'update'}</span>
                      <span className="text-xs text-gray-500">
                        {u.created_at ? format(new Date(u.created_at), 'MMM dd, yyyy HH:mm') : ''}
                      </span>
                    </div>
                    {u.note && <p className="text-sm text-gray-700 mt-1">{u.note}</p>}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column - Actions */}
        <div className="space-y-4">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Admin Actions</h2>
            <div className="space-y-2">
              <Button
                className="w-full justify-start gap-2"
                variant="outline"
                onClick={() =>
                  handleAction(
                    'Approve',
                    'Approve Ticket',
                    'Are you sure you want to approve this ticket?'
                  )
                }
              >
                <CheckCircle2 className="h-4 w-4" />
                Approve Ticket
              </Button>

              <Button
                className="w-full justify-start gap-2"
                variant="outline"
                onClick={() =>
                  handleAction(
                    'Reject',
                    'Reject Ticket',
                    'Are you sure you want to reject this ticket?'
                  )
                }
              >
                <XCircle className="h-4 w-4" />
                Reject Ticket
              </Button>

              <Button
                className="w-full justify-start gap-2"
                variant="outline"
                onClick={() =>
                  handleAction(
                    'Assign Staff',
                    'Assign Staff',
                    'Select a staff member to assign this ticket.'
                  )
                }
              >
                <UserPlus className="h-4 w-4" />
                Assign Staff
              </Button>

              <Button
                className="w-full justify-start gap-2"
                variant="outline"
                onClick={() =>
                  handleAction(
                    'Escalate',
                    'Escalate Priority',
                    'Are you sure you want to escalate this ticket to Emergency priority?'
                  )
                }
              >
                <AlertTriangle className="h-4 w-4" />
                Escalate Priority
              </Button>

              <Button
                className="w-full justify-start gap-2"
                variant="outline"
                onClick={() =>
                  handleAction(
                    'Create Work Order',
                    'Create Work Order',
                    'Create a new work order for this ticket?'
                  )
                }
              >
                <Wrench className="h-4 w-4" />
                Create Work Order
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Ticket Created</p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(ticket.createdDate), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              </div>

              {ticket.assignedStaff !== 'Unassigned' && (
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <UserPlus className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Assigned to {ticket.assignedStaff}</p>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(ticket.createdDate), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              )}

              {ticket.status === 'Resolved' && (
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Ticket Resolved</p>
                    <p className="text-xs text-gray-500">Recently</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmAction.open} onOpenChange={(open) => setConfirmAction({ ...confirmAction, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmAction.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirmAction.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmActionHandler}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
