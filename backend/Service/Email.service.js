import nodemailer from "nodemailer";

// ─── Transporter (Gmail) ──────────────────────────────────────────────────────
// In .env set:
//   SMTP_USER=yourgmail@gmail.com
//   SMTP_PASS=your_16char_app_password   ← NOT your normal Gmail password
//   FRONTEND_URL=https://your-store.com
//
// To generate an App Password:
//   Google Account → Security → 2-Step Verification → App passwords → Mail

const createTransporter = () =>
  nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n);

const logo = `
  <div style="display:inline-flex;align-items:center;gap:10px;margin-bottom:8px;">
    <div style="width:38px;height:38px;background:#6426E1;border-radius:10px;display:flex;align-items:center;justify-content:center;">
      <span style="color:#fff;font-weight:800;font-size:14px;font-family:sans-serif;">AG</span>
    </div>
    <span style="font-size:20px;font-weight:800;color:#0f0a1e;font-family:'Segoe UI',sans-serif;">Aby Gadgets</span>
  </div>`;

// ─── 1. ORDER CONFIRMATION ────────────────────────────────────────────────────
export const sendOrderConfirmationEmail = async ({ to, username, order }) => {
  const orderNumber = `Order number ${order.order_number ?? '#' + order._id.slice(-8).toUpperCase()}`;
  const trackingUrl = `${process.env.FRONTEND_URL}/track-order/${order._id}`;

  const itemRows = order.items
    .map((item) => {
      const variantInfo = [item.variant?.color, item.variant?.storage, item.variant?.ram]
        .filter(Boolean)
        .join(" / ");

      return `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #f0edfb;">
          <div style="font-weight:600;color:#0f0a1e;font-size:14px;">${item.product?.name || "Product"}</div>
          ${variantInfo ? `<div style="font-size:12px;color:#9ca3af;margin-top:2px;">${variantInfo}</div>` : ""}
          <div style="font-size:12px;color:#6b7280;margin-top:2px;">Qty: ${item.quantity}</div>
        </td>
        <td style="padding:12px 0;border-bottom:1px solid #f0edfb;text-align:right;font-weight:700;color:#0f0a1e;font-size:14px;white-space:nowrap;">
          ${fmt(item.unit_price * item.quantity)}
        </td>
      </tr>`;
    })
    .join("");

  const addressBlock = order.shipping_address
    ? `${order.shipping_address.full_name}<br>
       ${order.shipping_address.street}, ${order.shipping_address.city}<br>
       ${order.shipping_address.state}, ${order.shipping_address.country} ${order.shipping_address.postal_code || ""}<br>
       <strong>Phone:</strong> ${order.shipping_address.phone}`
    : "—";

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#faf9ff;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:580px;margin:0 auto;padding:32px 16px 48px;">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      ${logo}
    </div>

    <!-- Hero card -->
    <div style="background:linear-gradient(135deg,#6426E1 0%,#9333ea 100%);border-radius:20px;padding:32px;text-align:center;margin-bottom:24px;">
      <div style="width:56px;height:56px;background:rgba(255,255,255,0.2);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px;">
        <span style="font-size:26px;">🎉</span>
      </div>
      <h1 style="margin:0 0 8px;color:#fff;font-size:22px;font-weight:800;">Order Confirmed!</h1>
      <p style="margin:0;color:rgba(255,255,255,0.85);font-size:14px;">
        Hi ${username || "there"}, your order has been placed successfully.
      </p>
      <div style="margin-top:16px;background:rgba(255,255,255,0.15);border-radius:10px;padding:10px 20px;display:inline-block;">
        <span style="color:rgba(255,255,255,0.7);font-size:12px;letter-spacing:.06em;text-transform:uppercase;">Order number</span><br>
        <span style="color:#fff;font-size:20px;font-weight:800;letter-spacing:.08em;">#${orderNumber}</span>
      </div>
    </div>

    <!-- Order items -->
    <div style="background:#fff;border-radius:16px;border:1px solid #ede8fb;padding:24px;margin-bottom:16px;">
      <h2 style="margin:0 0 16px;font-size:15px;font-weight:700;color:#0f0a1e;">Order Summary</h2>
      <table style="width:100%;border-collapse:collapse;">
        <tbody>${itemRows}</tbody>
        <tfoot>
          <tr>
            <td style="padding-top:14px;font-weight:600;color:#6b7280;font-size:13px;">Subtotal</td>
            <td style="padding-top:14px;text-align:right;font-weight:600;color:#6b7280;font-size:13px;">${fmt(order.subtotal)}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;font-weight:600;color:#6b7280;font-size:13px;">Shipping</td>
            <td style="padding:4px 0;text-align:right;font-weight:600;color:#22c55e;font-size:13px;">Free</td>
          </tr>
          <tr>
            <td style="padding-top:10px;font-size:16px;font-weight:800;color:#0f0a1e;border-top:2px solid #f0edfb;">Total</td>
            <td style="padding-top:10px;text-align:right;font-size:16px;font-weight:800;color:#6426E1;border-top:2px solid #f0edfb;">${fmt(order.total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Shipping address -->
    <div style="background:#fff;border-radius:16px;border:1px solid #ede8fb;padding:24px;margin-bottom:16px;">
      <h2 style="margin:0 0 10px;font-size:15px;font-weight:700;color:#0f0a1e;">Shipping To</h2>
      <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.8;">${addressBlock}</p>
    </div>

    <!-- Payment -->
    <div style="background:#fff;border-radius:16px;border:1px solid #ede8fb;padding:24px;margin-bottom:24px;">
      <h2 style="margin:0 0 10px;font-size:15px;font-weight:700;color:#0f0a1e;">Payment</h2>
      <div style="display:flex;justify-content:space-between;font-size:13px;">
        <span style="color:#6b7280;">Method</span>
        <span style="font-weight:600;color:#0f0a1e;text-transform:capitalize;">${order.payment_method || "—"}</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:13px;margin-top:6px;">
        <span style="color:#6b7280;">Status</span>
        <span style="font-weight:600;color:${order.payment_status === "paid" ? "#22c55e" : "#f59e0b"};text-transform:capitalize;">
          ${order.payment_status || "Pending"}
        </span>
      </div>
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:32px;">
      <a href="${trackingUrl}"
        style="display:inline-block;background:#6426E1;color:#fff;font-size:14px;font-weight:700;padding:14px 32px;border-radius:12px;text-decoration:none;letter-spacing:.02em;">
        Track My Order →
      </a>
    </div>

    <!-- Footer -->
    <div style="text-align:center;font-size:12px;color:#9ca3af;line-height:1.8;">
      <p style="margin:0 0 4px;">Questions? Reply to this email or visit our <a href="${process.env.FRONTEND_URL}/contact" style="color:#6426E1;">Help Center</a>.</p>
      <p style="margin:0;">© ${new Date().getFullYear()} Aby Gadgets · Premium Tech Store</p>
    </div>

  </div>
</body>
</html>`;

  return createTransporter().sendMail({
    from: `"Aby Gadgets" <${process.env.SMTP_USER}>`,
    to,
    subject: `Order Confirmed 🎉 – #${orderNumber} | Aby Gadgets`,
    html,
  });
};

// ─── 2. CONTACT FORM ──────────────────────────────────────────────────────────
export const sendContactEmail = async ({ name, email, phone, service, message }) => {
  const transporter = createTransporter();

  // A. Notify the store owner
  const adminHtml = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#faf9ff;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:540px;margin:0 auto;padding:32px 16px 48px;">
    <div style="text-align:center;margin-bottom:24px;">${logo}</div>
    <div style="background:#fff;border-radius:16px;border:1px solid #ede8fb;padding:28px;">
      <div style="display:inline-block;background:#6426E1;color:#fff;font-size:11px;font-weight:700;padding:4px 12px;border-radius:100px;letter-spacing:.06em;text-transform:uppercase;margin-bottom:16px;">
        New Contact Form Submission
      </div>
      <h2 style="margin:0 0 20px;font-size:18px;font-weight:800;color:#0f0a1e;">You've got a new message!</h2>
      ${[
        ["Name",    name],
        ["Email",   `<a href="mailto:${email}" style="color:#6426E1;">${email}</a>`],
        ["Phone",   phone || "—"],
        ["Service", service || "—"],
      ].map(([label, val]) => `
        <div style="display:flex;gap:12px;padding:10px 0;border-bottom:1px solid #f0edfb;font-size:13px;">
          <span style="color:#9ca3af;width:70px;flex-shrink:0;">${label}</span>
          <span style="font-weight:600;color:#0f0a1e;">${val}</span>
        </div>`).join("")}
      <div style="margin-top:16px;">
        <p style="font-size:13px;color:#9ca3af;margin:0 0 6px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Message</p>
        <div style="background:#faf9ff;border-radius:10px;padding:16px;font-size:14px;color:#374151;line-height:1.7;border:1px solid #ede8fb;">
          ${message.replace(/\n/g, "<br>")}
        </div>
      </div>
      <div style="margin-top:20px;">
        <a href="mailto:${email}?subject=Re: Your enquiry at Aby Gadgets"
          style="display:inline-block;background:#6426E1;color:#fff;font-size:13px;font-weight:700;padding:12px 24px;border-radius:10px;text-decoration:none;">
          Reply to ${name}
        </a>
      </div>
    </div>
    <p style="text-align:center;font-size:12px;color:#9ca3af;margin-top:20px;">© ${new Date().getFullYear()} Aby Gadgets</p>
  </div>
</body>
</html>`;

  // B. Auto-reply to customer
  const customerHtml = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#faf9ff;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:540px;margin:0 auto;padding:32px 16px 48px;">
    <div style="text-align:center;margin-bottom:24px;">${logo}</div>
    <div style="background:linear-gradient(135deg,#6426E1 0%,#9333ea 100%);border-radius:20px;padding:28px;text-align:center;margin-bottom:20px;">
      <div style="font-size:32px;margin-bottom:8px;">💬</div>
      <h1 style="margin:0 0 6px;color:#fff;font-size:20px;font-weight:800;">We got your message!</h1>
      <p style="margin:0;color:rgba(255,255,255,0.85);font-size:13px;">Thanks for reaching out, ${name}. We'll respond within 24 hours.</p>
    </div>
    <div style="background:#fff;border-radius:16px;border:1px solid #ede8fb;padding:24px;margin-bottom:20px;">
      <h2 style="margin:0 0 14px;font-size:14px;font-weight:700;color:#0f0a1e;">Your message summary</h2>
      ${service ? `<div style="font-size:13px;color:#6b7280;margin-bottom:8px;"><strong>Topic:</strong> ${service}</div>` : ""}
      <div style="background:#faf9ff;border-radius:10px;padding:14px;font-size:13px;color:#374151;line-height:1.7;border:1px solid #f0edfb;">
        ${message.replace(/\n/g, "<br>")}
      </div>
    </div>
    <div style="text-align:center;margin-bottom:24px;">
      <a href="${process.env.FRONTEND_URL}/products"
        style="display:inline-block;background:#0f0a1e;color:#fff;font-size:13px;font-weight:700;padding:13px 28px;border-radius:12px;text-decoration:none;">
        Browse Our Products
      </a>
    </div>
    <p style="text-align:center;font-size:12px;color:#9ca3af;line-height:1.8;">
      © ${new Date().getFullYear()} Aby Gadgets · Premium Tech Store<br>
      <a href="${process.env.FRONTEND_URL}" style="color:#6426E1;">Visit Store</a>
    </p>
  </div>
</body>
</html>`;

  await Promise.all([
    // Notify store
    transporter.sendMail({
      from: `"Aby Gadgets Contact" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      replyTo: email,
      subject: `New Contact: ${service || "General"} from ${name}`,
      html: adminHtml,
    }),
    // Auto-reply to sender
    transporter.sendMail({
      from: `"Aby Gadgets" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `We received your message – Aby Gadgets`,
      html: customerHtml,
    }),
  ]);
};