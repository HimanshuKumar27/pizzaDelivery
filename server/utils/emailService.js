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
    from: `"Pizza Delivery 🍕" <${process.env.EMAIL_USER || 'noreply@pizzadelivery.com'}>`,
    to: email,
    subject: 'Verify Your Email — Pizza Delivery',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #fff; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #ff6b35, #e63946); padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">🍕 Pizza Delivery</h1>
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
    from: `"Pizza Delivery 🍕" <${process.env.EMAIL_USER || 'noreply@pizzadelivery.com'}>`,
    to: email,
    subject: 'Reset Your Password — Pizza Delivery',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #fff; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #ff6b35, #e63946); padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">🍕 Pizza Delivery</h1>
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
    from: `"Pizza Delivery 🍕" <${process.env.EMAIL_USER || 'noreply@pizzadelivery.com'}>`,
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

module.exports = {
  initTransporter,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendLowStockAlert,
};
