import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ChefHat, ShoppingBag, Clock, MapPin, ClipboardList, TrendingUp, Inbox } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeVariant = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const Dashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState({ grouped: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, inventoryRes] = await Promise.all([
          API.get('/orders/my-orders'),
          API.get('/inventory'),
        ]);
        setOrders(ordersRes.data.orders || []);
        setInventory(inventoryRes.data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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

  const activeOrders = orders.filter((o) => o.status !== 'Delivered');
  const completedOrders = orders.filter((o) => o.status === 'Delivered');

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
          {/* Header */}
          <motion.div 
            className="dashboard-header"
            initial="hidden"
            animate="visible"
            variants={fadeVariant}
          >
            <p className="dashboard-welcome">Welcome back,</p>
            <h1 className="dashboard-title">
              {user?.name} 👋
            </h1>
          </motion.div>

          {/* Stats */}
          <motion.div 
            className="stats-grid"
            initial="hidden"
            animate="visible"
            variants={fadeVariant}
            transition={{ delay: 0.1 }}
          >
            <div className="glass-card stat-card">
              <div className="stat-icon orange">
                <ShoppingBag size={24} />
              </div>
              <div className="stat-info">
                <h3>{orders.length}</h3>
                <p>Total Orders</p>
              </div>
            </div>

            <div className="glass-card stat-card">
              <div className="stat-icon blue">
                <Clock size={24} />
              </div>
              <div className="stat-info">
                <h3>{activeOrders.length}</h3>
                <p>Active Orders</p>
              </div>
            </div>

            <div className="glass-card stat-card">
              <div className="stat-icon green">
                <TrendingUp size={24} />
              </div>
              <div className="stat-info">
                <h3>{completedOrders.length}</h3>
                <p>Delivered</p>
              </div>
            </div>
          </motion.div>

          {/* Build Pizza CTA */}
          <motion.div
            className="glass-card"
            initial="hidden"
            animate="visible"
            variants={fadeVariant}
            transition={{ delay: 0.2 }}
            style={{
              padding: 'var(--space-2xl)',
              textAlign: 'center',
              marginBottom: 'var(--space-2xl)',
              background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.08), rgba(230, 57, 70, 0.08))',
            }}
          >
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: 'var(--space-md)' }}>
              🍕
            </span>
            <h2 className="heading-md" style={{ marginBottom: 'var(--space-sm)' }}>
              Craving a Custom Pizza?
            </h2>
            <p className="text-muted" style={{ marginBottom: 'var(--space-lg)' }}>
              Build your perfect pizza from scratch — choose base, sauce, cheese & toppings!
            </p>
            <Link to="/build" className="btn btn-primary btn-lg">
              <ChefHat size={20} /> Start Building
            </Link>
          </motion.div>

          {/* Active Orders */}
          {activeOrders.length > 0 && (
            <div style={{ marginBottom: 'var(--space-2xl)' }}>
              <h2 className="heading-md" style={{ marginBottom: 'var(--space-lg)' }}>
                🔥 Active Orders
              </h2>
              {activeOrders.map((order) => (
                <Link
                  key={order._id}
                  to={`/order/${order._id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <motion.div 
                    className="glass-card order-card"
                    initial="hidden"
                    animate="visible"
                    variants={fadeVariant}
                  >
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
                        </p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <p style={{ fontWeight: 700, color: 'var(--accent-warm)', fontSize: '1.1rem' }}>
                        ₹{order.totalAmount}
                      </p>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}

          {/* Recent Completed Orders */}
          {completedOrders.length > 0 && (
            <div style={{ marginBottom: 'var(--space-2xl)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                <h2 className="heading-md">✅ Recent Orders</h2>
                <Link to="/my-orders" className="btn btn-secondary btn-sm">
                  View All
                </Link>
              </div>
              {completedOrders.slice(0, 3).map((order) => (
                <motion.div 
                  key={order._id} 
                  className="glass-card order-card"
                  initial="hidden"
                  animate="visible"
                  variants={fadeVariant}
                >
                  <div className="order-card-header">
                    <span className="order-id">#{order._id.slice(-8).toUpperCase()}</span>
                    <span className={`order-status-badge ${getStatusBadgeClass(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                    <p style={{ fontWeight: 700, color: 'var(--accent-warm)' }}>
                      ₹{order.totalAmount}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {orders.length === 0 && (
            <motion.div 
              className="empty-state"
              initial="hidden"
              animate="visible"
              variants={fadeVariant}
            >
              <Inbox size={64} style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-md)' }} />
              <h3>No orders yet</h3>
              <p>Build your first custom pizza and place an order!</p>
              <Link to="/build" className="btn btn-primary">
                <ChefHat size={18} /> Build Pizza
              </Link>
            </motion.div>
          )}
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Dashboard;
