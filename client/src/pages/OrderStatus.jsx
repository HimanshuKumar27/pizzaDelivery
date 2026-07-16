import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../utils/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ArrowLeft, Check, Clock, ChefHat, Truck, Package } from 'lucide-react';

const STATUSES = ['Order Received', 'In Kitchen', 'Sent to Delivery', 'Delivered'];

const STATUS_ICONS = {
  'Order Received': <Package size={16} />,
  'In Kitchen': <ChefHat size={16} />,
  'Sent to Delivery': <Truck size={16} />,
  'Delivered': <Check size={16} />,
};

const OrderStatus = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    try {
      const { data } = await API.get(`/orders/${id}`);
      setOrder(data.order);
    } catch (err) {
      console.error('Failed to fetch order:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();

    // Poll every 10 seconds for status updates
    const interval = setInterval(fetchOrder, 10000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="page-loader" style={{ paddingTop: 80 }}>
          <div className="spinner"></div>
        </div>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Navbar />
        <div className="dashboard-page">
          <div className="container">
            <div className="empty-state">
              <span className="empty-emoji">🔍</span>
              <h3>Order Not Found</h3>
              <p>This order doesn't exist or you don't have access.</p>
              <Link to="/dashboard" className="btn btn-primary">
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  const currentIdx = STATUSES.indexOf(order.status);
  const progressPercent = currentIdx >= 0 ? (currentIdx / (STATUSES.length - 1)) * 100 : 0;

  return (
    <>
      <Navbar />
      <div className="dashboard-page">
        <div className="container" style={{ maxWidth: 800 }}>
          <Link
            to="/dashboard"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-xs)',
              color: 'var(--text-secondary)',
              marginBottom: 'var(--space-lg)',
              fontSize: '0.9rem',
              paddingTop: 'var(--space-lg)',
            }}
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>

          <div className="animate-fade-in">
            <h1 className="heading-lg" style={{ marginBottom: 'var(--space-xs)' }}>
              Order #{order._id.slice(-8).toUpperCase()}
            </h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-xl)' }}>
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>

          {/* Status Tracker */}
          <div className="glass-card" style={{ padding: 'var(--space-xl)', marginBottom: 'var(--space-xl)' }}>
            <h3 className="heading-md" style={{ marginBottom: 'var(--space-sm)', textAlign: 'center' }}>
              {order.status === 'Delivered' ? '✅ Delivered!' : '📍 Order Status'}
            </h3>
            {order.status !== 'Delivered' && (
              <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 'var(--space-md)' }}>
                <Clock size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                Auto-refreshes every 10 seconds
              </p>
            )}

            <div className="status-tracker">
              <div className="progress-fill" style={{ width: `${progressPercent}%` }} />

              {STATUSES.map((status, i) => {
                const isCompleted = i < currentIdx;
                const isActive = i === currentIdx;

                return (
                  <div key={status} className="status-step">
                    <div
                      className={`status-dot ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                    >
                      {isCompleted ? <Check size={14} /> : STATUS_ICONS[status]}
                    </div>
                    <span
                      className={`status-label ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                    >
                      {status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Details */}
          <div className="glass-card" style={{ padding: 'var(--space-xl)', marginBottom: 'var(--space-xl)' }}>
            <h3 className="heading-md" style={{ marginBottom: 'var(--space-lg)' }}>
              🍕 Order Details
            </h3>

            {order.items.map((pizza, idx) => (
              <div key={idx} style={{ marginBottom: 'var(--space-lg)' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: 'var(--space-sm)', color: 'var(--accent-warm)' }}>
                  Pizza {idx + 1} — {pizza.pizzaName}
                </h4>
                <div style={{ display: 'grid', gap: 'var(--space-xs)', fontSize: '0.9rem' }}>
                  <p><span style={{ color: 'var(--text-muted)' }}>Base:</span> {pizza.base?.name}</p>
                  <p><span style={{ color: 'var(--text-muted)' }}>Sauce:</span> {pizza.sauce?.name}</p>
                  <p><span style={{ color: 'var(--text-muted)' }}>Cheese:</span> {pizza.cheese?.name}</p>
                  {pizza.vegetables?.length > 0 && (
                    <p>
                      <span style={{ color: 'var(--text-muted)' }}>Veggies:</span>{' '}
                      {pizza.vegetables.map((v) => v.name).join(', ')}
                    </p>
                  )}
                </div>
              </div>
            ))}

            <div className="summary-total">
              <span className="label">Total Paid</span>
              <span className="amount">₹{order.totalAmount}</span>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="glass-card" style={{ padding: 'var(--space-xl)', marginBottom: 'var(--space-2xl)' }}>
            <h3 className="heading-md" style={{ marginBottom: 'var(--space-sm)' }}>
              📍 Delivery Address
            </h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              {order.deliveryAddress}
            </p>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default OrderStatus;
