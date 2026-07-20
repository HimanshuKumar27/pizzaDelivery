import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, Pizza, ShoppingBag, User, Sun, Moon, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  const handleBrandClick = () => {
    setIsOpen(false);
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="navbar-brand" onClick={handleBrandClick}>
            🍕 <span>PizzaByte</span>
          </Link>

          <ul className="navbar-links">
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
            <div className="navbar-auth-desktop">
              {isAuthenticated ? (
                <>
                  <span className="user-greeting" style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>
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

            <button
              className="btn btn-secondary btn-sm btn-icon"
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              style={{ borderRadius: '50%', padding: '8px' }}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            <button
              className="btn btn-secondary btn-sm btn-icon mobile-menu-toggle"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle Menu"
              style={{ borderRadius: '50%', padding: '8px' }}
            >
              {isOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      <div className={`mobile-drawer ${isOpen ? 'open' : ''}`}>
        <ul className="mobile-drawer-links">
          {isAuthenticated && (
            <>
              <li>
                <Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''} onClick={() => setIsOpen(false)}>
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/build" className={isActive('/build') ? 'active' : ''} onClick={() => setIsOpen(false)}>
                  Build Pizza
                </Link>
              </li>
              <li>
                <Link to="/my-orders" className={isActive('/my-orders') ? 'active' : ''} onClick={() => setIsOpen(false)}>
                  My Orders
                </Link>
              </li>
            </>
          )}
        </ul>

        {/* Mobile Auth Actions inside Hamburger */}
        <div className="navbar-auth-mobile">
          {isAuthenticated ? (
            <div className="mobile-auth-container">
              <span className="user-greeting-mobile">
                <User size={14} style={{ marginRight: 6 }} />
                {user?.name}
              </span>
              <button className="btn btn-secondary btn-md" onClick={handleLogout} style={{ width: '100%' }}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          ) : (
            <div className="mobile-auth-container">
              <Link to="/login" className="btn btn-secondary btn-md" onClick={() => setIsOpen(false)} style={{ width: '100%' }}>
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-md" onClick={() => setIsOpen(false)} style={{ width: '100%', marginTop: '8px' }}>
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
