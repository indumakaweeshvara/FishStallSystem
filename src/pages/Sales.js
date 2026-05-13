import React, { useState, useEffect } from 'react';
import { History, TrendingUp, DollarSign, Calendar, Eye, Download } from 'lucide-react';

export default function Sales() {
  const [transactions, setTransactions] = useState([]);
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [dailySales, setDailySales] = useState([]);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    if (window.require) {
      const { ipcRenderer } = window.require('electron');
      const data = await ipcRenderer.invoke('get-transactions');
      setTransactions(data);

      // Load daily sales report
      const dailyData = await ipcRenderer.invoke('get-sales-report');
      setDailySales(dailyData || []);
    }
  };

  // Calculate Stats
  const today = new Date().toLocaleDateString();
  const todaySales = transactions.filter(t => new Date(parseInt(t.id)).toLocaleDateString() === today || t.date.includes(today));
  const todayRevenue = todaySales.reduce((sum, t) => sum + t.total_amount, 0);
  const totalRevenue = transactions.reduce((sum, t) => sum + t.total_amount, 0);
  const totalCash = transactions.reduce((sum, txn) => sum + (txn.paid_amount || 0), 0);
  const totalCredit = transactions.reduce((sum, txn) => sum + (txn.total_amount - (txn.paid_amount || 0)), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* 1. Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ background: 'var(--primary-light)', padding: '12px', borderRadius: '12px' }}>
            <TrendingUp size={24} color="var(--primary)" />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>TOTAL REVENUE</p>
            <h3 style={{ fontSize: '20px', margin: 0 }}>Rs. {totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px', borderLeft: '4px solid var(--success)' }}>
          <div style={{ background: '#ecfdf5', padding: '12px', borderRadius: '12px' }}>
            <DollarSign size={24} color="var(--success)" />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>CASH COLLECTED</p>
            <h3 style={{ fontSize: '20px', margin: 0, color: 'var(--success)' }}>Rs. {totalCash.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px', borderLeft: '4px solid var(--danger)' }}>
          <div style={{ background: '#fef2f2', padding: '12px', borderRadius: '12px' }}>
            <Calendar size={24} color="var(--danger)" />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>TOTAL CREDIT GIVEN</p>
            <h3 style={{ fontSize: '20px', margin: 0, color: 'var(--danger)' }}>Rs. {totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px', borderLeft: '4px solid var(--warning)' }}>
          <div style={{ background: '#fffbeb', padding: '12px', borderRadius: '12px' }}>
            <History size={24} color="var(--warning)" />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>TOTAL INVOICES</p>
            <h3 style={{ fontSize: '20px', margin: 0 }}>{transactions.length} Invoices</h3>
          </div>
        </div>
      </div>

      {/* Two Column Layout for Reports */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', flex: 1, overflow: 'hidden' }}>
        
        {/* Daily Sales Report */}
        <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ margin: 0 }}>Daily Sales Report</h3>
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
                    <td style={{ textAlign: 'right', color: 'var(--success)', fontWeight: '600' }}>{day.daily_paid.toFixed(2)}</td>
                    <td style={{ textAlign: 'right', color: 'var(--danger)', fontWeight: '600' }}>{day.daily_credit.toFixed(2)}</td>
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
          <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Recent Invoices</h3>
            <button className="btn btn-ghost" style={{ fontSize: '14px' }}>
              <Download size={16} /> Export CSV
            </button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <table>
              <thead style={{ position: 'sticky', top: 0, zIndex: 1, background: 'var(--bg-body)' }}>
                <tr>
                  <th>INV #</th>
                  <th>CUSTOMER</th>
                  <th style={{ textAlign: 'right' }}>TOTAL (Rs.)</th>
                  <th style={{ textAlign: 'center' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: '600', color: 'var(--text-muted)' }}>#{t.id}</td>
                    <td>
                      <div style={{ fontWeight: '600' }}>{t.customer_name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(t.date).toLocaleDateString()}</div>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: '700', color: 'var(--primary)' }}>{t.total_amount.toFixed(2)}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button className="btn-ghost" onClick={() => setSelectedTxn(t)}>
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No sales records found yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* 3. Transaction Detail Modal */}
      {selectedTxn && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
          <div className="card fade-in" style={{ width: '600px', padding: 0 }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--primary)', color: 'white', borderRadius: '12px 12px 0 0' }}>
              <h3 style={{ margin: 0 }}>Transaction Details #{selectedTxn.id}</h3>
              <button className="btn-ghost" style={{ color: 'white' }} onClick={() => setSelectedTxn(null)}><X size={20} /></button>
            </div>
            
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div>
                  <p className="input-label">Customer</p>
                  <p style={{ fontWeight: '600' }}>{selectedTxn.customer_name}</p>
                </div>
                <div>
                  <p className="input-label">Date</p>
                  <p style={{ fontWeight: '600' }}>{selectedTxn.date}</p>
                </div>
              </div>

              <div className="table-container">
                <table>
                  <thead style={{ background: '#f8fafc' }}>
                    <tr>
                      <th>DESCRIPTION</th>
                      <th style={{ textAlign: 'right' }}>RATE</th>
                      <th style={{ textAlign: 'right' }}>QTY</th>
                      <th style={{ textAlign: 'right' }}>TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {JSON.parse(selectedTxn.items_json).map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.description}</td>
                        <td style={{ textAlign: 'right' }}>{item.rate.toFixed(2)}</td>
                        <td style={{ textAlign: 'right' }}>{item.qty.toFixed(3)}</td>
                        <td style={{ textAlign: 'right', fontWeight: '600' }}>Rs. {item.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: '24px', textAlign: 'right' }}>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '4px' }}>Grand Total</p>
                <h3 style={{ fontSize: '28px', color: 'var(--primary)' }}>Rs. {selectedTxn.total_amount.toFixed(2)}</h3>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Simple X icon replacement since I missed importing it
function X({ size, ...props }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}
