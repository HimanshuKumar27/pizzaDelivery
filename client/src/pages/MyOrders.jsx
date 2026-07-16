import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../utils/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ChefHat } from 'lucide-react';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await API.get('/orders/my-orders');
        setOrders(data.orders || []);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Order Received': return 'received';
      case 'In Kitchen': return 'kitchen';
      case 'Sent to Delivery': return 'delivery';
      case 'Delivered': return 'delivered';
      default: return '';
    }
  };

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

  return (
    <>
      <Navbar />
      <div className="dashboard-page">
        <div className="container">
          <div className="dashboard-header animate-fade-in">
            <h1 className="dashboard-title">My Orders</h1>
            <p className="text-muted" style={{ marginTop: 'var(--space-xs)' }}>
              {orders.length} order{orders.length !== 1 ? 's' : ''} total
            </p>
          </div>

          {orders.length === 0 ? (
            <div className="empty-state animate-fade-in">
              <span className="empty-emoji">📭</span>
              <h3>No orders yet</h3>
              <p>Your order history will appear here</p>
              <Link to="/build" className="btn btn-primary">
                <ChefHat size={18} /> Build Pizza
              </Link>
            </div>
          ) : (
            <div className="animate-fade-in">
              {orders.map((order) => (
                <Link
                  key={order._id}
                  to={`/order/${order._id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="glass-card order-card">
                    <div className="order-card-header">
                      <span className="order-id">#{order._id.slice(-8).toUpperCase()}</span>
                      <span className={`order-status-badge ${getStatusBadgeClass(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ fontSize: '0.9rem' }}>
                          {order.items.length} pizza{order.items.length > 1 ? 's' : ''}
                          {order.items[0]?.base?.name && ` — ${order.items[0].base.name}`}
                        </p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <p style={{ fontWeight: 700, color: 'var(--accent-warm)', fontSize: '1.1rem' }}>
                        ₹{order.totalAmount}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
        <Footer />
      </div>
    </>
  );
};

export default MyOrders;
