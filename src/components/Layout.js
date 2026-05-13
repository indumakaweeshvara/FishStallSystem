import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  Settings,
  LogOut,
  Fish,
  Moon,
  Sun,
  MessageCircle,
  X,
  Package,
  History,
  FileText
} from 'lucide-react';

export default function Layout({ children }) {
  const location = useLocation();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [settings, setSettings] = useState({});
  const webviewRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const webview = webviewRef.current;
    if (webview) {
      const handleNewWindow = (e) => {
        if (window.require) {
          const { shell } = window.require('electron');
          shell.openExternal(e.url);
        }
      };
      const handleDomReady = () => {
        webview.setZoomFactor(0.77);
      };
      webview.addEventListener('new-window', handleNewWindow);
      webview.addEventListener('dom-ready', handleDomReady);
      return () => {
        webview.removeEventListener('new-window', handleNewWindow);
        webview.removeEventListener('dom-ready', handleDomReady);
      };
    }
  }, [isWhatsAppOpen]);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    if (window.require) {
      try {
        const { ipcRenderer } = window.require('electron');
        const data = await ipcRenderer.invoke('get-settings');
        setSettings(data || {});
      } catch (err) {
        console.error("Layout loadSettings error:", err);
      }
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const menuItems = [
    { name: 'Billing', path: '/', icon: ShoppingCart },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const WhatsAppIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .004 5.408 0 12.044c0 2.123.555 4.191 1.613 6.02L0 24l6.105-1.602a11.832 11.832 0 005.944 1.607h.005c6.637 0 12.048-5.409 12.052-12.045.002-3.217-1.248-6.242-3.511-8.511"></path></svg>
  );

  return (
    <div className="app-container" style={{ display: 'flex', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside className="sidebar" style={{ width: '240px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', paddingLeft: '8px' }}>
          <div style={{ background: 'var(--primary)', padding: '8px', borderRadius: '10px', color: 'white' }}>
            <Fish size={24} />
          </div>
          <h1 className="brand-font" style={{ 
            fontSize: '26px', 
            color: 'var(--primary)', 
            margin: 0, 
            fontFamily: "'Times New Roman', Times, serif", 
            fontStyle: 'italic',
            fontWeight: 'bold',
            letterSpacing: '1.5px'
          }}>THINAYA</h1>
        </div>

        <nav style={{ flex: 1 }}>
          <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <ShoppingCart size={20} />
            <span>Billing</span>
          </NavLink>
          
          <NavLink to="/customers" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Users size={20} />
            <span>Customers</span>
          </NavLink>

          <NavLink to="/products" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Package size={20} />
            <span>Products</span>
          </NavLink>
          
          <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Settings size={20} />
            <span>Settings</span>
          </NavLink>
          
          <button 
            className={`nav-item ${isWhatsAppOpen ? 'active' : ''}`}
            style={{ 
              width: '100%', 
              border: 'none', 
              background: 'none', 
              cursor: 'pointer', 
              textAlign: 'left', 
              outline: 'none',
              color: '#25D366'
            }}
            onClick={() => setIsWhatsAppOpen(!isWhatsAppOpen)}
          >
            <WhatsAppIcon />
            <span style={{ color: '#25D366', fontWeight: isWhatsAppOpen ? 'bold' : 'normal' }}>WhatsApp</span>
          </button>
        </nav>

        <div style={{ paddingTop: '20px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button className="nav-item btn-ghost" style={{ width: '100%', border: 'none', background: 'none' }}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content" style={{ flex: 1, transition: 'all 0.3s ease', marginRight: isWhatsAppOpen ? '390px' : '0' }}>
        <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '24px', color: 'var(--text-main)' }}>
              {menuItems.find(i => i.path === location.pathname)?.name || 'Dashboard'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Welcome back to your Fish Stall POS</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={toggleTheme} className="btn-ghost" style={{ padding: '8px', borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Toggle Dark Mode">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text-main)' }}>Thinaya Sea Food Supplier</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Admin</p>
            </div>
            <div style={{ width: '40px', height: '40px', background: 'var(--border)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={20} color="var(--text-muted)" />
            </div>
          </div>
        </header>

        <div className="fade-in">
          {children}
        </div>
      </main>

      {/* WhatsApp Side Drawer (Premium iPhone 17 Pro Max Style) */}
      <div 
        style={{ 
          position: 'fixed', 
          right: isWhatsAppOpen ? '20px' : '-500px', 
          top: '20px', 
          bottom: '20px', 
          width: '450px', 
          background: '#1a1a1a', 
          borderRadius: '60px', 
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', 
          zIndex: 2000, 
          transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          display: 'flex',
          flexDirection: 'column',
          padding: '12px',
          border: '3px solid #333'
        }}
      >
        {/* Dynamic Island / Notch */}
        <div style={{ 
          position: 'absolute', 
          top: '22px', 
          left: '50%', 
          transform: 'translateX(-50%)', 
          width: '120px', 
          height: '30px', 
          background: 'black', 
          borderRadius: '20px', 
          zIndex: 2001,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          border: '1px solid #222'
        }}
        onClick={() => {
          if (webviewRef.current) webviewRef.current.reload();
        }}
        title="Click to Reload WhatsApp"
        >
          <div style={{ width: '8px', height: '8px', background: '#333', borderRadius: '50%' }}></div>
        </div>

        {/* Close Button (Floating) */}
        <button 
          onClick={() => setIsWhatsAppOpen(false)} 
          style={{ 
            position: 'absolute', 
            top: '-10px', 
            left: '-10px', 
            width: '32px', 
            height: '32px', 
            background: '#ff4444', 
            color: 'white', 
            borderRadius: '50%', 
            border: '2px solid white', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
            zIndex: 2002
          }}
        >
          <X size={18} />
        </button>

        <div style={{ 
          flex: 1, 
          background: 'white', 
          borderRadius: '48px', 
          overflow: 'hidden', 
          position: 'relative',
          border: '1px solid #000'
        }}>
          {window.require ? (
            <webview 
              ref={webviewRef}
              src="https://web.whatsapp.com" 
              style={{ 
                width: '100%', 
                height: '100%', 
                background: 'white'
              }}
              useragent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
              allowpopups
              webpreferences="nativeWindowOpen=yes, contextIsolation=no, nodeIntegration=no, sandbox=no, webSecurity=no"
            ></webview>
          ) : (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#666' }}>
              WhatsApp Web Desktop Mode
            </div>
          )}
        </div>

        {/* Home Bar */}
        <div style={{ height: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '120px', height: '5px', background: 'rgba(255,255,255,0.2)', borderRadius: '10px' }}></div>
        </div>
      </div>
    </div>
  );
}
