import { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../utils/api';
import toast from 'react-hot-toast';
import { Mail } from 'lucide-react';
import { motion } from 'framer-motion';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post('/auth/forgot-password', { email });
      toast.success(data.message);
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <motion.div 
        className="glass-card auth-card"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="auth-header">
          <div className="auth-logo">🔑</div>
          <h1 className="auth-title">Forgot Password</h1>
          <p className="auth-subtitle">
            {sent
              ? 'Check your email for a reset link'
              : 'Enter your email to receive a reset link'}
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="forgot-email">Email Address</label>
              <input
                id="forgot-email"
                className="form-input"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? 'Sending...' : <><Mail size={18} /> Send Reset Link</>}
            </button>
          </form>
        ) : (
          <div className="empty-state" style={{ padding: 'var(--space-md) 0', textAlign: 'center' }}>
            <Mail size={56} style={{ color: 'var(--accent-primary)', marginBottom: 'var(--space-sm)' }} />
            <h3 style={{ marginBottom: 'var(--space-xs)' }}>Check Your Email</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>
              We sent a password reset link to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>.
            </p>
            <div className="glass-card" style={{ padding: 'var(--space-sm) var(--space-md)', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'left', marginBottom: 'var(--space-md)' }}>
              <strong>Didn't receive the email?</strong>
              <ul style={{ paddingLeft: '1.2rem', marginTop: '6px', marginBottom: 0 }}>
                <li>Check your spam or junk folder.</li>
                <li>Ensure the email address entered is correct.</li>
                <li>Wait a couple of minutes for delivery.</li>
              </ul>
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={loading}
              onClick={handleSubmit}
              style={{ width: '100%', marginBottom: 'var(--space-xs)' }}
            >
              {loading ? 'Resending...' : 'Resend Email'}
            </button>
          </div>
        )}

        <div className="auth-footer">
          Remember your password?{' '}
          <Link to="/login">Sign in</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
