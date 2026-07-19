import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ChefHat, Truck, CreditCard, Shield, Pizza, Palette, Compass, Zap, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const containerVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const Home = () => {
  const { isAuthenticated } = useAuth();
  const { changeTheme } = useTheme();
  const hasCheckedTheme = useRef(false);

  useEffect(() => {
    if (!hasCheckedTheme.current) {
      hasCheckedTheme.current = true;
      changeTheme('light');
    }
  }, [changeTheme]);

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="hero-section">
        <motion.div 
          className="hero-content"
          initial="hidden"
          animate="visible"
          variants={fadeVariant}
        >
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
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
            <h2 className="heading-lg">Why PizzaByte?</h2>
            <p className="text-muted" style={{ marginTop: 'var(--space-sm)', fontSize: '1.05rem' }}>
              From kitchen to doorstep — a premium pizza experience
            </p>
          </div>

          <motion.div 
            className="features-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariant}
          >
            <motion.div className="glass-card feature-card" variants={fadeVariant}>
              <Palette size={40} style={{ color: 'var(--accent-primary)', marginBottom: 'var(--space-md)' }} />
              <h3>Custom Pizza Builder</h3>
              <p>
                Choose from 5 bases, 5 sauces, premium cheeses, and fresh veggies.
                Build it exactly the way you love it.
              </p>
            </motion.div>

            <motion.div className="glass-card feature-card" variants={fadeVariant}>
              <Compass size={40} style={{ color: 'var(--accent-primary)', marginBottom: 'var(--space-md)' }} />
              <h3>Real-Time Tracking</h3>
              <p>
                Watch your order journey live — from kitchen prep to delivery.
                Always know where your pizza is.
              </p>
            </motion.div>

            <motion.div className="glass-card feature-card" variants={fadeVariant}>
              <CreditCard size={40} style={{ color: 'var(--accent-primary)', marginBottom: 'var(--space-md)' }} />
              <h3>Secure Payments</h3>
              <p>
                Pay with confidence via Razorpay's secure checkout. Fast, safe,
                and hassle-free transactions.
              </p>
            </motion.div>

            <motion.div className="glass-card feature-card" variants={fadeVariant}>
              <Zap size={40} style={{ color: 'var(--accent-primary)', marginBottom: 'var(--space-md)' }} />
              <h3>Lightning Fast</h3>
              <p>
                From order to doorstep in record time. Our streamlined process
                means your pizza arrives hot and fresh.
              </p>
            </motion.div>

            <motion.div className="glass-card feature-card" variants={fadeVariant}>
              <Shield size={40} style={{ color: 'var(--accent-primary)', marginBottom: 'var(--space-md)' }} />
              <h3>Fresh Ingredients</h3>
              <p>
                We track every ingredient in real-time. Our inventory system
                ensures only the freshest toppings make it to your pizza.
              </p>
            </motion.div>

            <motion.div className="glass-card feature-card" variants={fadeVariant}>
              <Star size={40} style={{ color: 'var(--accent-primary)', marginBottom: 'var(--space-md)' }} />
              <h3>Premium Quality</h3>
              <p>
                Every pizza is crafted with care. From hand-tossed dough to
                artisanal sauces — taste the difference.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Home;
