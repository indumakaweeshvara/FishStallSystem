import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  User, 
  Search, 
  X, 
  Trash2, 
  ShoppingCart, 
  Printer, 
  Fish, 
  ChevronRight, 
  Package,
  CreditCard,
  History
} from 'lucide-react';
import { generateProfessionalInvoice } from '../utils/pdfGenerator';

export default function Billing() {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState({});
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  
  const [selectedCustomer, setSelectedCustomer] = useState({ id: 0, name: 'Walk-in Customer' });
  const [showCustDropdown, setShowCustDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '' });
  const [newProduct, setNewProduct] = useState({ name: '', default_rate: '' });

  const [cart, setCart] = useState([]);
  const [itemEntry, setItemEntry] = useState({ description: '', symbol: '-', rate: '', qty: '', units: '' });
  const [paidAmount, setPaidAmount] = useState('');
  const [advanceAmount, setAdvanceAmount] = useState('');
  
  const rateRef = useRef(null);
  const qtyRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (window.require) {
      try {
        const { ipcRenderer } = window.require('electron');
        const custData = await ipcRenderer.invoke('get-customers');
        const prodData = await ipcRenderer.invoke('get-products');
        const settingsData = await ipcRenderer.invoke('get-settings');
        setCustomers(custData || []);
        setProducts(prodData || []);
        setSettings(settingsData || {});
      } catch (err) {
        console.error("LOAD DATA ERROR:", err);
      }
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const selectProduct = (prod) => {
    setItemEntry({
      ...itemEntry,
      description: prod.name,
      rate: prod.default_rate || ''
    });
    setTimeout(() => rateRef.current?.focus(), 100);
  };

  const addToCart = () => {
    if (!itemEntry.description || !itemEntry.rate || !itemEntry.qty) return;
    const newItem = {
      id: Date.now(),
      description: itemEntry.description,
      symbol: itemEntry.symbol || '-',
      rate: parseFloat(itemEntry.rate),
      qty: parseFloat(itemEntry.qty),
      units: itemEntry.units || '-',
      amount: parseFloat(itemEntry.rate) * parseFloat(itemEntry.qty)
    };
    setCart([...cart, newItem]);
    setItemEntry({ description: '', symbol: '-', rate: '', qty: '', units: '' });
    setProductSearch('');
    searchRef.current?.focus();
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const grandTotal = cart.reduce((sum, item) => sum + item.amount, 0);

  const handleGenerateBill = async () => {
    if (cart.length === 0) return;
    
    let actualPaid = paidAmount === '' 
      ? (selectedCustomer.id === 0 ? grandTotal : 0) 
      : parseFloat(paidAmount);

    if (window.require) {
      const { ipcRenderer } = window.require('electron');
      const transaction = {
        customer_id: selectedCustomer.id || 0,
        total_amount: grandTotal,
        paid_amount: actualPaid,
        items: cart
      };
      try {
        const result = await ipcRenderer.invoke('save-transaction', transaction);
        generateProfessionalInvoice(cart, grandTotal, selectedCustomer, result.id, settings, actualPaid, parseFloat(advanceAmount) || 0);
        setCart([]);
        setPaidAmount('');
        setAdvanceAmount('');
        setSelectedCustomer({ id: 0, name: 'Walk-in Customer' });
        searchRef.current?.focus();
      } catch (err) {
        alert('Error saving transaction: ' + err.message);
      }
    }
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    if (window.require) {
      const { ipcRenderer } = window.require('electron');
      const result = await ipcRenderer.invoke('add-customer', newCustomer);
      const added = { id: result.id, ...newCustomer };
      setSelectedCustomer(added);
      setShowModal(false);
      setNewCustomer({ name: '', phone: '' });
      loadData();
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (window.require) {
      const { ipcRenderer } = window.require('electron');
      await ipcRenderer.invoke('add-product', {
        name: newProduct.name,
        default_rate: parseFloat(newProduct.default_rate) || 0
      });
      setShowProductModal(false);
      setNewProduct({ name: '', default_rate: '' });
      loadData();
    }
  };

  return (
    <div className="pos-layout fade-in">
      
      {/* 1. LEFT PANEL: Product Picker (List Style) */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px', background: 'var(--surface)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)' }}>
            <Package size={20} /> All Fish Types
          </h3>
          <button className="btn-ghost" style={{ padding: '6px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px' }} onClick={() => setShowProductModal(true)}>
            <Plus size={18} color="#10b981" />
          </button>
        </div>
        
        <div style={{ position: 'relative', marginBottom: '10px' }}>
          <input 
            ref={searchRef}
            type="text" 
            placeholder="Quick search fish..." 
            className="input-field" 
            style={{ padding: '12px 15px 12px 40px', fontSize: '14px', borderRadius: '12px' }}
            value={productSearch}
            onChange={e => setProductSearch(e.target.value)}
          />
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', alignContent: 'start', paddingRight: '4px' }}>
          {filteredProducts.map(p => (
            <div 
              key={p.id} 
              style={{ 
                padding: '6px 10px', 
                background: itemEntry.description === p.name ? 'var(--primary)' : 'var(--background)', 
                color: itemEntry.description === p.name ? 'white' : 'var(--text-main)',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'all 0.1s ease',
                border: itemEntry.description === p.name ? 'none' : '1px solid var(--border)',
                height: 'fit-content'
              }}
              className="product-list-item"
              onClick={() => selectProduct(p)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                < Fish size={14} color={itemEntry.description === p.name ? 'white' : '#10b981'} />
                <span style={{ fontWeight: '600', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100px' }}>{p.name}</span>
              </div>
            </div>
          ))}
          {filteredProducts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', opacity: 0.5 }}>
              <Search size={32} style={{ marginBottom: '10px' }} />
              <p>No fish found</p>
            </div>
          )}
        </div>
      </div>

      {/* 2. CENTER PANEL: Cart & Entry */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Quick Entry Bar */}
        <div className="card glass-card" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.6fr 1fr 1fr 0.8fr 90px', gap: '8px', padding: '16px', alignItems: 'end' }}>
          <div>
            <label className="input-label" style={{ fontSize: '11px' }}>Description</label>
            <input type="text" className="input-field" style={{ fontSize: '14px', padding: '10px' }} value={itemEntry.description} readOnly placeholder="Select Fish..." />
          </div>
          <div>
            <label className="input-label" style={{ fontSize: '11px' }}>Symbol</label>
            <select className="input-field" style={{ fontSize: '14px', padding: '10px' }} value={itemEntry.symbol} onChange={e => setItemEntry({...itemEntry, symbol: e.target.value})}>
              {['-', 'P', 'L', 'X', 'XX', '.', 'B', 'O', 'පටි', 'A', 'B+', 'A+', 'රිටන්', 'M', 'K', 'මුර'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="input-label" style={{ fontSize: '11px' }}>Rate</label>
            <input ref={rateRef} type="number" className="input-field" style={{ fontSize: '14px', padding: '10px' }} value={itemEntry.rate} onChange={e => setItemEntry({...itemEntry, rate: e.target.value})} placeholder="0.00" />
          </div>
          <div>
            <label className="input-label" style={{ fontSize: '11px' }}>Qty</label>
            <input ref={qtyRef} type="number" className="input-field" style={{ fontSize: '14px', padding: '10px' }} value={itemEntry.qty} onChange={e => setItemEntry({...itemEntry, qty: e.target.value})} onKeyDown={e => e.key === 'Enter' && addToCart()} placeholder="0.000" />
          </div>
          <div>
            <label className="input-label" style={{ fontSize: '11px' }}>Unit</label>
            <input 
              type="text" 
              className="input-field" 
              style={{ fontSize: '14px', padding: '10px' }} 
              value={itemEntry.units} 
              onChange={e => setItemEntry({...itemEntry, units: e.target.value})} 
              placeholder=""
            />
          </div>
          <button className="btn btn-primary" style={{ height: '42px', borderRadius: '10px', background: '#10b981', minWidth: '90px' }} onClick={addToCart}>
            <span style={{ fontWeight: '800', fontSize: '13px', letterSpacing: '0.5px' }}>ADD</span>
          </button>
        </div>

        {/* Cart Table */}
        <div className="cart-table-container" style={{ flex: 1 }}>
          <div className="cart-table-header">
            <h3 style={{ fontSize: '16px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingCart size={18} color="var(--primary)" /> Cart Items
              <span className="badge badge-primary">{cart.length}</span>
            </h3>
            {cart.length > 0 && <button className="btn-ghost" style={{ fontSize: '12px', color: 'var(--danger)' }} onClick={() => setCart([])}>Clear All</button>}
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <table style={{ borderCollapse: 'separate', borderSpacing: '0 8px' }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 1, background: 'var(--surface)' }}>
                <tr>
                  <th style={{ paddingLeft: '24px' }}>Item</th>
                  <th>Symbol</th>
                  <th style={{ textAlign: 'right' }}>Rate</th>
                  <th style={{ textAlign: 'right' }}>Qty</th>
                  <th style={{ textAlign: 'right', paddingRight: '24px' }}>Total</th>
                  <th style={{ width: '50px' }}></th>
                </tr>
              </thead>
              <tbody style={{ padding: '0 12px' }}>
                {cart.map(item => (
                  <tr key={item.id} className="bill-item-row" style={{ background: 'var(--background)' }}>
                    <td style={{ paddingLeft: '24px', borderRadius: '12px 0 0 12px', fontWeight: '600' }}>{item.description}</td>
                    <td><span className="badge badge-primary">{item.symbol}</span></td>
                    <td style={{ textAlign: 'right' }}>{item.rate.toFixed(2)}</td>
                    <td style={{ textAlign: 'right', fontWeight: '700' }}>{item.qty.toFixed(3)}</td>
                    <td style={{ textAlign: 'right', paddingRight: '24px', fontWeight: '800', color: 'var(--primary)' }}>{item.amount.toFixed(2)}</td>
                    <td style={{ borderRadius: '0 12px 12px 0' }}>
                      <button className="btn-ghost" onClick={() => removeFromCart(item.id)}><Trash2 size={16} color="var(--danger)" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {cart.length === 0 && (
              <div style={{ padding: '60px 0', textAlign: 'center', opacity: 0.3 }}>
                <Package size={48} style={{ marginBottom: '12px' }} />
                <p>Cart is empty</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. RIGHT PANEL: Checkout */}
      <div className="checkout-section fade-in">
        <div style={{ marginBottom: '10px' }}>
          <label className="input-label">Customer</label>
          <div style={{ position: 'relative' }}>
            <div 
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--primary-light)', borderRadius: '12px', border: '1.5px solid var(--primary)', cursor: 'pointer' }}
              onClick={() => setShowCustDropdown(!showCustDropdown)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <User size={18} color="var(--primary)" />
                <span style={{ fontWeight: '700', color: 'var(--primary)' }}>{selectedCustomer.name}</span>
              </div>
              <Plus size={18} color="var(--primary)" onClick={(e) => { e.stopPropagation(); setShowModal(true); }} />
            </div>

            {showCustDropdown && (
              <div className="card shadow-lg" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, marginTop: '8px', padding: '8px', maxHeight: '250px', overflowY: 'auto' }}>
                <div 
                  className="nav-item" 
                  style={{ cursor: 'pointer', borderBottom: '1px solid var(--border)' }}
                  onClick={() => { setSelectedCustomer({ id: 0, name: 'Walk-in Customer' }); setShowCustDropdown(false); }}
                >
                  Walk-in Customer
                </div>
                {customers.map(c => (
                  <div 
                    key={c.id} 
                    className="nav-item" 
                    style={{ cursor: 'pointer', justifyContent: 'space-between' }}
                    onClick={() => { setSelectedCustomer(c); setShowCustDropdown(false); }}
                  >
                    <span>{c.name}</span>
                    <span style={{ fontSize: '11px', opacity: 0.5 }}>{c.phone}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={`total-display ${grandTotal > 0 ? 'pulse-total' : ''}`} style={{ padding: '20px', borderRadius: '16px' }}>
          <div style={{ opacity: 0.8, fontSize: '11px', fontWeight: '700', letterSpacing: '1px', marginBottom: '2px' }}>GRAND TOTAL</div>
          <div style={{ fontSize: '32px', fontWeight: '800', fontFamily: 'Outfit' }}>
            <span style={{ fontSize: '16px', marginRight: '4px' }}>Rs.</span>
            {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
            <div style={{ background: 'var(--background)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <label className="input-label" style={{ fontSize: '10px', marginBottom: '4px' }}>Advance Amount (Rs.)</label>
              <input 
                type="number" 
                className="input-field" 
                style={{ padding: '4px', fontSize: '18px', fontWeight: '800', textAlign: 'right', border: 'none', background: 'transparent' }}
                placeholder="0.00"
                value={advanceAmount}
                onChange={e => setAdvanceAmount(e.target.value)}
              />
            </div>
          </div>

          <div style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(37, 99, 235, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', opacity: 0.7, fontWeight: '600' }}>Balance to Pay</span>
            <span style={{ fontWeight: '900', color: 'var(--primary)', fontSize: '22px' }}>
              Rs. {(grandTotal - (parseFloat(advanceAmount) || 0)).toFixed(2)}
            </span>
          </div>

            <button 
              className="btn btn-primary btn-checkout" 
              style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)', color: 'white', border: 'none', boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)', height: '50px' }}
              disabled={cart.length === 0}
              onClick={handleGenerateBill}
            >
              <Printer size={20} /> PRINT INVOICE
            </button>
            
            {settings.stall_logo && (
              <div style={{ textAlign: 'center', marginTop: '15px' }}>
                <img 
                  src={settings.stall_logo} 
                  alt="Stall Logo" 
                  style={{ width: '180px', height: 'auto', borderRadius: '15px', opacity: 1, filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.15))' }} 
                />
              </div>
            )}
          
          <div style={{ textAlign: 'center', fontSize: '11px', opacity: 0.5 }}>
            <History size={12} style={{ marginRight: '4px' }} />
            Press <strong>F5</strong> for instant billing
          </div>
        </div>
      </div>

      {/* MODALS */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="card fade-in" style={{ width: '380px', padding: '32px', borderRadius: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '20px' }}>New Customer</h2>
              <button className="btn-ghost" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Full Name</label>
                <input type="text" className="input-field" required value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Phone Number</label>
                <input type="text" className="input-field" required value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '50px' }}>Save Customer</button>
            </form>
          </div>
        </div>
      )}

      {showProductModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="card fade-in" style={{ width: '380px', padding: '32px', borderRadius: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '20px' }}>New Fish Type</h2>
              <button className="btn-ghost" onClick={() => setShowProductModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Fish Name (English/Sinhala)</label>
                <input type="text" className="input-field" required placeholder="e.g. බලයා - Balaya" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Default Rate (Optional)</label>
                <input type="number" className="input-field" value={newProduct.default_rate} onChange={e => setNewProduct({...newProduct, default_rate: e.target.value})} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '50px' }}>Add to System</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
