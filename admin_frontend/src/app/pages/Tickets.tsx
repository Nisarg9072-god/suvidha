import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Checkbox } from '../components/ui/checkbox';
import { Search, Filter, Download, Eye, UserPlus, RefreshCw, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { adminApi } from '../lib/axios';
import { connectTicketStream } from '../lib/sse';
import AssignDialog from '../components/AssignDialog';
import { Button as Btn } from '../components/ui/button';

export default function Tickets() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTickets, setSelectedTickets] = useState<(string | number)[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [ sopDepartment, setSopDepartment ] = useState('all'); // prevent reserved word collisions
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTickets = async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = { page, limit: 20 };
      if (searchQuery) params.q = searchQuery;
      if (statusFilter !== 'all') params.status = statusFilter === 'In Progress' ? 'in_progress' : statusFilter.toLowerCase();
      if (priorityFilter !== 'all') params.priority = priorityFilter.toLowerCase();
      if (sopDepartment !== 'all') params.department = sopDepartment;
      const res = await adminApi.get('/admin/tickets', { params, signal });
      const data = res.data || {};
      setTickets(Array.isArray(data.tickets) ? data.tickets : []);
      setTotalPages(typeof data.totalPages === 'number' ? data.totalPages : 1);
    } catch (e: any) {
      const msg = e?.response?.data?.error?.message || e?.message || 'Failed to load tickets';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchTickets(controller.signal);
    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter, priorityFilter, sopDepartment]);

  useEffect(() => {
    const controller = new AbortController();
    const tm = setTimeout(() => {
      setPage(1);
      fetchTickets(controller.signal);
    }, 500);
    return () => {
      clearTimeout(tm);
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);
  useEffect(() => {
    const handler = connectTicketStream((type, payload) => {
      if (!payload) return;
      if (type === 'ticket_created') {
        setTickets((prev) => {
          const exists = prev.some((t) => t.id === payload.id);
          const next = exists ? prev : [payload, ...prev];
          return next;
        });
      } else if (type === 'ticket_status') {
        setTickets((prev) =>
          prev.map((t) => (t.id === payload.id ? { ...t, status: payload.status ?? t.status } : t))
        );
      } else if (type === 'ticket_assigned') {
        setTickets((prev) =>
          prev.map((t) => (t.id === payload.id ? { ...t, assignedStaff: payload.assignedStaff ?? t.assignedStaff } : t))
        );
      } else if (type === 'work_order_created') {
        setTickets((prev) =>
          prev.map((t) => (t.id === payload.ticketId ? { ...t, workOrderId: payload.workOrderId ?? t.workOrderId } : t))
        );
      }
    });
    return () => {
      handler.close();
    };
  }, []);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTickets(tickets.map((t) => t.id));
    } else {
      setSelectedTickets([]);
    }
  };

  const handleSelectTicket = (ticketId: string | number, checked: boolean) => {
    if (checked) {
      setSelectedTickets([...selectedTickets, ticketId]);
    } else {
      setSelectedTickets(selectedTickets.filter((id) => id !== ticketId));
    }
  };

  const getPriorityBadge = (priority: string) => {
    const styles = {
      Low: 'bg-gray-100 text-gray-800',
      Medium: 'bg-blue-100 text-blue-800',
      High: 'bg-orange-100 text-orange-800',
      Emergency: 'bg-red-100 text-red-800',
    };
    return <Badge className={styles[priority as keyof typeof styles] || styles.Medium}>{priority}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      Open: 'bg-yellow-100 text-yellow-800',
      'In Progress': 'bg-purple-100 text-purple-800',
      Resolved: 'bg-green-100 text-green-800',
      Rejected: 'bg-red-100 text-red-800',
    };
    return <Badge className={styles[status as keyof typeof styles] || styles.Open}>{status}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
        <p className="text-sm text-gray-600">Manage and track all citizen service requests</p>
      </div>

      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search by ticket ID, phone, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            {selectedTickets.length > 0 && (
              <>
                <Button variant="outline" className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Bulk Assign
                </Button>
                <Button variant="outline" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Bulk Status
                </Button>
                <Button
                  variant="outline"
                  onClick={() => toast.success(`Exported ${selectedTickets.length} tickets to CSV`)}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export ({selectedTickets.length})
                </Button>
              </>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Department</label>
              <Select value={sopDepartment} onValueChange={(v) => { setSopDepartment(v); setPage(1); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Gas">Gas</SelectItem>
                  <SelectItem value="Electricity">Electricity</SelectItem>
                  <SelectItem value="Municipal">Municipal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Status</label>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Priority</label>
              <Select value={priorityFilter} onValueChange={(v) => { setPriorityFilter(v); setPage(1); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full" onClick={() => { setPage(1); fetchTickets(); }}>
                Apply Filters
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Card>
        <div className="overflow-x-auto">
          {loading && <div className="p-6 text-center text-gray-500">Loading tickets...</div>}
          {error && !loading && (
            <div className="p-6 text-center">
              <div className="text-red-600 mb-3">{error}</div>
              <Button variant="outline" onClick={() => fetchTickets()}>Retry</Button>
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={tickets.length > 0 && selectedTickets.length === tickets.length}
                    onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                  />
                </TableHead>
                <TableHead>Ticket ID</TableHead>
                <TableHead>Citizen Phone</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned Staff</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>SLA Deadline</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!loading && !error && tickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                    No tickets found
                  </TableCell>
                </TableRow>
              ) : (
                tickets.map((ticket) => (
                  <TableRow key={ticket.id} className="hover:bg-gray-50">
                    <TableCell>
                      <Checkbox
                        checked={selectedTickets.includes(ticket.id)}
                        onCheckedChange={(checked) =>
                          handleSelectTicket(ticket.id, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Link
                        to={`/tickets/${ticket.id}`}
                        className="font-mono text-sm text-blue-600 hover:underline"
                      >
                        {ticket.id}
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {ticket.citizenPhone}
                    </TableCell>
                    <TableCell>{ticket.department}</TableCell>
                    <TableCell>{ticket.category}</TableCell>
                    <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                    <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                    <TableCell>
                      {ticket.assignedStaff === 'Unassigned' ? (
                        <span className="text-gray-400 italic">Unassigned</span>
                      ) : (
                        ticket.assignedStaff
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {ticket.createdDate ? format(new Date(ticket.createdDate), 'MMM dd, HH:mm') : ''}
                    </TableCell>
                    <TableCell className="text-sm">
                      {ticket.slaDeadline && new Date(ticket.slaDeadline) < new Date() ? (
                        <span className="inline-flex items-center gap-1 text-red-600">
                          <AlertTriangle className="h-4 w-4" />
                          Overdue
                        </span>
                      ) : (
                        <span className="text-gray-600">On track</span>
                      )}
                      <div className="text-xs text-gray-500">
                        {ticket.slaDeadline ? format(new Date(ticket.slaDeadline), 'MMM dd, HH:mm') : ''}
                      </div>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Btn
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            await adminApi.patch(`/admin/tickets/${ticket.id}/status`, { status: 'resolved', reason: 'completed_by_admin' });
                            toast.success(`Ticket #${ticket.id} marked Completed`);
                            fetchTickets();
                          } catch (e: any) {
                            const msg = e?.response?.data?.error?.message || e?.message || 'Failed to mark complete';
                            toast.error(msg);
                          }
                        }}
                      >
                        Complete
                      </Btn>
                      <AssignDialog
                        ticketId={ticket.id}
                        onAssigned={() => {
                          toast.success(`Ticket #${ticket.id} assigned`);
                          fetchTickets();
                        }}
                        trigger={
                          <Button variant="outline" size="sm" className="gap-1">
                            <UserPlus className="h-4 w-4" />
                            Assign
                          </Button>
                        }
                      />
                      <Link to={`/tickets/${ticket.id}`}>
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {!loading && !error && tickets.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
            <Button variant="outline" disabled={page <= 1} onClick={() => setPage(Math.max(1, page - 1))}>
              Previous
            </Button>
            <p className="text-sm text-gray-600">Page {page} of {totalPages}</p>
            <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              Next
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
