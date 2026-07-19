import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';

import API from '../utils/api';
import { motion } from 'framer-motion';

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const verify = async () => {
      try {
        const { data } = await API.get(`/auth/verify-email/${token}`);
        setStatus('success');
        setMessage(data.message);
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed');
      }
    };
    verify();
  }, [token]);

  return (
    <div className="auth-page">
      <motion.div 
        className="glass-card auth-card" 
        style={{ textAlign: 'center' }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {status === 'verifying' && (
          <>
            <div className="auth-logo">⏳</div>
            <h1 className="auth-title">Verifying Email...</h1>
            <div className="page-loader" style={{ minHeight: '100px' }}>
              <div className="spinner"></div>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="auth-logo">✅</div>
            <h1 className="auth-title">Email Verified!</h1>
            <p className="auth-subtitle" style={{ marginBottom: 'var(--space-xl)' }}>
              {message}
            </p>
            <Link to="/login" className="btn btn-primary">
              Sign In Now
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="auth-logo">❌</div>
            <h1 className="auth-title">Verification Failed</h1>
            <p className="auth-subtitle" style={{ marginBottom: 'var(--space-xl)' }}>
              {message}
            </p>
            <Link to="/register" className="btn btn-secondary">
              Try Again
            </Link>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
