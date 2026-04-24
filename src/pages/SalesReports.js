import React, { useState, useEffect } from 'react';
import { ReceiptText, Calendar, DollarSign, Package } from 'lucide-react';

export default function SalesReports() {
  const [transactions, setTransactions] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    if (window.require) {
      const { ipcRenderer } = window.require('electron');
      ipcRenderer.invoke('get-transactions')
        .then(data => {
          setTransactions(data);
          const revenue = data.reduce((sum, txn) => sum + txn.total_amount, 0);
          setTotalRevenue(revenue);
        })
        .catch(err => console.error("Error loading transactions:", err));
    }
  }, []);

  const formatDate = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', marginBottom: '32px' }}>Sales Reports</h1>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
        <div className="panel" style={{ padding: '32px', display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ backgroundColor: '#eff6ff', padding: '20px', borderRadius: '16px', color: '#2563eb' }}>
            <DollarSign size={40} />
          </div>
          <div>
            <p style={{ color: '#6b7280', fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Total Revenue</p>
            <h2 style={{ fontSize: '36px', fontWeight: 'bold', color: '#111827' }}>${totalRevenue.toFixed(2)}</h2>
          </div>
        </div>

        <div className="panel" style={{ padding: '32px', display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ backgroundColor: '#faf5ff', padding: '20px', borderRadius: '16px', color: '#a855f7' }}>
            <ReceiptText size={40} />
          </div>
          <div>
            <p style={{ color: '#6b7280', fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Total Transactions</p>
            <h2 style={{ fontSize: '36px', fontWeight: 'bold', color: '#111827' }}>{transactions.length}</h2>
          </div>
        </div>

        <div className="panel" style={{ padding: '32px', display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ backgroundColor: '#f0fdf4', padding: '20px', borderRadius: '16px', color: '#22c55e' }}>
            <Package size={40} />
          </div>
          <div>
            <p style={{ color: '#6b7280', fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Total Items Sold</p>
            <h2 style={{ fontSize: '36px', fontWeight: 'bold', color: '#111827' }}>
              {transactions.reduce((sum, txn) => sum + txn.items_json.length, 0)}
            </h2>
          </div>
        </div>
      </div>

      {/* Sales List Panel */}
      <div className="panel" style={{ flex: 1, overflowY: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Recent Transactions</h2>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          <table>
            <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
              <tr>
                <th>Transaction ID</th>
                <th>Date & Time</th>
                <th>Items (Weight)</th>
                <th style={{ textAlign: 'right' }}>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(txn => (
                <tr key={txn.id}>
                  <td style={{ fontWeight: '500', color: '#4b5563' }}>#{txn.id.toString().padStart(4, '0')}</td>
                  <td style={{ color: '#6b7280' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={18} />
                      {formatDate(txn.date)}
                    </div>
                  </td>
                  <td style={{ color: '#4b5563' }}>
                    {txn.items_json.map(item => `${item.name} (${item.qty}kg)`).join(', ')}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#2563eb', fontSize: '18px' }}>
                    ${txn.total_amount.toFixed(2)}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ padding: '60px', textAlign: 'center', color: '#9ca3af', fontSize: '18px' }}>
                    No sales yet. Generate a bill to see it here!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
