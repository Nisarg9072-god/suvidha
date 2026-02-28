import { NavLink } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import {
  LayoutDashboard,
  Ticket,
  Wrench,
  Users,
  Building2,
  BarChart3,
  FileText,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const { logout, user } = useAuth();

  const role = user?.role;
  const permissions = Array.isArray((user as any)?.permissions) ? ((user as any).permissions as string[]) : [];
  const canViewAnalytics = permissions.includes('ANALYTICS_VIEW') || role === 'admin' || role === 'dept_admin';
  const canViewAudit = role === 'admin';
  const canViewStaff = permissions.includes('STAFF_VIEW') || role === 'admin' || role === 'dept_admin';

  const baseSections = [
    {
      title: 'OPERATIONS',
      items: [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: Ticket, label: 'Tickets', path: '/tickets' },
        { icon: Wrench, label: 'Work Orders', path: '/work-orders' },
      ],
    },
    {
      title: 'MANAGEMENT',
      items: [
        ...(canViewStaff ? [{ icon: Users, label: 'Staff Control', path: '/staff' }] : []),
        { icon: Building2, label: 'Departments', path: '/departments' },
      ],
    },
    {
      title: 'INTELLIGENCE',
      items: [
        ...(canViewAnalytics ? [{ icon: BarChart3, label: 'Analytics', path: '/analytics' }] : []),
        ...(canViewAudit ? [{ icon: FileText, label: 'Audit Logs', path: '/audit-logs' }] : []),
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        { icon: Bell, label: 'Notifications', path: '/notifications' },
        { icon: Settings, label: 'Settings', path: '/settings' },
      ],
    },
  ];
  const navSections = baseSections.filter(section => section.items.length > 0);

  return (
    <aside
      className={`bg-gray-900 text-white transition-all duration-300 flex flex-col ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
        {!collapsed && (
          <div>
            <h1 className="text-lg font-bold">SUVIDHA</h1>
            <p className="text-xs text-gray-400">Command Center</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 hover:bg-gray-800 rounded"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {navSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-6">
            {!collapsed && (
              <div className="px-4 mb-2">
                <h3 className="text-xs font-semibold text-gray-400">
                  {section.title}
                </h3>
              </div>
            )}
            <div className="space-y-1">
              {section.items.map((item, itemIndex) => (
                <NavLink
                  key={itemIndex}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    } ${collapsed ? 'justify-center' : ''}`
                  }
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span className="text-sm">{item.label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}

        {/* Sign Out */}
        <div className="px-4 mt-4">
          <button
            onClick={logout}
            className={`flex items-center gap-3 w-full px-4 py-2.5 text-gray-300 hover:bg-red-600 hover:text-white rounded transition-colors ${
              collapsed ? 'justify-center' : ''
            }`}
            title={collapsed ? 'Sign Out' : undefined}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm">Sign Out</span>}
          </button>
        </div>
      </nav>
    </aside>
  );
}
