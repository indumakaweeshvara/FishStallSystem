import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit2, Fish, Save, X, Package } from 'lucide-react';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '' });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    if (window.require) {
      const { ipcRenderer } = window.require('electron');
      const data = await ipcRenderer.invoke('get-products');
      setProducts(data || []);
      setFilteredProducts(data || []);
    }
  };

  useEffect(() => {
    const filtered = products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this fish type?')) {
      if (window.require) {
        const { ipcRenderer } = window.require('electron');
        await ipcRenderer.invoke('delete-product', id);
        loadProducts();
      }
    }
  };

  const startEditing = (p) => {
    setEditingId(p.id);
    setEditForm({ name: p.name });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (window.require) {
      const { ipcRenderer } = window.require('electron');
      await ipcRenderer.invoke('update-product', {
        id: editingId,
        name: editForm.name,
        default_rate: 0 // Keep rate 0 as it's hidden
      });
      setEditingId(null);
      loadProducts();
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (window.require) {
      const { ipcRenderer } = window.require('electron');
      await ipcRenderer.invoke('add-product', {
        name: newProduct.name,
        default_rate: 0
      });
      setShowAddModal(false);
      setNewProduct({ name: '' });
      loadProducts();
    }
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Fish Inventory</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage the list of fish types in your system</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={20} /> Add New Fish
        </button>
      </div>

      <div className="card" style={{ marginBottom: '24px', padding: '16px' }}>
        <div style={{ position: 'relative' }}>
          <input 
            type="text" 
            placeholder="Search fish name..." 
            className="input-field" 
            style={{ paddingLeft: '48px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th style={{ width: '100px' }}>ID</th>
              <th>Fish Name (මාළු වර්ගය)</th>
              <th style={{ width: '150px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(p => (
              <tr key={p.id}>
                <td style={{ color: 'var(--text-muted)', fontWeight: '600' }}>#{p.id}</td>
                <td>
                  {editingId === p.id ? (
                    <input 
                      type="text" 
                      className="input-field" 
                      style={{ padding: '8px 12px', fontSize: '14px' }}
                      value={editForm.name}
                      onChange={e => setEditForm({ name: e.target.value })}
                    />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ background: 'var(--primary-light)', padding: '8px', borderRadius: '8px' }}>
                        <Fish size={18} color="var(--primary)" />
                      </div>
                      <span style={{ fontWeight: '600' }}>{p.name}</span>
                    </div>
                  )}
                </td>
                <td>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                    {editingId === p.id ? (
                      <>
                        <button className="btn btn-primary" style={{ padding: '8px' }} onClick={handleUpdate} title="Save">
                          <Save size={18} />
                        </button>
                        <button className="btn-ghost" style={{ padding: '8px' }} onClick={() => setEditingId(null)} title="Cancel">
                          <X size={18} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="btn-ghost" style={{ padding: '8px' }} onClick={() => startEditing(p)} title="Edit">
                          <Edit2 size={18} color="var(--primary)" />
                        </button>
                        <button className="btn-ghost" style={{ padding: '8px' }} onClick={() => handleDelete(p.id)} title="Delete">
                          <Trash2 size={18} color="var(--danger)" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredProducts.length === 0 && (
          <div style={{ padding: '80px 0', textAlign: 'center' }}>
            <Package size={48} color="var(--border)" style={{ marginBottom: '16px' }} />
            <p style={{ color: 'var(--text-muted)' }}>No products found matching your search.</p>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
          <div className="card fade-in" style={{ width: '400px', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '20px' }}>Add New Fish</h2>
              <button className="btn-ghost" onClick={() => setShowAddModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label className="input-label">Fish Name (e.g. බලයා - Balaya)</label>
                <input 
                  type="text" 
                  className="input-field" 
                  required 
                  value={newProduct.name} 
                  onChange={e => setNewProduct({ name: e.target.value })} 
                  placeholder="Enter name..."
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '50px', marginTop: '8px' }}>
                Create Fish Type
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
