import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { AdminAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import {
  ArrowLeft, LogOut, Plus, Save, Trash2, X, Edit2,
} from 'lucide-react';

const CATEGORIES = ['base', 'sauce', 'cheese', 'vegetable'];

const InventoryManagement = () => {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ total: 0, lowStock: 0, outOfStock: 0 });
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [newItem, setNewItem] = useState({
    name: '', category: 'base', description: '', quantity: 100, pricePerUnit: 0, threshold: 20,
  });

  const fetchInventory = async () => {
    try {
      const { data } = await AdminAPI.get('/inventory/admin/all');
      setItems(data.items || []);
      setStats(data.stats || {});
    } catch (err) {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInventory(); }, []);

  const filtered = activeCategory === 'all'
    ? items
    : items.filter((i) => i.category === activeCategory);

  const getStockClass = (item) => {
    if (item.quantity === 0) return 'critical';
    if (item.quantity <= item.threshold) return 'low';
    return 'good';
  };

  const handleUpdateStock = async (id) => {
    const qty = parseInt(editValue);
    if (isNaN(qty) || qty < 0) {
      toast.error('Enter a valid quantity');
      return;
    }
    try {
      await AdminAPI.put(`/inventory/${id}`, { quantity: qty });
      toast.success('Stock updated');
      setEditingId(null);
      fetchInventory();
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      await AdminAPI.post('/inventory', newItem);
      toast.success('Item added');
      setShowAddModal(false);
      setNewItem({ name: '', category: 'base', description: '', quantity: 100, pricePerUnit: 0, threshold: 20 });
      fetchInventory();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add item');
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await AdminAPI.delete(`/inventory/${id}`);
      toast.success('Item deleted');
      fetchInventory();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const handleLogout = () => { logout(); navigate('/admin/login'); };

  if (loading) {
    return <div className="page-loader" style={{ paddingTop: 80 }}><div className="spinner"></div></div>;
  }

  return (
    <div className="dashboard-page" style={{ paddingTop: 'var(--space-xl)' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
            <Link to="/admin/dashboard" style={{ color: 'var(--text-secondary)' }}>
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem' }}>
                📦 Inventory Management
              </h1>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {stats.total} items · {stats.lowStock} low stock · {stats.outOfStock} out of stock
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
              <Plus size={16} /> Add Item
            </button>
            <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="tabs">
          <button className={`tab ${activeCategory === 'all' ? 'active' : ''}`} onClick={() => setActiveCategory('all')}>
            All ({items.length})
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`tab ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}s ({items.filter((i) => i.category === cat).length})
            </button>
          ))}
        </div>

        {/* Inventory Table */}
        <div className="glass-card" style={{ padding: 'var(--space-md)', overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Threshold</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item._id}>
                  <td style={{ fontWeight: 600 }}>{item.name}</td>
                  <td style={{ textTransform: 'capitalize' }}>{item.category}</td>
                  <td>
                    {editingId === item._id ? (
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        <input
                          type="number"
                          className="form-input"
                          style={{ width: 80, padding: '6px 8px', fontSize: '0.85rem' }}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          min="0"
                          autoFocus
                        />
                        <button className="btn btn-primary btn-sm" style={{ padding: '6px 8px' }} onClick={() => handleUpdateStock(item._id)}>
                          <Save size={14} />
                        </button>
                        <button className="btn btn-secondary btn-sm" style={{ padding: '6px 8px' }} onClick={() => setEditingId(null)}>
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <span>{item.quantity} {item.unit}</span>
                    )}
                  </td>
                  <td>{item.threshold}</td>
                  <td>₹{item.pricePerUnit}</td>
                  <td>
                    <span className={`stock-badge ${getStockClass(item)}`}>
                      {item.quantity === 0 ? 'Out of Stock' : item.quantity <= item.threshold ? 'Low' : 'Good'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '6px 8px' }}
                        onClick={() => { setEditingId(item._id); setEditValue(item.quantity.toString()); }}
                        title="Edit stock"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        style={{ padding: '6px 8px' }}
                        onClick={() => handleDelete(item._id, item.name)}
                        title="Delete item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Item Modal */}
        {showAddModal && (
          <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowAddModal(false)}>
            <div className="glass-card modal-content">
              <div className="modal-header">
                <h3 className="heading-md">Add New Item</h3>
                <button className="modal-close" onClick={() => setShowAddModal(false)}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddItem}>
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input className="form-input" type="text" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-input" value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input className="form-input" type="text" value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-md)' }}>
                  <div className="form-group">
                    <label className="form-label">Quantity</label>
                    <input className="form-input" type="number" min="0" value={newItem.quantity} onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price (₹)</label>
                    <input className="form-input" type="number" min="0" value={newItem.pricePerUnit} onChange={(e) => setNewItem({ ...newItem, pricePerUnit: parseInt(e.target.value) || 0 })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Threshold</label>
                    <input className="form-input" type="number" min="0" value={newItem.threshold} onChange={(e) => setNewItem({ ...newItem, threshold: parseInt(e.target.value) || 0 })} />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  <Plus size={18} /> Add Item
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryManagement;
