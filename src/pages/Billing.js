import React, { useState, useEffect, useRef } from 'react';
import { Plus, User, Search, X, Trash2, ShoppingCart, Receipt, Fish } from 'lucide-react';
import { generateProfessionalInvoice } from '../utils/pdfGenerator';

export default function Billing() {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState({});
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState({ id: 0, name: 'Walk-in Customer' });
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '' });

  const [cart, setCart] = useState([]);
  const [itemEntry, setItemEntry] = useState({ description: '', rate: '', qty: '' });
  
  const descriptionRef = useRef(null);
  const rateRef = useRef(null);
  const qtyRef = useRef(null);

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

  const handleCustomerSearch = (term) => {
    setSearchTerm(term);
    if (term.trim() === '') {
      setFilteredCustomers([]);
      setShowDropdown(false);
    } else {
      const filtered = customers.filter(c => 
        c.name.toLowerCase().includes(term.toLowerCase()) || 
        c.phone.includes(term)
      );
      setFilteredCustomers(filtered);
      setShowDropdown(true);
    }
  };

  const handleProductSearch = (term) => {
    setItemEntry({ ...itemEntry, description: term });
    if (term.trim() === '') {
      setFilteredProducts(products); // Show all products when empty
      setShowProductDropdown(true);
    } else {
      const filtered = products.filter(p => 
        p.name.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredProducts(filtered);
      setShowProductDropdown(true);
    }
  };

  const selectProduct = (prod) => {
    setItemEntry({
      ...itemEntry,
      description: prod.name,
      rate: '' // Keep rate empty for manual entry
    });
    setShowProductDropdown(false);
    rateRef.current.focus(); // Focus rate field for manual entry
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

  const addToCart = () => {
    if (!itemEntry.description || !itemEntry.rate || !itemEntry.qty) return;
    const newItem = {
      id: Date.now(),
      description: itemEntry.description,
      rate: parseFloat(itemEntry.rate),
      qty: parseFloat(itemEntry.qty),
      amount: parseFloat(itemEntry.rate) * parseFloat(itemEntry.qty)
    };
    setCart([...cart, newItem]);
    setItemEntry({ description: '', rate: '', qty: '' });
    descriptionRef.current.focus();
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const grandTotal = cart.reduce((sum, item) => sum + item.amount, 0);

  const handleGenerateBill = async () => {
    if (cart.length === 0) return;
    
    if (window.require) {
      const { ipcRenderer } = window.require('electron');
      const transaction = {
        customer_id: selectedCustomer.id || 0,
        total_amount: grandTotal,
        items: cart
      };
      try {
        const result = await ipcRenderer.invoke('save-transaction', transaction);
        // Generate PDF Document with Real Transaction ID and Settings
        generateProfessionalInvoice(cart, grandTotal, selectedCustomer, result.id, settings);
        alert(`SUCCESS! Invoice #${result.id} generated.`);
        setCart([]);
        setSelectedCustomer({ id: 0, name: 'Walk-in Customer' });
        if (descriptionRef.current) descriptionRef.current.focus();
      } catch (err) {
        alert('Error saving transaction: ' + err.message);
      }
    }
  };

  const handleQtyKeyDown = (e) => {
    if (e.key === 'Enter') addToCart();
  };

  useEffect(() => {
    const handleGlobalKeys = (e) => {
      if (e.key === 'F5') {
        e.preventDefault();
        handleGenerateBill();
      }
    };
    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, [cart, grandTotal, selectedCustomer]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. TOP SECTION: Item Entry (Full Width) */}
      <div className="card fade-in" style={{ display: 'grid', gridTemplateColumns: '4fr 2fr 2fr 140px', gap: '24px', alignItems: 'end', position: 'relative', zIndex: 100 }}>
        <div style={{ position: 'relative' }}>
          <label className="input-label">FISH DESCRIPTION (මාළු වර්ගය)</label>
          <input 
            ref={descriptionRef}
            type="text" 
            placeholder="e.g. Thalapath" 
            className="input-field" 
            value={itemEntry.description}
            onChange={e => handleProductSearch(e.target.value)}
            onFocus={() => handleProductSearch(itemEntry.description)}
          />
          {showProductDropdown && filteredProducts.length > 0 && (
            <div className="card" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 999, marginTop: '8px', padding: '8px', maxHeight: '300px', overflowY: 'auto', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', border: '1px solid var(--primary)' }}>
              {filteredProducts.map(p => (
                <div key={p.id} style={{ padding: '12px 16px', cursor: 'pointer', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9' }} onClick={() => selectProduct(p)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Fish size={16} color="var(--primary)" />
                    <span style={{ fontWeight: '600' }}>{p.name}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <label className="input-label">RATE Rs. (මිල)</label>
          <input 
            ref={rateRef}
            type="number" 
            placeholder="0.00" 
            className="input-field" 
            value={itemEntry.rate}
            onChange={e => setItemEntry({...itemEntry, rate: e.target.value})}
          />
        </div>
        <div>
          <label className="input-label">QTY Kg (ප්‍රමාණය)</label>
          <input 
            ref={qtyRef}
            type="number" 
            placeholder="0.000" 
            className="input-field" 
            value={itemEntry.qty}
            onChange={e => setItemEntry({...itemEntry, qty: e.target.value})}
            onKeyDown={handleQtyKeyDown}
          />
        </div>
        <button className="btn btn-primary" style={{ height: '54px', width: '100%' }} onClick={addToCart}>ADD TO CART</button>
      </div>

      {/* 2. BOTTOM SECTION: Cart and Checkout (Split Layout) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '24px', flex: 1 }}>
        
        {/* Cart Card */}
        <div className="card fade-in" style={{ padding: 0, display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingCart size={20} color="var(--primary)" /> Shopping Cart
            </h3>
            <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '700' }}>
              {cart.length} Items
            </span>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>DESCRIPTION</th>
                  <th style={{ textAlign: 'right' }}>RATE</th>
                  <th style={{ textAlign: 'right' }}>QTY</th>
                  <th style={{ textAlign: 'right' }}>AMOUNT</th>
                  <th style={{ width: '60px' }}></th>
                </tr>
              </thead>
              <tbody>
                {cart.map(item => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: '600' }}>{item.description}</td>
                    <td style={{ textAlign: 'right' }}>Rs. {item.rate.toFixed(2)}</td>
                    <td style={{ textAlign: 'right' }}>{item.qty.toFixed(3)} Kg</td>
                    <td style={{ textAlign: 'right', fontWeight: '700', color: 'var(--primary)' }}>Rs. {item.amount.toFixed(2)}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button className="btn-ghost" style={{ padding: '8px', border: 'none', borderRadius: '8px' }} onClick={() => removeFromCart(item.id)}>
                        <Trash2 size={18} color="var(--danger)" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {cart.length === 0 && (
              <div style={{ padding: '80px 0', textAlign: 'center' }}>
                <ShoppingCart size={48} color="#e2e8f0" style={{ marginBottom: '16px' }} />
                <p style={{ color: 'var(--text-muted)' }}>No items in cart.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Customer & Checkout */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Customer Card */}
          <div className="card fade-in">
            <label className="input-label">Customer Details</label>
            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <input 
                type="text" 
                placeholder="Search..." 
                className="input-field" 
                style={{ paddingLeft: '40px', fontSize: '14px' }}
                value={searchTerm} 
                onChange={(e) => handleCustomerSearch(e.target.value)} 
                onFocus={() => searchTerm && setShowDropdown(true)}
              />
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              
              {showDropdown && (
                <div className="card" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, marginTop: '8px', padding: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                  <div style={{ padding: '10px 12px', cursor: 'pointer', borderRadius: '8px', fontWeight: '600', color: 'var(--primary)' }} onClick={() => { setSelectedCustomer({ id: 0, name: 'Walk-in Customer' }); setShowDropdown(false); setSearchTerm(''); }}>
                    Walk-in Customer
                  </div>
                  {filteredCustomers.map(c => (
                    <div key={c.id} style={{ padding: '10px 12px', cursor: 'pointer', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }} onClick={() => { setSelectedCustomer(c); setShowDropdown(false); setSearchTerm(''); }}>
                      <span style={{ fontWeight: '600' }}>{c.name}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{c.phone}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--primary-light)', borderRadius: '10px', border: '1px solid #dbeafe' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <User size={16} color="var(--primary)" />
                <span style={{ fontWeight: '700', color: '#1e40af', fontSize: '14px' }}>{selectedCustomer.name}</span>
              </div>
              <button className="btn-ghost" style={{ padding: '4px', height: 'auto' }} onClick={() => setShowModal(true)}>
                <Plus size={18} color="var(--primary)" />
              </button>
            </div>
          </div>

          {/* Total & Checkout Card */}
          <div className="card fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'var(--primary)', color: 'white', border: 'none' }}>
            <div>
              <h3 style={{ fontSize: '14px', opacity: 0.8, fontWeight: '500', marginBottom: '8px' }}>GRAND TOTAL</h3>
              <div style={{ fontSize: '36px', fontWeight: '800', fontFamily: 'Outfit' }}>
                <span style={{ fontSize: '18px', fontWeight: '600', marginRight: '4px' }}>Rs.</span>
                {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '12px', textAlign: 'center' }}>
                Press **F5** for Quick Billing
              </div>
              <button 
                className="btn" 
                style={{ width: '100%', height: '56px', background: 'white', color: 'var(--primary)', fontSize: '16px', fontWeight: '800' }}
                disabled={cart.length === 0}
                onClick={handleGenerateBill}
              >
                <Receipt size={20} /> GENERATE BILL
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Customer Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
          <div className="card fade-in" style={{ width: '360px', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '20px' }}>New Customer</h2>
              <button className="btn-ghost" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Customer Name</label>
                <input type="text" className="input-field" style={{ fontSize: '14px' }} required value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Phone Number</label>
                <input type="text" className="input-field" style={{ fontSize: '14px' }} required value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>Create & Select</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
