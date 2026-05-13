import React, { useState, useEffect } from 'react';
import { ReceiptText, Calendar, DollarSign, Package } from 'lucide-react';

export default function SalesReports() {
  const [transactions, setTransactions] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const [dailySales, setDailySales] = useState([]);

  useEffect(() => {
    if (window.require) {
      const { ipcRenderer } = window.require('electron');
      
      // Load recent transactions
      ipcRenderer.invoke('get-transactions')
        .then(data => {
          setTransactions(data);
          const revenue = data.reduce((sum, txn) => sum + txn.total_amount, 0);
          setTotalRevenue(revenue);
        })
        .catch(err => console.error("Error loading transactions:", err));
        
      // Load daily sales report
      ipcRenderer.invoke('get-sales-report')
        .then(data => setDailySales(data))
        .catch(err => console.error("Error loading daily sales:", err));
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ backgroundColor: 'var(--primary-light)', padding: '16px', borderRadius: '12px', color: 'var(--primary)' }}>
            <DollarSign size={32} />
          </div>
          <div>
            <p className="input-label">Total Revenue</p>
            <h2 style={{ fontSize: '28px', fontWeight: '800', margin: 0 }}>Rs. {totalRevenue.toFixed(2)}</h2>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ backgroundColor: '#f0fdf4', padding: '16px', borderRadius: '12px', color: '#16a34a' }}>
            <ReceiptText size={32} />
          </div>
          <div>
            <p className="input-label">Total Cash Collected</p>
            <h2 style={{ fontSize: '28px', fontWeight: '800', margin: 0, color: '#16a34a' }}>
              Rs. {transactions.reduce((sum, txn) => sum + (txn.paid_amount || 0), 0).toFixed(2)}
            </h2>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ backgroundColor: '#fef2f2', padding: '16px', borderRadius: '12px', color: '#dc2626' }}>
            <Calendar size={32} />
          </div>
          <div>
            <p className="input-label">Total Credit Given</p>
            <h2 style={{ fontSize: '28px', fontWeight: '800', margin: 0, color: '#dc2626' }}>
              Rs. {transactions.reduce((sum, txn) => sum + (txn.total_amount - (txn.paid_amount || 0)), 0).toFixed(2)}
            </h2>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ backgroundColor: '#faf5ff', padding: '16px', borderRadius: '12px', color: '#a855f7' }}>
            <Package size={32} />
          </div>
          <div>
            <p className="input-label">Total Transactions</p>
            <h2 style={{ fontSize: '28px', fontWeight: '800', margin: 0 }}>{transactions.length}</h2>
          </div>
        </div>
      </div>

      {/* Two Column Layout for Reports */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', flex: 1, overflow: 'hidden' }}>
        
        {/* Daily Sales Report */}
        <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Daily Sales Report</h2>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <table>
              <thead style={{ position: 'sticky', top: 0, zIndex: 1, background: 'var(--bg-body)' }}>
                <tr>
                  <th>DATE</th>
                  <th style={{ textAlign: 'right' }}>CASH (Rs.)</th>
                  <th style={{ textAlign: 'right' }}>CREDIT (Rs.)</th>
                  <th style={{ textAlign: 'right' }}>TOTAL SALES (Rs.)</th>
                </tr>
              </thead>
              <tbody>
                {dailySales.map((day, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: '600' }}>{day.sale_date}</td>
                    <td style={{ textAlign: 'right', color: '#16a34a', fontWeight: '600' }}>{day.daily_paid.toFixed(2)}</td>
                    <td style={{ textAlign: 'right', color: '#dc2626', fontWeight: '600' }}>{day.daily_credit.toFixed(2)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--primary)' }}>{day.daily_total.toFixed(2)}</td>
                  </tr>
                ))}
                {dailySales.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No daily sales recorded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Recent Invoices</h2>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <table>
              <thead style={{ position: 'sticky', top: 0, zIndex: 1, background: 'var(--bg-body)' }}>
                <tr>
                  <th>INV #</th>
                  <th>CUSTOMER</th>
                  <th style={{ textAlign: 'right' }}>PAID (Rs.)</th>
                  <th style={{ textAlign: 'right' }}>TOTAL (Rs.)</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(txn => {
                  return (
                    <tr key={txn.id}>
                      <td style={{ fontWeight: '600', color: 'var(--text-muted)' }}>#{txn.id.toString().padStart(4, '0')}</td>
                      <td>
                        <div style={{ fontWeight: '600' }}>{txn.customer_name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{formatDate(txn.date)}</div>
                      </td>
                      <td style={{ textAlign: 'right', color: '#16a34a', fontWeight: '600' }}>
                        {(txn.paid_amount || 0).toFixed(2)}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--primary)' }}>
                        {txn.total_amount.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No invoices yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
