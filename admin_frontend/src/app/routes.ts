import React from 'react';
import { createBrowserRouter } from 'react-router';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tickets from './pages/Tickets';
import TicketDetail from './pages/TicketDetail';
import WorkOrders from './pages/WorkOrders';
import Staff from './pages/Staff';
import Analytics from './pages/Analytics';
import Notifications from './pages/Notifications';
import AuditLogs from './pages/AuditLogs';
import Settings from './pages/Settings';
import Sessions from './pages/Sessions';
import Departments from './pages/Departments';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Unauthorized from './pages/Unauthorized';

function RequireAdmin() {
  return React.createElement(ProtectedRoute, { allowedRoles: ['admin'] });
}

function RequireManager() {
  return React.createElement(ProtectedRoute, { allowedRoles: ['admin', 'dept_admin'] });
}

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: Login,
  },
  {
    path: '/unauthorized',
    Component: Unauthorized,
  },
  {
    path: '/',
    Component: ProtectedRoute,
    children: [
      {
        path: '/',
        Component: Layout,
        children: [
          { index: true, Component: Dashboard },
          { path: 'dashboard', Component: Dashboard },
          { path: 'tickets', Component: Tickets },
          { path: 'tickets/:id', Component: TicketDetail },
          { path: 'work-orders', Component: WorkOrders },
          {
            path: 'staff',
            Component: RequireManager,
            children: [{ index: true, Component: Staff }],
          },
          { path: 'departments', Component: Departments },
          {
            path: 'analytics',
            Component: RequireManager,
            children: [{ index: true, Component: Analytics }],
          },
          { path: 'notifications', Component: Notifications },
          {
            path: 'audit-logs',
            Component: RequireAdmin,
            children: [{ index: true, Component: AuditLogs }],
          },
          { path: 'settings', Component: Settings },
          { path: 'sessions', Component: RequireAdmin, children: [{ index: true, Component: Sessions }] },
        ],
      },
    ],
  },
]);
