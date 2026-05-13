import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Store, MapPin, Phone, Info, RefreshCw, Database, Trash2, Download, Coins, Image as ImageIcon } from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState({
    stall_name: '',
    stall_address: '',
    stall_phone: '',
    stall_footer: '',
    currency: 'Rs.',
    stall_logo: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    if (window.require) {
      const { ipcRenderer } = window.require('electron');
      const data = await ipcRenderer.invoke('get-settings');
      setSettings(data);
    }
  };

  const handleUpdate = async (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveAllSettings = async () => {
    setIsSaving(true);
    if (window.require) {
      const { ipcRenderer } = window.require('electron');
      try {
        await ipcRenderer.invoke('update-setting', { key: 'stall_name', value: settings.stall_name });
        await ipcRenderer.invoke('update-setting', { key: 'stall_address', value: settings.stall_address });
        await ipcRenderer.invoke('update-setting', { key: 'stall_phone', value: settings.stall_phone });
        await ipcRenderer.invoke('update-setting', { key: 'stall_footer', value: settings.stall_footer });
        await ipcRenderer.invoke('update-setting', { key: 'currency', value: settings.currency });
        await ipcRenderer.invoke('update-setting', { key: 'stall_logo', value: settings.stall_logo });
        
        setMessage('Settings saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } catch (err) {
        alert('Error saving settings: ' + err.message);
      }
    }
    setIsSaving(false);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleUpdate('stall_logo', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackup = async () => {
    if (window.require) {
      const { ipcRenderer } = window.require('electron');
      const result = await ipcRenderer.invoke('backup-database');
      if (result.success) {
        alert(`Backup Success! File saved to: ${result.path}`);
      } else {
        alert(`Backup Failed: ${result.error}`);
      }
    }
  };

  const handleReset = async () => {
    if (window.confirm('WARNING: This will delete ALL sales transactions. This cannot be undone. Are you sure?')) {
      if (window.require) {
        const { ipcRenderer } = window.require('electron');
        const result = await ipcRenderer.invoke('reset-database');
        if (result.success) {
          alert('System sales records have been reset.');
        }
      }
    }
  };

  return (
    <div style={{ maxWidth: '900px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* 1. Header Card */}
      <div className="card fade-in" style={{ display: 'flex', alignItems: 'center', gap: '20px', background: 'var(--primary)', color: 'white', border: 'none' }}>
        <div style={{ background: 'rgba(255,255,255,0.2)', padding: '16px', borderRadius: '16px' }}>
          <SettingsIcon size={32} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '24px' }}>Professional Settings</h2>
          <p style={{ margin: 0, opacity: 0.8, fontSize: '14px' }}>Advanced configuration for your Fish Stall POS.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '32px' }}>
        
        {/* 2. Main Form Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div className="card fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', borderBottom: '1px solid var(--border)', paddingBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Store size={20} color="var(--primary)" /> Stall Branding
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="input-group">
                <label className="input-label">Stall Name</label>
                <input type="text" className="input-field" value={settings.stall_name} onChange={(e) => handleUpdate('stall_name', e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">Currency Symbol</label>
                <select className="input-field" value={settings.currency} onChange={(e) => handleUpdate('currency', e.target.value)}>
                  <option value="Rs.">Rs. (Sri Lankan Rupee)</option>
                  <option value="LKR">LKR</option>
                  <option value="$">$ (Dollar)</option>
                </select>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Address</label>
              <input type="text" className="input-field" value={settings.stall_address} onChange={(e) => handleUpdate('stall_address', e.target.value)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="input-group">
                <label className="input-label">Phone Number</label>
                <input type="text" className="input-field" value={settings.stall_phone} onChange={(e) => handleUpdate('stall_phone', e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">Bill Footer</label>
                <input type="text" className="input-field" value={settings.stall_footer} onChange={(e) => handleUpdate('stall_footer', e.target.value)} />
              </div>
            </div>

            <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button className="btn btn-primary" style={{ padding: '14px 40px' }} onClick={saveAllSettings} disabled={isSaving}>
                {isSaving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                {isSaving ? 'Saving...' : 'Save Branding Changes'}
              </button>
              {message && <span style={{ color: 'var(--success)', fontWeight: '600' }}>{message}</span>}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="card fade-in" style={{ border: '1px solid #fee2e2', background: '#fef2f2' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Database size={20} /> Data Management
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <button className="btn" style={{ background: '#334155', color: 'white' }} onClick={handleBackup}>
                <Download size={18} /> Backup to Desktop
              </button>
              <button className="btn" style={{ background: 'var(--danger)', color: 'white' }} onClick={handleReset}>
                <Trash2 size={18} /> Reset All Sales
              </button>
            </div>
            <p style={{ marginTop: '16px', fontSize: '12px', color: '#991b1b', opacity: 0.8 }}>
              * Resetting will delete all your sales history permanently. Make sure to take a backup first!
            </p>
          </div>
        </div>

        {/* Sidebar Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card fade-in" style={{ textAlign: 'center', padding: '32px 24px' }}>
            <div style={{ width: '80px', height: '80px', background: '#f1f5f9', borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', overflow: 'hidden' }}>
              {settings.stall_logo ? (
                <img src={settings.stall_logo} alt="Stall Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <ImageIcon size={40} />
              )}
            </div>
            <h4 style={{ margin: '0 0 8px 0' }}>Stall Logo</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>Logo will appear on the top left of your invoice.</p>
            <input type="file" id="logoUpload" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
            <button className="btn btn-ghost" style={{ fontSize: '13px', width: '100%' }} onClick={() => document.getElementById('logoUpload').click()}>
              {settings.stall_logo ? 'Change Logo' : 'Upload New Logo'}
            </button>
          </div>

          <div className="card fade-in" style={{ background: 'var(--primary-light)', border: '1px solid #dbeafe' }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <Coins size={20} color="var(--primary)" />
              <h4 style={{ margin: 0, color: 'var(--primary)' }}>Currency Tip</h4>
            </div>
            <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#1e40af' }}>
              Changing the currency symbol will update all future invoices and report displays.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
