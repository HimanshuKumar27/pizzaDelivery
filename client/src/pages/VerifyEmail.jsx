import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../utils/api';

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
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
      <div className="glass-card auth-card animate-scale-in" style={{ textAlign: 'center' }}>
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
      </div>
    </div>
  );
};

export default VerifyEmail;
