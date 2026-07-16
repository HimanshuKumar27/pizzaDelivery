import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Pizza, ShoppingBag, User } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          🍕 <span>PizzaHub</span>
        </Link>

        <ul className="navbar-links">
          <li>
            <Link to="/" className={isActive('/') ? 'active' : ''}>
              Home
            </Link>
          </li>
          {isAuthenticated && (
            <>
              <li>
                <Link
                  to="/dashboard"
                  className={isActive('/dashboard') ? 'active' : ''}
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/build"
                  className={isActive('/build') ? 'active' : ''}
                >
                  Build Pizza
                </Link>
              </li>
              <li>
                <Link
                  to="/my-orders"
                  className={isActive('/my-orders') ? 'active' : ''}
                >
                  My Orders
                </Link>
              </li>
            </>
          )}
        </ul>

        <div className="navbar-actions">
          {isAuthenticated ? (
            <>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <User size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                {user?.name}
              </span>
              <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
