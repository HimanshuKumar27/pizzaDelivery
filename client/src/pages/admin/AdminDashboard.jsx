import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { AdminAPI } from '../../utils/api';
import {
  Package, AlertTriangle, ShoppingBag, LogOut,
  BarChart3, Boxes, ClipboardList, Shield,
} from 'lucide-react';
import { motion } from 'framer-motion';

const fadeVariant = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const AdminDashboard = () => {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeOrders: 0,
    inventoryStats: { total: 0, lowStock: 0, outOfStock: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [ordersRes, inventoryRes] = await Promise.all([
          AdminAPI.get('/orders/admin/all?limit=1'),
          AdminAPI.get('/inventory/admin/all'),
        ]);

        setStats({
          totalOrders: ordersRes.data.total || 0,
          activeOrders: ordersRes.data.orders?.filter(
            (o) => o.status !== 'Delivered'
          ).length || 0,
          inventoryStats: inventoryRes.data.stats || { total: 0, lowStock: 0, outOfStock: 0 },
        });
      } catch (err) {
        console.error('Admin dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="page-loader" style={{ paddingTop: 80 }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-page" style={{ paddingTop: 'var(--space-xl)' }}>
      <div className="container">
        {/* Admin Navbar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--space-2xl)',
            paddingBottom: 'var(--space-lg)',
            borderBottom: '1px solid var(--border-color)',
          }}
        >
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={24} style={{ color: 'var(--accent-primary)' }} /> Admin Panel
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Welcome, {admin?.username}
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>

        {/* Stats */}
        <motion.div 
          className="stats-grid"
          initial="hidden"
          animate="visible"
          variants={fadeVariant}
        >
          <div className="glass-card stat-card">
            <div className="stat-icon orange">
              <ShoppingBag size={24} />
            </div>
            <div className="stat-info">
              <h3>{stats.totalOrders}</h3>
              <p>Total Orders</p>
            </div>
          </div>

          <div className="glass-card stat-card">
            <div className="stat-icon blue">
              <Boxes size={24} />
            </div>
            <div className="stat-info">
              <h3>{stats.inventoryStats.total}</h3>
              <p>Inventory Items</p>
            </div>
          </div>

          <div className="glass-card stat-card">
            <div className="stat-icon gold">
              <AlertTriangle size={24} />
            </div>
            <div className="stat-info">
              <h3>{stats.inventoryStats.lowStock}</h3>
              <p>Low Stock Items</p>
            </div>
          </div>

          <div className="glass-card stat-card">
            <div className="stat-icon red">
              <Package size={24} />
            </div>
            <div className="stat-info">
              <h3>{stats.inventoryStats.outOfStock}</h3>
              <p>Out of Stock</p>
            </div>
          </div>
        </motion.div>

        {/* Quick Links */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'var(--space-lg)',
            marginTop: 'var(--space-lg)',
          }}
        >
          <Link to="/admin/inventory" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div
              className="glass-card"
              style={{
                padding: 'var(--space-2xl)',
                textAlign: 'center',
                cursor: 'pointer',
              }}
            >
              <Boxes size={48} style={{ color: 'var(--accent-primary)', marginBottom: 'var(--space-md)' }} />
              <h3 className="heading-md">Inventory Management</h3>
              <p className="text-muted" style={{ marginTop: 'var(--space-sm)' }}>
                View stock levels, update quantities, add new items
              </p>
            </div>
          </Link>

          <Link to="/admin/orders" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div
              className="glass-card"
              style={{
                padding: 'var(--space-2xl)',
                textAlign: 'center',
                cursor: 'pointer',
              }}
            >
              <ClipboardList size={48} style={{ color: 'var(--accent-warm)', marginBottom: 'var(--space-md)' }} />
              <h3 className="heading-md">Order Management</h3>
              <p className="text-muted" style={{ marginTop: 'var(--space-sm)' }}>
                View all orders, update statuses, manage deliveries
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
