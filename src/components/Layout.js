import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  History, 
  Package, 
  Settings,
  LogOut,
  Fish
} from 'lucide-react';

export default function Layout({ children }) {
  const location = useLocation();

  const menuItems = [
    { name: 'Billing', path: '/', icon: ShoppingCart },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'Sales History', path: '/sales', icon: History },
    { name: 'Inventory', path: '/inventory', icon: Package },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', paddingLeft: '8px' }}>
          <div style={{ background: 'var(--primary)', padding: '8px', borderRadius: '10px', color: 'white' }}>
            <Fish size={24} />
          </div>
          <h1 className="brand-font" style={{ fontSize: '22px', color: 'var(--primary)', margin: 0 }}>OCEAN CATCH</h1>
        </div>

        <nav style={{ flex: 1 }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink 
                key={item.path} 
                to={item.path} 
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div style={{ paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
          <button className="nav-item btn-ghost" style={{ width: '100%', border: 'none', background: 'none' }}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '24px', color: 'var(--text-main)' }}>
              {menuItems.find(i => i.path === location.pathname)?.name || 'Dashboard'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Welcome back to your Fish Stall POS</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontWeight: '600', fontSize: '14px' }}>Nihal Perera</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Admin</p>
            </div>
            <div style={{ width: '40px', height: '40px', background: '#e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={20} color="#64748b" />
            </div>
          </div>
        </header>

        <div className="fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
