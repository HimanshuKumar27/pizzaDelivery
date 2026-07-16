import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { AdminAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import { ArrowLeft, LogOut, RefreshCw } from 'lucide-react';

const STATUSES = ['Order Received', 'In Kitchen', 'Sent to Delivery', 'Delivered'];

const OrderManagement = () => {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [updating, setUpdating] = useState(null);

  const fetchOrders = async () => {
    try {
      const params = filterStatus ? `?status=${encodeURIComponent(filterStatus)}&limit=50` : '?limit=50';
      const { data } = await AdminAPI.get(`/orders/admin/all${params}`);
      setOrders(data.orders || []);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [filterStatus]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      await AdminAPI.put(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Status updated to "${newStatus}"`);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(null);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Order Received': return 'received';
      case 'In Kitchen': return 'kitchen';
      case 'Sent to Delivery': return 'delivery';
      case 'Delivered': return 'delivered';
      default: return '';
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
                📋 Order Management
              </h1>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {orders.length} order{orders.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <button className="btn btn-secondary btn-sm" onClick={fetchOrders}>
              <RefreshCw size={16} /> Refresh
            </button>
            <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="tabs">
          <button className={`tab ${filterStatus === '' ? 'active' : ''}`} onClick={() => setFilterStatus('')}>
            All
          </button>
          {STATUSES.map((s) => (
            <button key={s} className={`tab ${filterStatus === s ? 'active' : ''}`} onClick={() => setFilterStatus(s)}>
              {s}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="empty-state">
            <span className="empty-emoji">📭</span>
            <h3>No orders found</h3>
            <p>Orders will appear here as customers place them.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
            {orders.map((order) => (
              <div key={order._id} className="glass-card" style={{ padding: 'var(--space-lg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-md)', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
                  <div>
                    <span className="order-id" style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                      #{order._id.slice(-8).toUpperCase()}
                    </span>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span className={`order-status-badge ${getStatusBadgeClass(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                {/* Customer Info */}
                <div style={{ marginBottom: 'var(--space-md)', fontSize: '0.9rem' }}>
                  <p><span style={{ color: 'var(--text-muted)' }}>Customer:</span> {order.user?.name} ({order.user?.email})</p>
                  <p><span style={{ color: 'var(--text-muted)' }}>Address:</span> {order.deliveryAddress}</p>
                  <p><span style={{ color: 'var(--text-muted)' }}>Amount:</span>{' '}
                    <span style={{ color: 'var(--accent-warm)', fontWeight: 700 }}>₹{order.totalAmount}</span>
                  </p>
                </div>

                {/* Pizza Items */}
                <div style={{ marginBottom: 'var(--space-md)' }}>
                  {order.items.map((pizza, idx) => (
                    <div
                      key={idx}
                      style={{
                        fontSize: '0.85rem',
                        padding: 'var(--space-sm)',
                        background: 'var(--bg-glass)',
                        borderRadius: 'var(--radius-sm)',
                        marginBottom: 'var(--space-xs)',
                      }}
                    >
                      <strong>Pizza {idx + 1}:</strong>{' '}
                      {pizza.base?.name} · {pizza.sauce?.name} · {pizza.cheese?.name}
                      {pizza.vegetables?.length > 0 && ` · ${pizza.vegetables.map((v) => v.name).join(', ')}`}
                    </div>
                  ))}
                </div>

                {/* Status Update */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Update Status:</span>
                  <div style={{ display: 'flex', gap: 'var(--space-xs)', flexWrap: 'wrap' }}>
                    {STATUSES.map((s) => (
                      <button
                        key={s}
                        className={`btn btn-sm ${order.status === s ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => handleStatusUpdate(order._id, s)}
                        disabled={updating === order._id || order.status === s}
                        style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderManagement;
