import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendOrderConfirmationEmail(
  to: string,
  orderDetails: {
    orderId: string;
    customerName: string;
    items: Array<{ name: string; quantity: number; price: number }>;
    total: number;
    address: string;
    paymentMethod: string;
  }
) {
  const itemsHtml = orderDetails.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px;border-bottom:1px solid #eee">${item.name}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">₹${(item.price * item.quantity).toFixed(0)}</td>
        </tr>`
    )
    .join('');

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#0a0a0a;padding:24px;text-align:center">
        <h1 style="color:#f97316;margin:0;font-size:24px">👓 EyeWear Store</h1>
      </div>
      <div style="padding:32px;background:#fff">
        <h2 style="color:#111">Order Confirmed! 🎉</h2>
        <p style="color:#555">Hi ${orderDetails.customerName}, your order has been placed successfully.</p>
        <div style="background:#f9f9f9;padding:16px;border-radius:8px;margin:16px 0">
          <p style="margin:0;font-weight:bold;color:#111">Order ID: #${orderDetails.orderId.slice(-8).toUpperCase()}</p>
          <p style="margin:4px 0;color:#555">Payment: ${orderDetails.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'}</p>
        </div>
        <table style="width:100%;border-collapse:collapse">
          <thead>
            <tr style="background:#f0f0f0">
              <th style="padding:8px;text-align:left">Item</th>
              <th style="padding:8px;text-align:center">Qty</th>
              <th style="padding:8px;text-align:right">Amount</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding:12px;font-weight:bold;text-align:right">Total</td>
              <td style="padding:12px;font-weight:bold;color:#f97316;text-align:right">₹${orderDetails.total.toFixed(0)}</td>
            </tr>
          </tfoot>
        </table>
        <div style="margin-top:24px;padding:16px;background:#fff7ed;border-radius:8px;border-left:4px solid #f97316">
          <p style="margin:0;font-weight:bold;color:#111">Delivery Address</p>
          <p style="margin:4px 0;color:#555">${orderDetails.address}</p>
        </div>
      </div>
      <div style="padding:16px;background:#f0f0f0;text-align:center;color:#888;font-size:12px">
        <p>Thank you for shopping with EyeWear Store!</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'EyeWear Store <noreply@eyewear.com>',
      to,
      subject: `Order Confirmed - #${orderDetails.orderId.slice(-8).toUpperCase()}`,
      html,
    });
  } catch (error) {
    console.error('Email send failed:', error);
    // Don't throw - order is placed even if email fails
  }
}
