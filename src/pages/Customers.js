import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Search, Phone, Mail, Edit, Trash2, X, DollarSign, CreditCard } from 'lucide-react';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '', address: '' });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    if (window.require) {
      const { ipcRenderer } = window.require('electron');
      const data = await ipcRenderer.invoke('get-customers');
      setCustomers(data);
    }
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    if (window.require) {
      const { ipcRenderer } = window.require('electron');
      await ipcRenderer.invoke('add-customer', newCustomer);
      setShowModal(false);
      setNewCustomer({ name: '', phone: '', email: '', address: '' });
      loadCustomers();
    }
  };

  const handleDeleteCustomer = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      if (window.require) {
        const { ipcRenderer } = window.require('electron');
        await ipcRenderer.invoke('delete-customer', id);
        loadCustomers();
      }
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (window.require && selectedCustomer && paymentAmount) {
      const { ipcRenderer } = window.require('electron');
      await ipcRenderer.invoke('add-payment', { 
        customer_id: selectedCustomer.id, 
        amount: parseFloat(paymentAmount) 
      });
      setShowPaymentModal(false);
      setPaymentAmount('');
      loadCustomers();
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="card" style={{ flex: 1, marginRight: '20px', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Search size={20} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Search customers by name or phone..." 
            className="input-field" 
            style={{ border: 'none', padding: '0', fontSize: '16px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <UserPlus size={20} /> Add New Customer
        </button>
      </div>

      {/* Stats Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <p className="input-label">Total Customers</p>
          <h2 style={{ fontSize: '32px', margin: '8px 0', color: 'var(--primary)' }}>{customers.length}</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Registered in database</p>
        </div>

      </div>

      {/* Customer Table */}
      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>NAME</th>
              <th>CONTACT</th>
              <th>EMAIL</th>
              <th>ADDRESS</th>
              <th style={{ textAlign: 'center' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map(c => (
              <tr key={c.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', background: 'var(--primary-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: 'var(--primary)' }}>
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontWeight: '600' }}>{c.name}</span>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                    <Phone size={14} /> {c.phone}
                  </div>
                </td>
                <td>{c.email || 'N/A'}</td>
                <td>{c.address || 'N/A'}</td>
                <td style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                    <button className="btn-ghost" style={{ padding: '8px' }} title="Edit"><Edit size={16} /></button>
                    <button className="btn-ghost" style={{ padding: '8px', color: 'var(--danger)' }} title="Delete" onClick={() => handleDeleteCustomer(c.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredCustomers.length === 0 && (
          <div style={{ padding: '80px', textAlign: 'center' }}>
            <Users size={48} color="#e2e8f0" style={{ marginBottom: '16px' }} />
            <p style={{ color: 'var(--text-muted)' }}>No customers found matching your search.</p>
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
          <div className="card fade-in" style={{ width: '450px', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '24px' }}>Add New Customer</h2>
              <button className="btn-ghost" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input type="text" className="input-field" required value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Phone Number</label>
                <input type="text" className="input-field" required value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Email Address (Optional)</label>
                <input type="email" className="input-field" value={newCustomer.email} onChange={e => setNewCustomer({...newCustomer, email: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Address (Optional)</label>
                <input type="text" className="input-field" value={newCustomer.address} onChange={e => setNewCustomer({...newCustomer, address: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedCustomer && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
          <div className="card fade-in" style={{ width: '400px', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={20} color="var(--primary)" /> 
                Add Payment
              </h2>
              <button className="btn-ghost" onClick={() => setShowPaymentModal(false)}><X size={20} /></button>
            </div>
            
            <div style={{ background: 'var(--bg-body)', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
              <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: 'var(--text-muted)' }}>Customer</p>
              <h3 style={{ margin: 0, fontSize: '16px' }}>{selectedCustomer.name}</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Current Balance:</span>
                <span style={{ fontWeight: 'bold', color: 'var(--danger)' }}>Rs. {(selectedCustomer.balance || 0).toFixed(2)}</span>
              </div>
            </div>

            <form onSubmit={handlePayment} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="input-group">
                <label className="input-label">Payment Amount (Rs.)</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="input-field" 
                  required 
                  value={paymentAmount} 
                  onChange={e => setPaymentAmount(e.target.value)} 
                  autoFocus
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowPaymentModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, background: 'var(--success)' }}>Confirm Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
