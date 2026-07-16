import { useState, useEffect, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import { ChevronLeft, ChevronRight, Check, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EMOJIS = {
  base: { 'Thin Crust': '🫓', 'Thick Crust': '🍞', 'Cheese Burst': '🧀', 'Whole Wheat': '🌾', 'Gluten Free': '🥦' },
  sauce: { 'Classic Marinara': '🍅', 'Pesto Basil': '🌿', 'BBQ Sauce': '🔥', 'White Garlic': '🧄', 'Spicy Sriracha': '🌶️' },
  cheese: { 'Mozzarella': '🧀', 'Cheddar': '🟡', 'Parmesan': '🇮🇹' },
  vegetable: { 'Bell Peppers': '🫑', 'Mushrooms': '🍄', 'Red Onions': '🧅', 'Black Olives': '🫒', 'Fresh Tomatoes': '🍅', 'Jalapeños': '🌶️' },
};

const slideVariants = {
  enter: (direction) => ({
    x: direction === 'right' ? 50 : -50,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1
  },
  exit: (direction) => ({
    x: direction === 'right' ? -50 : 50,
    opacity: 0
  })
};

const STEPS = [
  { key: 'base', title: 'Choose Your Base', subtitle: 'Select a pizza crust', multi: false },
  { key: 'sauce', title: 'Pick a Sauce', subtitle: 'Add the perfect flavor', multi: false },
  { key: 'cheese', title: 'Select Cheese', subtitle: 'Melty goodness awaits', multi: false },
  { key: 'vegetables', title: 'Add Veggies', subtitle: 'Pick your favorite toppings', multi: true },
];

const initialState = { base: null, sauce: null, cheese: null, vegetables: [] };

function reducer(state, action) {
  switch (action.type) {
    case 'SELECT_BASE': return { ...state, base: action.payload };
    case 'SELECT_SAUCE': return { ...state, sauce: action.payload };
    case 'SELECT_CHEESE': return { ...state, cheese: action.payload };
    case 'TOGGLE_VEGETABLE': {
      const exists = state.vegetables.find((v) => v._id === action.payload._id);
      return {
        ...state,
        vegetables: exists
          ? state.vegetables.filter((v) => v._id !== action.payload._id)
          : [...state.vegetables, action.payload],
      };
    }
    case 'RESET': return initialState;
    default: return state;
  }
}

const PizzaBuilder = () => {
  const [step, setStep] = useState(0);
  const [inventory, setInventory] = useState({ base: [], sauce: [], cheese: [], vegetable: [] });
  const [state, dispatch] = useReducer(reducer, initialState);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState('right');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const { data } = await API.get('/inventory');
        setInventory(data.grouped);
      } catch {
        toast.error('Failed to load ingredients');
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  const currentStep = STEPS[step];
  const categoryKey = currentStep.key === 'vegetables' ? 'vegetable' : currentStep.key;
  const items = inventory[categoryKey] || [];

  const isSelected = (item) => {
    if (currentStep.multi) {
      return state.vegetables.some((v) => v._id === item._id);
    }
    return state[currentStep.key]?._id === item._id;
  };

  const handleSelect = (item) => {
    switch (currentStep.key) {
      case 'base': dispatch({ type: 'SELECT_BASE', payload: item }); break;
      case 'sauce': dispatch({ type: 'SELECT_SAUCE', payload: item }); break;
      case 'cheese': dispatch({ type: 'SELECT_CHEESE', payload: item }); break;
      case 'vegetables': dispatch({ type: 'TOGGLE_VEGETABLE', payload: item }); break;
    }
  };

  const canProceed = () => {
    if (currentStep.multi) return true; // veggies are optional
    return state[currentStep.key] !== null;
  };

  const nextStep = () => {
    if (!canProceed()) {
      toast.error(`Please select a ${currentStep.key}`);
      return;
    }
    setDirection('right');
    if (step < STEPS.length - 1) setStep(step + 1);
    else goToSummary();
  };

  const prevStep = () => {
    setDirection('left');
    if (step > 0) setStep(step - 1);
  };

  const goToSummary = () => {
    // Store selection in sessionStorage for OrderSummary page
    sessionStorage.setItem('pizzaOrder', JSON.stringify(state));
    navigate('/order-summary');
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="page-loader" style={{ paddingTop: 80 }}>
          <div className="spinner"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="builder-page">
        <div className="builder-container">
          {/* Progress Dots */}
          <div className="builder-progress">
            {STEPS.map((s, i) => (
              <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                <div
                  className={`builder-step-dot ${i === step ? 'active' : ''} ${i < step ? 'completed' : ''}`}
                  onClick={() => {
                    if (i < step) { setDirection('left'); setStep(i); }
                  }}
                  style={{ cursor: i < step ? 'pointer' : 'default' }}
                >
                  {i < step ? <Check size={16} /> : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`builder-step-line ${i < step ? 'completed' : ''}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
            <div className="builder-step-title">
              <h2>{currentStep.title}</h2>
              <p>{currentStep.subtitle}</p>
            </div>

            <div className="builder-options">
              {items.map((item) => (
                <div
                  key={item._id}
                  className={`glass-card builder-option ${isSelected(item) ? 'selected' : ''}`}
                  onClick={() => handleSelect(item)}
                >
                  <span className="option-emoji">
                    {EMOJIS[categoryKey]?.[item.name] || '🍕'}
                  </span>
                  <div className="option-name">{item.name}</div>
                  <div className="option-desc">{item.description}</div>
                  <div className="option-price">₹{item.pricePerUnit}</div>
                  <div className="check-mark">
                    <Check size={14} />
                  </div>
                </div>
              ))}
            </div>

            {/* Selected veggies summary */}
            {currentStep.multi && state.vegetables.length > 0 && (
              <p
                style={{
                  textAlign: 'center',
                  fontSize: '0.9rem',
                  color: 'var(--accent-warm)',
                  marginBottom: 'var(--space-md)',
                }}
              >
                Selected: {state.vegetables.map((v) => v.name).join(', ')}
              </p>
            )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="builder-nav">
            <button
              className="btn btn-secondary"
              onClick={prevStep}
              disabled={step === 0}
            >
              <ChevronLeft size={18} /> Back
            </button>

            <button
              className="btn btn-primary"
              onClick={nextStep}
              disabled={!currentStep.multi && !canProceed()}
            >
              {step === STEPS.length - 1 ? (
                <>
                  <ShoppingCart size={18} /> Review Order
                </>
              ) : (
                <>
                  Next <ChevronRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PizzaBuilder;
