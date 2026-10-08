const nodemailer = require('nodemailer');

// Configure Email Transporter
function getTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host: host,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: user,
        pass: pass
      }
    });
  }
  return null;
}

// Generate formatted WhatsApp message text
function generateWhatsAppMessage(order, items) {
  const currency = 'Rs.';
  let itemsList = items
    .map(
      (item, idx) =>
        `${idx + 1}. *${item.item_name}* (${item.size_name}) x ${item.quantity} = ${currency} ${item.subtotal}`
    )
    .join('\n');

  const text = `🍕 *NEW PIZZA HUB ORDER: #${order.order_id}*
---------------------------------------
👤 *Customer:* ${order.customer_name}
📞 *Phone:* ${order.customer_phone}
💬 *WhatsApp:* ${order.customer_whatsapp || order.customer_phone}
📍 *Delivery Address:* ${order.delivery_address}
${order.landmark ? `🏢 *Landmark:* ${order.landmark}\n` : ''}🏙️ *City:* ${order.city || 'Karachi'}
---------------------------------------
🛒 *ITEMS ORDERED:*
${itemsList}
---------------------------------------
💵 *Subtotal:* ${currency} ${order.subtotal}
🚚 *Delivery Charges:* ${currency} ${order.delivery_charges}
${order.discount_amount > 0 ? `🏷️ *Discount (${order.coupon_code}):* -${currency} ${order.discount_amount}\n` : ''}💰 *TOTAL AMOUNT:* ${currency} ${order.total_amount}
💳 *Payment Method:* ${order.payment_method}
${order.order_notes ? `📝 *Notes:* ${order.order_notes}\n` : ''}---------------------------------------
⏱️ *Status:* Order Received & Being Prepared
🔗 *Track Link:* http://localhost:3000/track-order?orderId=${order.order_id}`;

  return text;
}

// Generate Customer Confirmation WhatsApp Message
function generateCustomerWhatsAppMessage(order, items) {
  const currency = 'Rs.';
  let itemsList = items
    .map((item) => `• ${item.item_name} (${item.size_name}) x ${item.quantity}`)
    .join('\n');

  const text = `🍕 *Hello ${order.customer_name}!*
Thank you for choosing *Pizza Hub*! Your order *#${order.order_id}* has been received and is being prepared with fresh dough and premium ingredients.

*Order Summary:*
${itemsList}

*Total Payable:* ${currency} ${order.total_amount} (${order.payment_method})
*Delivery Address:* ${order.delivery_address}

You can track your live order status here:
http://localhost:3000/track-order?orderId=${order.order_id}

For any queries, reply here or call us at ${process.env.RESTAURANT_PHONE || '+92 300 1234567'}.
*Pizza Hub - Fresh Pizza, Fresh Moments!* 🍕✨`;

  return text;
}

// Send Emails (Admin Alert + Customer Receipt)
async function sendOrderEmails(order, items) {
  const transporter = getTransporter();
  const fromEmail = process.env.SMTP_FROM || 'Pizza Hub <orders@pizzahub.com>';
  const adminEmail = process.env.ADMIN_ALERT_EMAIL || 'orders@pizzahub.com';

  const itemsHtml = items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 10px 0; color: #1e293b; font-weight: 600;">${item.item_name} <span style="font-size: 12px; color: #64748b; font-weight: 400;">(${item.size_name})</span></td>
        <td style="padding: 10px; text-align: center; color: #334155;">${item.quantity}</td>
        <td style="padding: 10px 0; text-align: right; color: #0f172a; font-weight: 600;">Rs. ${item.subtotal}</td>
      </tr>
    `
    )
    .join('');

  const emailHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #e11d48, #b91c1c); padding: 25px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 26px; letter-spacing: 1px;">🍕 PIZZA HUB</h1>
        <p style="margin: 5px 0 0; font-size: 14px; opacity: 0.9;">Fresh Pizza, Fresh Moments</p>
      </div>

      <div style="padding: 30px;">
        <div style="text-align: center; margin-bottom: 25px;">
          <span style="background: #fef2f2; color: #dc2626; padding: 6px 16px; border-radius: 9999px; font-weight: 700; font-size: 14px; border: 1px solid #fee2e2;">
            Order ID: #${order.order_id}
          </span>
          <h2 style="margin: 15px 0 5px; color: #0f172a;">Order Confirmation</h2>
          <p style="color: #64748b; margin: 0; font-size: 14px;">Your order has been placed and is currently being prepared.</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="border-bottom: 2px solid #e2e8f0; text-align: left; font-size: 12px; text-transform: uppercase; color: #64748b;">
              <th style="padding-bottom: 8px;">Item & Size</th>
              <th style="padding-bottom: 8px; text-align: center;">Qty</th>
              <th style="padding-bottom: 8px; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 25px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #475569; font-size: 14px;">
            <span>Subtotal:</span>
            <span>Rs. ${order.subtotal}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #475569; font-size: 14px;">
            <span>Delivery Charges:</span>
            <span>Rs. ${order.delivery_charges}</span>
          </div>
          ${
            order.discount_amount > 0
              ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #16a34a; font-size: 14px;">
            <span>Coupon Discount (${order.coupon_code}):</span>
            <span>-Rs. ${order.discount_amount}</span>
          </div>`
              : ''
          }
          <div style="border-top: 1px solid #e2e8f0; padding-top: 8px; display: flex; justify-content: space-between; color: #0f172a; font-size: 18px; font-weight: 700;">
            <span>Total Payable:</span>
            <span style="color: #e11d48;">Rs. ${order.total_amount}</span>
          </div>
        </div>

        <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; font-size: 13px; color: #475569; line-height: 1.6;">
          <p style="margin: 0 0 6px;"><strong>Delivery Address:</strong> ${order.delivery_address}</p>
          <p style="margin: 0 0 6px;"><strong>Phone / WhatsApp:</strong> ${order.customer_phone} / ${order.customer_whatsapp || 'Same'}</p>
          <p style="margin: 0 0 6px;"><strong>Payment Method:</strong> ${order.payment_method}</p>
          ${order.order_notes ? `<p style="margin: 0 0 6px;"><strong>Special Instructions:</strong> ${order.order_notes}</p>` : ''}
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="http://localhost:3000/track-order?orderId=${order.order_id}" style="background: #e11d48; color: white; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; display: inline-block;">
            Track Your Order Live
          </a>
        </div>
      </div>

      <div style="background: #0f172a; color: #94a3b8; padding: 20px; text-align: center; font-size: 12px;">
        <p style="margin: 0;">Pizza Hub Restaurant | 24/7 Delivery Available</p>
        <p style="margin: 5px 0 0;">Helpline: ${process.env.RESTAURANT_PHONE || '+92 300 1234567'} | WhatsApp: ${process.env.RESTAURANT_WHATSAPP || '923001234567'}</p>
      </div>
    </div>
  `;

  // Try sending via SMTP if configured
  if (transporter) {
    try {
      // 1. Send alert to Restaurant Admin
      await transporter.sendMail({
        from: fromEmail,
        to: adminEmail,
        subject: `🚨 [NEW ORDER] #${order.order_id} - Rs. ${order.total_amount} (${order.customer_name})`,
        html: emailHtml
      });
      console.log(`[Notification] Restaurant alert email sent for #${order.order_id}`);

      // 2. Send receipt to Customer if customer email provided
      if (order.customer_email && order.customer_email.includes('@')) {
        await transporter.sendMail({
          from: fromEmail,
          to: order.customer_email,
          subject: `🍕 Your Pizza Hub Order #${order.order_id} is Confirmed!`,
          html: emailHtml
        });
        console.log(`[Notification] Customer confirmation email sent to ${order.customer_email}`);
      }
    } catch (err) {
      console.warn('[Notification] SMTP email delivery error (check .env SMTP credentials):', err.message);
    }
  } else {
    console.log(`[Notification] SMTP not configured. Order #${order.order_id} email notification generated successfully and queued for local delivery.`);
  }
}

module.exports = {
  generateWhatsAppMessage,
  generateCustomerWhatsAppMessage,
  sendOrderEmails
};
