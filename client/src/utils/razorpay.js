/**
 * Razorpay Checkout Utility
 * Loads the Razorpay script dynamically and provides a helper to open checkout.
 */

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

/**
 * Load Razorpay checkout script if not already loaded
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (document.querySelector(`script[src="${RAZORPAY_SCRIPT_URL}"]`)) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT_URL;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/**
 * Open Razorpay checkout modal
 * @param {Object} options
 * @param {string} options.keyId - Razorpay key ID
 * @param {string} options.orderId - Razorpay order ID from backend
 * @param {number} options.amount - Amount in INR (not paise)
 * @param {string} options.userName - Customer name
 * @param {string} options.userEmail - Customer email
 * @param {Function} options.onSuccess - Callback with payment response
 * @param {Function} options.onFailure - Callback on failure
 */
export const openRazorpayCheckout = async ({
  keyId,
  orderId,
  amount,
  userName,
  userEmail,
  onSuccess,
  onFailure,
}) => {
  const loaded = await loadRazorpayScript();

  if (!loaded) {
    onFailure?.('Failed to load Razorpay SDK. Check your internet connection.');
    return;
  }

  const options = {
    key: keyId,
    amount: amount * 100, // Razorpay expects paise
    currency: 'INR',
    name: 'Pizza Delivery 🍕',
    description: 'Custom Pizza Order',
    order_id: orderId,
    handler: function (response) {
      // Called on successful payment
      onSuccess?.({
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      });
    },
    prefill: {
      name: userName || '',
      email: userEmail || '',
    },
    theme: {
      color: '#ff6b35',
    },
    modal: {
      ondismiss: function () {
        onFailure?.('Payment cancelled by user');
      },
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.on('payment.failed', function (response) {
    onFailure?.(response.error.description || 'Payment failed');
  });
  rzp.open();
};
