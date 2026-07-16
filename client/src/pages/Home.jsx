import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ChefHat, Truck, CreditCard, Shield } from 'lucide-react';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content animate-fade-in">
          <span className="hero-emoji">🍕</span>
          <h1 className="heading-xl hero-title">
            Craft Your Perfect Pizza
          </h1>
          <p className="hero-description">
            Build your dream pizza from scratch — choose your base, sauce, cheese,
            and toppings. Fresh ingredients, fast delivery, and a taste that keeps
            you coming back.
          </p>
          <div className="hero-actions">
            {isAuthenticated ? (
              <>
                <Link to="/build" className="btn btn-primary btn-lg">
                  <ChefHat size={20} /> Build Your Pizza
                </Link>
                <Link to="/dashboard" className="btn btn-secondary btn-lg">
                  View Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">
                  Get Started Free
                </Link>
                <Link to="/login" className="btn btn-secondary btn-lg">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
            <h2 className="heading-lg">Why PizzaHub?</h2>
            <p className="text-muted" style={{ marginTop: 'var(--space-sm)', fontSize: '1.05rem' }}>
              From kitchen to doorstep — a premium pizza experience
            </p>
          </div>

          <div className="features-grid">
            <div className="glass-card feature-card animate-fade-in">
              <span className="feature-icon">🎨</span>
              <h3>Custom Pizza Builder</h3>
              <p>
                Choose from 5 bases, 5 sauces, premium cheeses, and fresh veggies.
                Build it exactly the way you love it.
              </p>
            </div>

            <div className="glass-card feature-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <span className="feature-icon">📦</span>
              <h3>Real-Time Tracking</h3>
              <p>
                Watch your order journey live — from kitchen prep to delivery.
                Always know where your pizza is.
              </p>
            </div>

            <div className="glass-card feature-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <span className="feature-icon">💳</span>
              <h3>Secure Payments</h3>
              <p>
                Pay with confidence via Razorpay's secure checkout. Fast, safe,
                and hassle-free transactions.
              </p>
            </div>

            <div className="glass-card feature-card animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <span className="feature-icon">🚀</span>
              <h3>Lightning Fast</h3>
              <p>
                From order to doorstep in record time. Our streamlined process
                means your pizza arrives hot and fresh.
              </p>
            </div>

            <div className="glass-card feature-card animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <span className="feature-icon">🛡️</span>
              <h3>Fresh Ingredients</h3>
              <p>
                We track every ingredient in real-time. Our inventory system
                ensures only the freshest toppings make it to your pizza.
              </p>
            </div>

            <div className="glass-card feature-card animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <span className="feature-icon">⭐</span>
              <h3>Premium Quality</h3>
              <p>
                Every pizza is crafted with care. From hand-tossed dough to
                artisanal sauces — taste the difference.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Home;
