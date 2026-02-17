const nodemailer = require('nodemailer');

async function sendOrderConfirmation(toEmail, order) {
  try {
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      } : undefined
    });
    const info = await transport.sendMail({
      from: process.env.SMTP_FROM || 'no-reply@painting.gallery',
      to: toEmail,
      subject: `Order Confirmation #${order._id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Thank you for your order</h1>
          <p>Order ID: <strong>${order._id}</strong></p>
          <p>Status: <span style="color: green;">${order.status}</span></p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="padding: 10px; text-align: left;">Item</th>
                <th style="padding: 10px; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #eee;">Painting (ID: ${item.paintingId})</td>
                  <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${item.priceUSD}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td style="padding: 10px; font-weight: bold;">Total</td>
                <td style="padding: 10px; font-weight: bold; text-align: right;">$${order.totalUSD}</td>
              </tr>
            </tfoot>
          </table>
          
          <p style="margin-top: 30px; font-size: 12px; color: #999;">
            If you have any questions, please reply to this email.
          </p>
        </div>
      `
    });
    return info;
  } catch (e) {
    return null;
  }
}

async function sendContactMessage(data) {
  try {
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      } : undefined
    });
    const info = await transport.sendMail({
      from: process.env.SMTP_FROM || 'no-reply@painting.gallery',
      to: process.env.ADMIN_EMAIL || 'admin@painting.gallery',
      replyTo: data.email,
      subject: `New Contact Message from ${data.name}`,
      text: `Name: ${data.name}\nEmail: ${data.email}\n\nMessage:\n${data.message}`
    });
    return info;
  } catch (e) {
    console.error('Email error:', e);
    return null;
  }
}

module.exports = { sendOrderConfirmation, sendContactMessage };
