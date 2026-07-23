import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  ChefHat, Truck, CreditCard, Shield, Pizza, Palette, Compass, Zap, Star, 
  Sparkles, CheckCircle2, ArrowRight, Clock, Award, HeartHandshake, Flame 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { warmupBackend } from '../utils/api';

const fadeVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const slideLeftVariant = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: 'easeOut' } }
};

const slideRightVariant = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: 'easeOut' } }
};

const containerVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const scaleVariant = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
};

const Home = () => {
  const { isAuthenticated } = useAuth();
  const { changeTheme } = useTheme();
  const hasCheckedTheme = useRef(false);

  useEffect(() => {
    // Automatically trigger backend service warmup when Home page loads
    warmupBackend();

    if (!hasCheckedTheme.current) {
      hasCheckedTheme.current = true;
      changeTheme('light');
    }
  }, [changeTheme]);

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="section" style={{ paddingTop: 'var(--space-2xl)', overflow: 'hidden' }}>
        <div className="container">
          <div className="hero-split">
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={slideLeftVariant}
            >
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', background: 'var(--bg-glass)', border: '1px solid var(--border-color)', marginBottom: 'var(--space-md)' }}>
                <Sparkles size={16} style={{ color: 'var(--accent-primary)' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-primary)' }}>
                  Next-Gen Pizza Ordering Platform
                </span>
              </div>

              <h1 className="heading-xl hero-title" style={{ lineHeight: 1.15 }}>
                Craft Your <span className="text-gradient">Perfect Pizza</span> In Seconds
              </h1>

              <p className="hero-description" style={{ marginTop: 'var(--space-md)', fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
                Build your dream pizza from scratch — pick your artisanal crust, signature sauces, 
                gourmet cheeses, and fresh toppings. Delivered hot and fresh to your doorstep.
              </p>

              <div className="hero-actions" style={{ marginTop: 'var(--space-xl)', display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
                {isAuthenticated ? (
                  <>
                    <Link to="/build" className="btn btn-primary btn-lg">
                      <ChefHat size={22} /> Start Pizza Builder <ArrowRight size={18} />
                    </Link>
                    <Link to="/dashboard" className="btn btn-secondary btn-lg">
                      My Dashboard
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/register" className="btn btn-primary btn-lg">
                      <ChefHat size={22} /> Build Your Pizza <ArrowRight size={18} />
                    </Link>
                    <Link to="/login" className="btn btn-secondary btn-lg">
                      Sign In
                    </Link>
                  </>
                )}
              </div>

              {/* Stats Row */}
              <div className="hero-stats-row">
                <div className="hero-stat-item">
                  <h3>50k+</h3>
                  <p>Happy Foodies</p>
                </div>
                <div className="hero-stat-item">
                  <h3>15 Min</h3>
                  <p>Average Prep Time</p>
                </div>
                <div className="hero-stat-item">
                  <h3>4.9 ★</h3>
                  <p>User Rating</p>
                </div>
              </div>
            </motion.div>

            {/* Hero Image Showcase */}
            <motion.div 
              className="hero-image-wrapper"
              initial="hidden"
              animate="visible"
              variants={slideRightVariant}
            >
              <img 
                src="/images/hero_pizza_banner.png" 
                alt="Gourmet Pizza Banner" 
                className="hero-main-img"
              />

              <div className="floating-badge-card top-right">
                <Flame size={20} style={{ color: 'var(--accent-primary)' }} />
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>100% Fresh Oven Baked</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-green)' }}>● Kitchen Active</div>
                </div>
              </div>

              <div className="floating-badge-card bottom-left">
                <Clock size={20} style={{ color: 'var(--accent-gold)' }} />
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Express Delivery</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hot & Crispy</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Interactive Builder Showcase Section (Scroll-to-Animate) */}
      <section className="section" style={{ background: 'var(--bg-secondary)', padding: 'var(--space-3xl) 0' }}>
        <div className="container">
          <motion.div 
            style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto var(--space-2xl) auto' }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeVariant}
          >
            <span style={{ color: 'var(--accent-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>
              Unmatched Customization
            </span>
            <h2 className="heading-lg" style={{ marginTop: 'var(--space-xs)' }}>
              How You Build Your Dream Pizza
            </h2>
            <p className="text-muted" style={{ marginTop: 'var(--space-sm)' }}>
              From hand-tossed dough to melted mozzarella, take full control over every layer.
            </p>
          </motion.div>

          <div className="showcase-grid">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={slideLeftVariant}
            >
              <img 
                src="/images/custom_builder_showcase.png" 
                alt="Interactive Builder Concept" 
                className="showcase-img"
              />
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={containerVariant}
            >
              <div className="step-list">
                <motion.div className="step-item-card" variants={fadeVariant}>
                  <div className="step-icon-wrap">
                    <Pizza size={22} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>1. Choose Your Crust Base</h4>
                    <p className="text-muted" style={{ fontSize: '0.9rem', marginTop: '2px' }}>
                      Select from Thin Crust, Whole Wheat, Cheese Burst, Gluten-Free, or Classic Pan.
                    </p>
                  </div>
                </motion.div>

                <motion.div className="step-item-card" variants={fadeVariant}>
                  <div className="step-icon-wrap">
                    <Palette size={22} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>2. Pick Signature Sauces</h4>
                    <p className="text-muted" style={{ fontSize: '0.9rem', marginTop: '2px' }}>
                      Smother your base in Creamy Garlic, Zesty Tomato Basil, Spicy Arrabbiata, or BBQ glaze.
                    </p>
                  </div>
                </motion.div>

                <motion.div className="step-item-card" variants={fadeVariant}>
                  <div className="step-icon-wrap">
                    <Shield size={22} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>3. Top with Farm-Fresh Veggies</h4>
                    <p className="text-muted" style={{ fontSize: '0.9rem', marginTop: '2px' }}>
                      Add crisp bell peppers, black olives, jalapenos, mushrooms, caramelized onions, and extra cheese.
                    </p>
                  </div>
                </motion.div>

                <motion.div className="step-item-card" variants={fadeVariant}>
                  <div className="step-icon-wrap">
                    <CheckCircle2 size={22} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>4. Real-Time Price & Calorie Calculator</h4>
                    <p className="text-muted" style={{ fontSize: '0.9rem', marginTop: '2px' }}>
                      Watch live totals update transparently as you customize every ingredient.
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Fresh Ingredients Showcase Section (Scroll-to-Animate) */}
      <section className="section" style={{ padding: 'var(--space-3xl) 0' }}>
        <div className="container">
          <div className="showcase-grid reverse">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={slideLeftVariant}
            >
              <span style={{ color: 'var(--accent-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>
                Organic & Fresh Daily
              </span>
              <h2 className="heading-lg" style={{ marginTop: 'var(--space-xs)' }}>
                Only The Finest Ingredients Touch Your Crust
              </h2>
              <p className="text-muted" style={{ marginTop: 'var(--space-md)', fontSize: '1.05rem' }}>
                We believe great pizza starts at the farm. Our automated inventory management 
                system ensures every vegetable, herb, and cheese block is tracked live for peak freshness.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)', marginTop: 'var(--space-xl)' }}>
                <div style={{ padding: '16px', borderRadius: '12px', background: 'var(--bg-glass)', border: '1px solid var(--border-color)' }}>
                  <Award size={24} style={{ color: 'var(--accent-primary)', marginBottom: '8px' }} />
                  <h5 style={{ fontWeight: 600 }}>Zero Preservatives</h5>
                  <p className="text-muted" style={{ fontSize: '0.85rem' }}>100% natural, non-GMO ingredients prep daily.</p>
                </div>
                <div style={{ padding: '16px', borderRadius: '12px', background: 'var(--bg-glass)', border: '1px solid var(--border-color)' }}>
                  <HeartHandshake size={24} style={{ color: 'var(--accent-green)', marginBottom: '8px' }} />
                  <h5 style={{ fontWeight: 600 }}>Locally Sourced</h5>
                  <p className="text-muted" style={{ fontSize: '0.85rem' }}>Directly from certified local organic farms.</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={slideRightVariant}
            >
              <img 
                src="/images/fresh_ingredients_showcase.png" 
                alt="Fresh Organic Ingredients" 
                className="showcase-img"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* How PizzaByte Works (3-Step Process) */}
      <section className="section" style={{ background: 'var(--bg-secondary)', padding: 'var(--space-3xl) 0' }}>
        <div className="container">
          <motion.div 
            style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto' }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeVariant}
          >
            <h2 className="heading-lg">Order in 3 Simple Steps</h2>
            <p className="text-muted" style={{ marginTop: 'var(--space-sm)' }}>
              Designed for speed, simplicity, and complete transparency.
            </p>
          </motion.div>

          <motion.div 
            className="process-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariant}
          >
            <motion.div className="glass-card process-card" variants={fadeVariant}>
              <span className="process-number">01</span>
              <div className="process-icon-box">
                <ChefHat size={30} />
              </div>
              <h3>1. Customize</h3>
              <p className="text-muted" style={{ marginTop: 'var(--space-sm)', fontSize: '0.95rem' }}>
                Build your pizza step-by-step using our interactive online builder.
              </p>
            </motion.div>

            <motion.div className="glass-card process-card" variants={fadeVariant}>
              <span className="process-number">02</span>
              <div className="process-icon-box">
                <CreditCard size={30} />
              </div>
              <h3>2. Secure Checkout</h3>
              <p className="text-muted" style={{ marginTop: 'var(--space-sm)', fontSize: '0.95rem' }}>
                Pay safely using Razorpay instant payment gateway with instant order placement.
              </p>
            </motion.div>

            <motion.div className="glass-card process-card" variants={fadeVariant}>
              <span className="process-number">03</span>
              <div className="process-icon-box">
                <Truck size={30} />
              </div>
              <h3>3. Live Tracking</h3>
              <p className="text-muted" style={{ marginTop: 'var(--space-sm)', fontSize: '0.95rem' }}>
                Follow your order live from baking in the oven to delivery at your door.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Customer Testimonials Section */}
      <section className="section" style={{ padding: 'var(--space-3xl) 0' }}>
        <div className="container">
          <motion.div 
            style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto' }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeVariant}
          >
            <h2 className="heading-lg">Loved By Thousands</h2>
            <p className="text-muted" style={{ marginTop: 'var(--space-sm)' }}>
              Here is what our pizza lovers have to say about PizzaByte.
            </p>
          </motion.div>

          <motion.div 
            className="testimonials-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariant}
          >
            <motion.div className="glass-card testimonial-card" variants={scaleVariant}>
              <div>
                <div className="testimonial-stars">
                  {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="currentColor" />)}
                </div>
                <p style={{ fontStyle: 'italic', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  "The custom pizza builder is unbelievable! I love picking my exact cheese and sauce blend. Arrived piping hot!"
                </p>
              </div>
              <div className="testimonial-user">
                <div className="user-avatar-circle">AS</div>
                <div>
                  <h5 style={{ fontWeight: 600 }}>Aarav Sharma</h5>
                  <p className="text-muted" style={{ fontSize: '0.8rem' }}>Verified Foodie</p>
                </div>
              </div>
            </motion.div>

            <motion.div className="glass-card testimonial-card" variants={scaleVariant}>
              <div>
                <div className="testimonial-stars">
                  {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="currentColor" />)}
                </div>
                <p style={{ fontStyle: 'italic', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  "Real-time tracking is super accurate! The crust was perfectly crispy and cheese burst was heavenly."
                </p>
              </div>
              <div className="testimonial-user">
                <div className="user-avatar-circle">PR</div>
                <div>
                  <h5 style={{ fontWeight: 600 }}>Priya Roy</h5>
                  <p className="text-muted" style={{ fontSize: '0.8rem' }}>Pizza Enthusiast</p>
                </div>
              </div>
            </motion.div>

            <motion.div className="glass-card testimonial-card" variants={scaleVariant}>
              <div>
                <div className="testimonial-stars">
                  {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="currentColor" />)}
                </div>
                <p style={{ fontStyle: 'italic', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  "Best pizza experience online. Seamless payment, ultra-fast delivery, and top quality ingredients every single time."
                </p>
              </div>
              <div className="testimonial-user">
                <div className="user-avatar-circle">VK</div>
                <div>
                  <h5 style={{ fontWeight: 600 }}>Vikram Kapoor</h5>
                  <p className="text-muted" style={{ fontSize: '0.8rem' }}>Regular Customer</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Call to Action Banner (Scroll-to-Animate) */}
      <section className="section" style={{ paddingTop: 0, paddingBottom: 'var(--space-3xl)' }}>
        <div className="container">
          <motion.div 
            className="cta-banner-card"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeVariant}
          >
            <h2 className="heading-xl" style={{ color: '#fff', fontSize: '2.5rem' }}>
              Ready to Taste the Difference?
            </h2>
            <p style={{ marginTop: 'var(--space-md)', fontSize: '1.15rem', opacity: 0.95, maxWidth: '600px', margin: 'var(--space-md) auto 0 auto' }}>
              Customize your artisanal pizza right now and get hot delivery to your door in under 30 minutes.
            </p>
            <div style={{ marginTop: 'var(--space-xl)' }}>
              <Link to={isAuthenticated ? "/build" : "/register"} className="btn btn-secondary btn-lg" style={{ background: '#fff', color: 'var(--accent-primary)', fontWeight: 700, border: 'none' }}>
                <ChefHat size={22} /> Build Your Pizza Now <ArrowRight size={18} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Home;
