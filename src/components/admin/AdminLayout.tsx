import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  Inbox,
  BarChart3,
  Settings,
  LogOut,
  ExternalLink,
  Shield,
  Menu,
  X,
  Database,
  Sparkles,
} from 'lucide-react';
import { repository } from '../../lib/storage';
import { getSupabaseConfig } from '../../lib/supabase';
import type { AdminUser } from '../../types/property';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(repository.getAdminSession());
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [newEnquiryCount, setNewEnquiryCount] = useState<number>(0);

  useEffect(() => {
    const session = repository.getAdminSession();
    if (!session) {
      navigate('/admin/login');
      return;
    }
    setAdminUser(session);

    // Track new enquiries
    repository.getEnquiries().then((enquiries) => {
      setNewEnquiryCount(enquiries.filter((e) => e.status === 'New').length);
    });

    const unsubEnquiries = repository.subscribe('enquiries', (enquiries: any[]) => {
      setNewEnquiryCount(enquiries.filter((e) => e.status === 'New').length);
    });

    const unsubAdmin = repository.subscribe('admin', (user: AdminUser | null) => {
      if (!user) navigate('/admin/login');
      else setAdminUser(user);
    });

    return () => {
      unsubEnquiries();
      unsubAdmin();
    };
  }, [navigate]);

  const handleLogout = () => {
    repository.logoutAdmin();
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Properties', href: '/admin/properties', icon: Building2 },
    { label: 'Add Property', href: '/admin/properties/new', icon: PlusCircle },
    {
      label: 'Enquiries',
      href: '/admin/enquiries',
      icon: Inbox,
      badge: newEnquiryCount > 0 ? newEnquiryCount : undefined,
    },
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { label: 'Settings & Supabase', href: '/admin/settings', icon: Settings },
  ];

  const { isConfigured } = getSupabaseConfig();

  return (
    <div className="min-h-screen bg-[#F7FAF8] flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-[#0B3D2E] text-white p-4 flex items-center justify-between sticky top-0 z-50 border-b border-[#00E6A0]/20">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#00E6A0]" />
          <span className="font-serif font-bold text-lg">ACRELYN Admin</span>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-1.5 rounded-lg text-emerald-200 hover:text-white"
        >
          {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar (Desktop sticky, Mobile drawer) */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#0B3D2E] text-white flex flex-col justify-between p-5 transform transition-transform duration-200 md:translate-x-0 md:static md:h-screen md:sticky md:top-0 border-r border-[#00E6A0]/15 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Brand header */}
          <div className="flex items-center justify-between pb-4 border-b border-emerald-900/80">
            <Link to="/admin/dashboard" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#00E6A0] flex items-center justify-center text-[#142B25] font-bold text-sm shadow-[0_0_12px_#00E6A0]">
                A
              </div>
              <div>
                <div className="font-serif font-bold text-lg text-white">ACRELYN</div>
                <div className="text-[10px] text-[#00E6A0] uppercase tracking-widest font-bold">
                  Admin Portal
                </div>
              </div>
            </Link>
          </div>

          {/* Database indicator */}
          <div className="px-3 py-2.5 rounded-xl bg-[#07271D] border border-emerald-800/60 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-[#00E6A0]" />
              <span className="text-emerald-100 font-medium">Database</span>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                isConfigured
                  ? 'bg-[#00E6A0]/20 text-[#00E6A0] border border-[#00E6A0]/40'
                  : 'bg-amber-900/80 text-amber-300'
              }`}
            >
              {isConfigured ? 'Supabase Live' : 'Local Storage'}
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const active = location.pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    active
                      ? 'bg-[#00E6A0] text-[#142B25] shadow-[0_0_14px_rgba(0,230,160,0.4)]'
                      : 'text-emerald-100 hover:bg-[#145944] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-white text-[#142B25] shadow-2xs">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User profile & actions */}
        <div className="pt-4 border-t border-emerald-900/80 space-y-3">
          <div className="px-2">
            <div className="text-xs font-bold text-white truncate">
              {adminUser?.name || 'Administrator'}
            </div>
            <div className="text-[11px] text-[#00E6A0] truncate">
              {adminUser?.email}
            </div>
          </div>

          <div className="space-y-1">
            <Link
              to="/"
              className="flex items-center justify-between w-full px-3 py-2 text-xs text-emerald-100 hover:text-white hover:bg-[#145944] rounded-xl transition-all font-medium"
            >
              <span>View Public Site</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-300 hover:text-white hover:bg-red-900/40 rounded-xl transition-all text-left font-bold"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
