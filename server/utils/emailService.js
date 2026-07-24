const normalizeUrl = (value) => (value || '').trim().replace(/\/+$/, '');

/**
 * Check if Brevo API is configured
 */
const isBrevoConfigured = () => {
  return Boolean(process.env.BREVO_API_KEY && process.env.BREVO_API_KEY.trim());
};

/**
 * Send transactional email via Brevo REST API (v3)
 */
const sendViaBrevo = async ({ toEmail, toName, subject, htmlContent }) => {
  const apiKey = process.env.BREVO_API_KEY ? process.env.BREVO_API_KEY.trim() : '';
  if (!apiKey) {
    throw new Error('BREVO_API_KEY is missing in server/.env');
  }

  const senderEmail =
    (process.env.BREVO_SENDER_EMAIL || process.env.ADMIN_EMAIL || 'noreply@pizzabyte.com').trim();
  const senderName = (process.env.BREVO_SENDER_NAME || 'PizzaByte 🍕').trim();

  const payload = {
    sender: {
      name: senderName,
      email: senderEmail,
    },
    to: [
      {
        email: toEmail,
        name: toName || 'Customer',
      },
    ],
    subject: subject,
    htmlContent: htmlContent,
  };

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const responseData = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = responseData.message || responseData.code || `HTTP ${response.status}`;
    throw new Error(`Brevo API Error (${response.status}): ${errorMsg}`);
  }

  return { success: true, provider: 'Brevo', messageId: responseData.messageId };
};

/**
 * Core email dispatcher
 */
const dispatchEmail = async ({ emailType, to, toName, subject, html }) => {
  if (!to) {
    console.warn(`⚠️ Email dispatch skipped: recipient address missing for type '${emailType}'.`);
    return { skipped: true };
  }

  if (isBrevoConfigured()) {
    try {
      const result = await sendViaBrevo({
        toEmail: to,
        toName,
        subject,
        htmlContent: html,
      });

      console.log(`📧 Email (${emailType}) sent to ${to} via Brevo`);
      return result;
    } catch (err) {
      console.error(`❌ Brevo Dispatch Error for ${to}:`, err.message);
      throw err;
    }
  }

  console.log(
    `ℹ️ [Brevo] Email of type '${emailType}' requested for ${to}. Configure BREVO_API_KEY in server/.env to send live emails.`
  );
  return { mock: true, recipient: to, type: emailType };
};

/**
 * Legacy init function alias
 */
const initTransporter = async () => {
  if (isBrevoConfigured()) {
    console.log('📧 Email service ready (Brevo API configured)');
  } else {
    console.log('📧 Email service in standby mode (BREVO_API_KEY not set in server/.env)');
  }
};

/**
 * Send a verification email to a new user
 */
const sendVerificationEmail = async (email, name, token) => {
  const frontendUrl = normalizeUrl(process.env.FRONTEND_URL);
  const verifyUrl = `${frontendUrl}/verify-email/${token}`;
  const subject = 'Verify Your Email — PizzaByte';

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #ff6b35, #e63946); padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🍕 PizzaByte</h1>
        <p style="margin: 5px 0 0; opacity: 0.9;">Welcome aboard!</p>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #f4a261;">Hey ${name}! 👋</h2>
        <p style="line-height: 1.6; color: #ccc;">Thanks for signing up. Please verify your email address to start ordering delicious pizzas.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background: linear-gradient(135deg, #ff6b35, #e63946); color: #fff; padding: 14px 40px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">Verify Email</a>
        </div>
        <p style="font-size: 13px; color: #888;">If the button doesn't work, copy this link:<br>${verifyUrl}</p>
      </div>
    </div>
  `;

  return await dispatchEmail({
    emailType: 'verify',
    to: email,
    toName: name,
    subject,
    html,
  });
};

/**
 * Send a password reset email
 */
const sendPasswordResetEmail = async (email, name, token) => {
  const frontendUrl = normalizeUrl(process.env.FRONTEND_URL);
  const resetUrl = `${frontendUrl}/reset-password/${token}`;
  const subject = 'Reset Your Password — PizzaByte';

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #ff6b35, #e63946); padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🍕 PizzaByte</h1>
        <p style="margin: 5px 0 0; opacity: 0.9;">Password Reset</p>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #f4a261;">Hi ${name},</h2>
        <p style="line-height: 1.6; color: #ccc;">We received a request to reset your password. Click the button below to set a new password.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: linear-gradient(135deg, #ff6b35, #e63946); color: #fff; padding: 14px 40px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">Reset Password</a>
        </div>
        <p style="font-size: 13px; color: #888;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
      </div>
    </div>
  `;

  return await dispatchEmail({
    emailType: 'reset',
    to: email,
    toName: name,
    subject,
    html,
  });
};

/**
 * Send a welcome email to a new user
 */
const sendWelcomeEmail = async (email, name) => {
  const frontendUrl = normalizeUrl(process.env.FRONTEND_URL);
  const subject = 'Welcome to PizzaByte! 🍕';

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #ff6b35, #e63946); padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🍕 PizzaByte</h1>
        <p style="margin: 5px 0 0; opacity: 0.9;">Welcome to the family!</p>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #f4a261;">Hey ${name}! 👋</h2>
        <p style="line-height: 1.6; color: #ccc;">Thanks for signing up at PizzaByte! We're excited to have you on board.</p>
        <p style="line-height: 1.6; color: #ccc;">Your account is ready to go. You can start building your custom pizzas and ordering right away!</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${frontendUrl}/login" style="background: linear-gradient(135deg, #ff6b35, #e63946); color: #fff; padding: 14px 40px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">Order Now</a>
        </div>
      </div>
    </div>
  `;

  return await dispatchEmail({
    emailType: 'welcome',
    to: email,
    toName: name,
    subject,
    html,
  });
};

/**
 * Send low-stock alert email to admin
 */
const sendLowStockAlert = async (lowStockItems) => {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.BREVO_SENDER_EMAIL;
  const subject = `⚠️ Low Stock Alert — ${lowStockItems.length} item(s) need restocking`;

  const itemsList = lowStockItems
    .map(
      (item) =>
        `<tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #333; color: #ccc;">${item.name}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #333; color: #ccc; text-transform: capitalize;">${item.category}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #333; color: ${item.quantity <= 5 ? '#e63946' : '#f4a261'}; font-weight: bold;">${item.quantity} ${item.unit}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #333; color: #888;">${item.threshold} ${item.unit}</td>
        </tr>`
    )
    .join('');

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #e63946, #d62828); padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">⚠️ Low Stock Alert</h1>
        <p style="margin: 5px 0 0; opacity: 0.9;">${lowStockItems.length} item(s) below threshold</p>
      </div>
      <div style="padding: 30px;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 2px solid #ff6b35;">
              <th style="padding: 8px 12px; text-align: left; color: #ff6b35;">Item</th>
              <th style="padding: 8px 12px; text-align: left; color: #ff6b35;">Category</th>
              <th style="padding: 8px 12px; text-align: left; color: #ff6b35;">Stock</th>
              <th style="padding: 8px 12px; text-align: left; color: #ff6b35;">Threshold</th>
            </tr>
          </thead>
          <tbody>${itemsList}</tbody>
        </table>
        <p style="margin-top: 20px; font-size: 13px; color: #888;">Please restock these items as soon as possible.</p>
      </div>
    </div>
  `;

  return await dispatchEmail({
    emailType: 'alert',
    to: adminEmail,
    toName: 'Admin',
    subject,
    html,
  });
};

/**
 * Send an order confirmation email to the user
 */
const sendOrderConfirmationEmail = async (email, name, order) => {
  const frontendUrl = normalizeUrl(process.env.FRONTEND_URL);
  const orderIdShort = order._id ? order._id.toString().slice(-6).toUpperCase() : 'ORDER';
  const subject = `🍕 Order Confirmed! — PizzaByte (Order #${orderIdShort})`;

  const itemsHtml = (order.items || [])
    .map((item) => {
      const vegNames = item.vegetables && item.vegetables.length > 0
        ? item.vegetables.map((v) => v.name).join(', ')
        : 'None';

      return `
        <div style="border-bottom: 1px solid #333; padding: 15px 0;">
          <h3 style="margin: 0 0 5px 0; color: #ff6b35;">🍕 ${item.pizzaName}</h3>
          <p style="margin: 0 0 5px 0; font-size: 14px; color: #ccc;">
            <strong>Base:</strong> ${item.base?.name || 'Standard'}<br/>
            <strong>Sauce:</strong> ${item.sauce?.name || 'Standard'}<br/>
            <strong>Cheese:</strong> ${item.cheese?.name || 'Standard'}<br/>
            <strong>Vegetables:</strong> ${vegNames}
          </p>
          <div style="text-align: right; font-weight: bold; color: #f4a261; font-size: 16px;">
            ₹${item.price}
          </div>
        </div>
      `;
    })
    .join('');

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #ff6b35, #e63946); padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🍕 PizzaByte</h1>
        <p style="margin: 5px 0 0; opacity: 0.9;">Order Confirmation</p>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #f4a261; margin-top: 0;">Thanks for your order, ${name}! 🎉</h2>
        <p style="line-height: 1.6; color: #ccc;">Your order has been received and is currently being prepared. Below are your order details:</p>
        
        <div style="background: #16162a; border-radius: 8px; padding: 15px; margin: 20px 0; border: 1px solid #333;">
          <p style="margin: 0 0 10px 0; font-size: 14px; color: #888;">
            <strong>Order ID:</strong> #${order._id}<br/>
            <strong>Date:</strong> ${new Date(order.createdAt || Date.now()).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}<br/>
            <strong>Payment Status:</strong> Paid (via Razorpay)<br/>
            <strong>Preparation Status:</strong> ${order.status || 'Order Received'}
          </p>
          <p style="margin: 10px 0 0 0; font-size: 14px; color: #888;">
            <strong>Delivery Address:</strong><br/>
            <span style="color: #ccc; display: block; margin-top: 4px;">${order.deliveryAddress || 'Address provided'}</span>
          </p>
        </div>

        <h3 style="color: #ff6b35; border-bottom: 2px solid #ff6b35; padding-bottom: 5px; margin-bottom: 10px;">Items Ordered</h3>
        ${itemsHtml}

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px; padding: 15px 0; border-top: 2px solid #ff6b35;">
          <span style="font-size: 18px; font-weight: bold; color: #fff;">Total Amount:</span>
          <span style="font-size: 22px; font-weight: bold; color: #ff6b35;">₹${order.totalAmount}</span>
        </div>

        <div style="text-align: center; margin: 30px 0 10px 0;">
          <a href="${frontendUrl}/order/${order._id}" style="background: linear-gradient(135deg, #ff6b35, #e63946); color: #fff; padding: 14px 40px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">Track Order Status</a>
        </div>
      </div>
    </div>
  `;

  return await dispatchEmail({
    emailType: 'order',
    to: email,
    toName: name,
    subject,
    html,
  });
};

module.exports = {
  initTransporter,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendLowStockAlert,
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
};
