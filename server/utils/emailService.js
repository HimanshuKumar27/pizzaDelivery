const nodemailer = require('nodemailer');

let transporter;

/**
 * Initialize the email transporter.
 * Uses Ethereal (fake SMTP) if no real credentials are configured.
 */
const initTransporter = async () => {
  if (transporter) return transporter;

  // Check if real email credentials are provided
  const hasRealCredentials =
    process.env.EMAIL_USER &&
    process.env.EMAIL_PASS &&
    !process.env.EMAIL_USER.includes('ethereal');

  if (hasRealCredentials) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    console.log('📧 Email transporter initialized with real credentials');
  } else {
    // Use Ethereal for testing — emails viewable at https://ethereal.email
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('📧 Email transporter initialized with Ethereal (test mode)');
    console.log(`   Preview URL base: https://ethereal.email`);
    console.log(`   Test user: ${testAccount.user}`);
  }

  return transporter;
};

/**
 * Send a verification email to a new user
 */
const sendVerificationEmail = async (email, name, token) => {
  const t = await initTransporter();
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;

  const mailOptions = {
    from: `"PizzaByte 🍕" <${process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@pizzabyte.com'}>`,
    to: email,
    subject: 'Verify Your Email — PizzaByte',
    html: `
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
    `,
  };

  const info = await t.sendMail(mailOptions);
  console.log(`📧 Verification email sent to ${email}`);

  // If using Ethereal, log preview URL
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`   Preview: ${previewUrl}`);
  }

  return info;
};

/**
 * Send a password reset email
 */
const sendPasswordResetEmail = async (email, name, token) => {
  const t = await initTransporter();
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

  const mailOptions = {
    from: `"PizzaByte 🍕" <${process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@pizzabyte.com'}>`,
    to: email,
    subject: 'Reset Your Password — PizzaByte',
    html: `
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
    `,
  };

  const info = await t.sendMail(mailOptions);
  console.log(`📧 Password reset email sent to ${email}`);

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`   Preview: ${previewUrl}`);
  }

  return info;
};

/**
 * Send low-stock alert email to admin
 */
const sendLowStockAlert = async (lowStockItems) => {
  const t = await initTransporter();

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

  const mailOptions = {
    from: `"PizzaByte 🍕" <${process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@pizzabyte.com'}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `⚠️ Low Stock Alert — ${lowStockItems.length} item(s) need restocking`,
    html: `
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
    `,
  };

  const info = await t.sendMail(mailOptions);
  console.log(`📧 Low stock alert sent to ${process.env.ADMIN_EMAIL}`);

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`   Preview: ${previewUrl}`);
  }

  return info;
};

/**
 * Send a welcome email to a new user
 */
const sendWelcomeEmail = async (email, name) => {
  const t = await initTransporter();

  const mailOptions = {
    from: `"PizzaByte 🍕" <${process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@pizzabyte.com'}>`,
    to: email,
    subject: 'Welcome to PizzaByte! 🍕',
    html: `
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
            <a href="${process.env.FRONTEND_URL}/login" style="background: linear-gradient(135deg, #ff6b35, #e63946); color: #fff; padding: 14px 40px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">Order Now</a>
          </div>
        </div>
      </div>
    `,
  };

  const info = await t.sendMail(mailOptions);
  console.log(`📧 Welcome email sent to ${email}`);

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`   Preview: ${previewUrl}`);
  }

  return info;
};

/**
 * Send an order confirmation email to the user
 */
const sendOrderConfirmationEmail = async (email, name, order) => {
  const t = await initTransporter();

  // Construct items list HTML
  const itemsHtml = order.items
    .map((item) => {
      const vegNames = item.vegetables && item.vegetables.length > 0
        ? item.vegetables.map(v => v.name).join(', ')
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

  const mailOptions = {
    from: `"PizzaByte 🍕" <${process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@pizzabyte.com'}>`,
    to: email,
    subject: `🍕 Order Confirmed! — PizzaByte (Order #${order._id.toString().slice(-6).toUpperCase()})`,
    html: `
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
              <strong>Date:</strong> ${new Date(order.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}<br/>
              <strong>Payment Status:</strong> Paid (via Razorpay)<br/>
              <strong>Preparation Status:</strong> ${order.status}
            </p>
            <p style="margin: 10px 0 0 0; font-size: 14px; color: #888;">
              <strong>Delivery Address:</strong><br/>
              <span style="color: #ccc; display: block; margin-top: 4px;">${order.deliveryAddress}</span>
            </p>
          </div>

          <h3 style="color: #ff6b35; border-bottom: 2px solid #ff6b35; padding-bottom: 5px; margin-bottom: 10px;">Items Ordered</h3>
          ${itemsHtml}

          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px; padding: 15px 0; border-top: 2px solid #ff6b35;">
            <span style="font-size: 18px; font-weight: bold; color: #fff;">Total Amount:</span>
            <span style="font-size: 22px; font-weight: bold; color: #ff6b35;">₹${order.totalAmount}</span>
          </div>

          <div style="text-align: center; margin: 30px 0 10px 0;">
            <a href="${process.env.FRONTEND_URL}/order/${order._id}" style="background: linear-gradient(135deg, #ff6b35, #e63946); color: #fff; padding: 14px 40px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">Track Order Status</a>
          </div>
        </div>
      </div>
    `,
  };

  const info = await t.sendMail(mailOptions);
  console.log(`📧 Order confirmation email sent to ${email} for order ${order._id}`);

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`   Preview: ${previewUrl}`);
  }

  return info;
};

module.exports = {
  initTransporter,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendLowStockAlert,
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
};
