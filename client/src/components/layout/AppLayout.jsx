import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  FileText,
  PlusCircle,
  LogOut,
  Menu,
  X,
  Receipt,
  Building2,
  ChevronRight
} from 'lucide-react';

const AppLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Clients', href: '/clients', icon: Users },
    { name: 'Invoices', href: '/invoices', icon: FileText }
  ];

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row text-slate-100">
      {/* Mobile Top Navbar */}
      <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <Link to="/dashboard" className="flex items-center space-x-2">
          <div className="p-1.5 bg-brand-600 rounded-lg text-white">
            <Receipt className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg text-white tracking-tight">InvoiceFlow</span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar for Desktop & Mobile Overlay Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5">
          {/* Logo / Branding */}
          <Link
            to="/dashboard"
            className="flex items-center space-x-3 px-2 mb-8 group"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="p-2 bg-gradient-to-tr from-brand-600 to-brand-500 rounded-xl text-white shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-extrabold text-xl text-white tracking-tight leading-none">InvoiceFlow</h1>
              <span className="text-[10px] uppercase font-bold text-brand-400 tracking-wider">Business SaaS</span>
            </div>
          </Link>

          {/* Quick Create Invoice CTA */}
          <Link
            to="/invoices/new"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-medium shadow-md shadow-brand-600/20 transition-all mb-6 group"
          >
            <PlusCircle className="w-4 h-4 group-hover:rotate-90 transition-transform" />
            <span>Create Invoice</span>
          </Link>

          {/* Navigation Items */}
          <nav className="space-y-1">
            <div className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Menu
            </div>
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'bg-brand-600/15 text-brand-400 border border-brand-500/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-5 h-5 ${active ? 'text-brand-400' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {active && <ChevronRight className="w-4 h-4 text-brand-400" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Account Info & Logout */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-brand-600/20 text-brand-400 border border-brand-500/30 flex items-center justify-center font-bold text-sm shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="truncate">
                <p className="text-sm font-medium text-slate-200 truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email || 'user@example.com'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
