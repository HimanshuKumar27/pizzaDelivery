import { Link } from 'react-router-dom';
import { Pizza, Mail, Phone, MapPin, Globe, ExternalLink, Send, Heart, ArrowRight } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container">
        {/* Footer Top */}
        <div className="footer-grid">
          {/* Brand Column */}
          <div className="footer-brand-col">
            <Link to="/" className="footer-logo">
              🍕 <span>PizzaByte</span>
            </Link>
            <p className="footer-tagline">
              Craft your dream pizza from scratch with our interactive builder. 
              Fresh ingredients, real-time tracking, and lightning-fast delivery.
            </p>
            <div className="footer-socials">
              <a href="https://github.com/HimanshuKumar27/PizzaByte" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="footer-social-link">
                <Globe size={18} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="footer-social-link">
                <ExternalLink size={18} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="footer-social-link">
                <Send size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-links-col">
            <h4 className="footer-col-title">Quick Links</h4>
            <ul className="footer-link-list">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/build">Build Pizza</Link></li>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/my-orders">My Orders</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div className="footer-links-col">
            <h4 className="footer-col-title">Account</h4>
            <ul className="footer-link-list">
              <li><Link to="/login">Sign In</Link></li>
              <li><Link to="/register">Create Account</Link></li>
              <li><Link to="/forgot-password">Forgot Password</Link></li>
              <li><Link to="/admin/login">Admin Portal</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-links-col">
            <h4 className="footer-col-title">Get in Touch</h4>
            <ul className="footer-contact-list">
              <li>
                <Mail size={16} />
                <span>365himanshukumar@gmail.com</span>
              </li>
              <li>
                <Phone size={16} />
                <span>+91 7011121740</span>
              </li>
              <li>
                <MapPin size={16} />
                <span>Sec 102, Noida, Uttar Pradesh 201304, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="footer-divider" />

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p>
            © {currentYear} <Link to="/">PizzaByte</Link>. All rights reserved.
          </p>
          <p className="footer-credit">
            Built with <Heart size={14} className="footer-heart" /> and 🍕 by{' '}
            <a href="https://github.com/HimanshuKumar27" target="_blank" rel="noopener noreferrer">
              Himanshu Kumar
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
