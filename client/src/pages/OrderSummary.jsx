import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import { openRazorpayCheckout } from '../utils/razorpay';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import { CreditCard, ArrowLeft, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeVariant = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const OrderSummary = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [address, setAddress] = useState(user?.address || '');
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem('pizzaOrder');
    if (!saved) {
      navigate('/build');
      return;
    }
    setOrder(JSON.parse(saved));
  }, []);

  if (!order) return null;

  const basePrice = order.base?.pricePerUnit || 0;
  const saucePrice = order.sauce?.pricePerUnit || 0;
  const cheesePrice = order.cheese?.pricePerUnit || 0;
  const veggiesPrice = (order.vegetables || []).reduce(
    (sum, v) => sum + (v.pricePerUnit || 0),
    0
  );
  const totalAmount = basePrice + saucePrice + cheesePrice + veggiesPrice;

  const handlePayment = async () => {
    if (!address.trim()) {
      toast.error('Please enter a delivery address');
      return;
    }

    setPaying(true);
    try {
      // 1. Get Razorpay key
      const { data: keyData } = await API.get('/payment/key');

      // 2. Create Razorpay order on backend
      const { data: orderData } = await API.post('/payment/create-order', {
        amount: totalAmount,
      });

      // 3. Open Razorpay checkout
      openRazorpayCheckout({
        keyId: keyData.key,
        orderId: orderData.order.id,
        amount: totalAmount,
        userName: user?.name,
        userEmail: user?.email,
        onSuccess: async (paymentResponse) => {
          try {
            // 4. Verify payment on backend
            const { data: verifyData } = await API.post('/payment/verify', paymentResponse);

            if (verifyData.success) {
              // 5. Create the actual order
              const { data: newOrder } = await API.post('/orders', {
                items: [
                  {
                    base: order.base._id,
                    sauce: order.sauce._id,
                    cheese: order.cheese._id,
                    vegetables: order.vegetables.map((v) => v._id),
                    pizzaName: 'Custom Pizza',
                    price: totalAmount,
                  },
                ],
                totalAmount,
                deliveryAddress: address,
                razorpayOrderId: verifyData.razorpayOrderId,
                razorpayPaymentId: verifyData.razorpayPaymentId,
              });

              sessionStorage.removeItem('pizzaOrder');
              toast.success('Order placed successfully! 🎉');
              navigate(`/order/${newOrder.order._id}`);
            }
          } catch (err) {
            toast.error('Payment verified but order creation failed. Contact support.');
          }
          setPaying(false);
        },
        onFailure: (msg) => {
          toast.error(msg || 'Payment cancelled');
          setPaying(false);
        },
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment initialization failed');
      setPaying(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="summary-page">
        <motion.div 
          className="summary-container"
          initial="hidden"
          animate="visible"
          variants={fadeVariant}
        >
          <Link
            to="/build"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-xs)',
              color: 'var(--text-secondary)',
              marginBottom: 'var(--space-lg)',
              fontSize: '0.9rem',
            }}
          >
            <ArrowLeft size={16} /> Back to Builder
          </Link>

          <h1 className="heading-lg" style={{ marginBottom: 'var(--space-xl)' }}>
            Order Summary
          </h1>

          {/* Pizza Details */}
          <div className="glass-card summary-card">
            <h3 className="heading-md" style={{ marginBottom: 'var(--space-md)' }}>
              🍕 Your Custom Pizza
            </h3>

            <div className="summary-item">
              <span className="summary-item-label">🫓 Base</span>
              <span className="summary-item-value">
                {order.base?.name} — ₹{basePrice}
              </span>
            </div>

            <div className="summary-item">
              <span className="summary-item-label">🍅 Sauce</span>
              <span className="summary-item-value">
                {order.sauce?.name} — ₹{saucePrice}
              </span>
            </div>

            <div className="summary-item">
              <span className="summary-item-label">🧀 Cheese</span>
              <span className="summary-item-value">
                {order.cheese?.name} — ₹{cheesePrice}
              </span>
            </div>

            {order.vegetables.length > 0 && (
              <div className="summary-item">
                <span className="summary-item-label">🥗 Veggies</span>
                <span className="summary-item-value">
                  {order.vegetables.map((v) => v.name).join(', ')} — ₹{veggiesPrice}
                </span>
              </div>
            )}

            <div className="summary-total">
              <span className="label">Total</span>
              <span className="amount">₹{totalAmount}</span>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="glass-card summary-card">
            <h3 className="heading-md" style={{ marginBottom: 'var(--space-md)' }}>
              <MapPin size={20} style={{ verticalAlign: 'middle', marginRight: 8 }} />
              Delivery Address
            </h3>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <input
                className="form-input"
                type="text"
                placeholder="Enter your delivery address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Pay Button */}
          <button
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: 'var(--space-md)' }}
            onClick={handlePayment}
            disabled={paying}
          >
            {paying ? (
              'Processing...'
            ) : (
              <>
                <CreditCard size={20} /> Pay ₹{totalAmount} with Razorpay
              </>
            )}
          </button>

          <p
            style={{
              textAlign: 'center',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              marginTop: 'var(--space-md)',
            }}
          >
            🔒 Payments secured by Razorpay (Test Mode)
          </p>
        </motion.div>
      </div>
    </>
  );
};

export default OrderSummary;
