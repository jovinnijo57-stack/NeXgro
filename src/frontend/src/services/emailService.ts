// Brevo Email Service Integration
// API key is loaded from environment variable. Set VITE_BREVO_API_KEY in your .env or Render dashboard.
const BREVO_API_KEY = import.meta.env.VITE_BREVO_API_KEY || "";

// Your live Render domain — update this after deploying
const SITE_URL = "https://nexgro-app.onrender.com";

import { toast } from "sonner";

export interface SendEmailParams {
  to: string;
  name: string;
  subject: string;
  textContent: string;
  htmlContent: string;
}

export async function sendEmail({ to, name, subject, textContent, htmlContent }: SendEmailParams) {
  if (!BREVO_API_KEY) {
    console.warn("BREVO_API_KEY is not set. Skipping email send.");
    toast.info("Email skipped (API key not configured)");
    return { messageId: "skipped" };
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "NeXgro Store", email: "nexgrostore@gmail.com" },
        to: [{ email: to, name }],
        subject,
        textContent,
        htmlContent,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Brevo API Detailed Error:", errorData);
      const msg = errorData.message || "Failed to send email";
      toast.error(`Email Error: ${msg}`);
      throw new Error(msg);
    }

    return await response.json();
  } catch (error) {
    console.error("Email Service Error:", error);
    throw error;
  }
}

export async function sendOTP(email: string, name: string, otp: string) {
  const subject = "Verify your NeXgro account";
  const textContent = `Your verification code is ${otp}. Please use this to verify your account.`;
  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #16a34a, #15803d); padding: 32px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 28px;">Ne<span style="color: #86efac;">X</span>gro</h1>
        <p style="color: rgba(255,255,255,0.7); margin: 8px 0 0; font-size: 14px;">Fresh Groceries · Delivered Fast</p>
      </div>
      <div style="padding: 32px; text-align: center;">
        <h2 style="color: #1e293b; margin-top: 0;">Verify Your Email</h2>
        <p style="color: #475569;">Hi ${name},</p>
        <p style="color: #475569;">Please use the following verification code to complete your registration:</p>
        <div style="background-color: #f0fdf4; padding: 20px; text-align: center; border-radius: 12px; margin: 24px 0; border: 2px solid #bbf7d0;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #166534;">${otp}</span>
        </div>
        <p style="color: #94a3b8; font-size: 13px;">This code expires in 60 seconds. If you didn't request this, ignore this email.</p>
      </div>
      <div style="padding: 16px; background: #f8fafc; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0; font-size: 12px; color: #94a3b8;">© ${new Date().getFullYear()} NeXgro Store. Built by Jovin Nijo.</p>
      </div>
    </div>
  `;

  return sendEmail({ to: email, name, subject, textContent, htmlContent });
}

export async function sendWelcomeEmail(email: string, name: string) {
  const couponCode = "WELCOME10";
  // Banner image hosted on your live Render site
  const bannerUrl = `${SITE_URL}/assets/banner1.png`;

  const subject = "🎉 Welcome to NeXgro! Your 10% OFF gift inside...";
  const textContent = `Hi ${name}, welcome to NeXgro! Use code ${couponCode} for 10% off your first order. Shop now at ${SITE_URL}`;
  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
      <img src="${bannerUrl}" alt="Welcome to NeXgro" style="width: 100%; height: auto; display: block;" />
      <div style="padding: 32px; text-align: center;">
        <h1 style="color: #16a34a; margin-top: 0; font-size: 28px;">Welcome, ${name}! 🎉</h1>
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">
          We're thrilled to have you on board. Start your journey to fresh, fast groceries with a special gift from us.
        </p>
        <div style="margin: 32px 0; padding: 24px; background: linear-gradient(135deg, #f0fdf4, #dcfce7); border: 2px dashed #16a34a; border-radius: 16px;">
          <p style="margin: 0 0 4px; font-size: 13px; color: #16a34a; text-transform: uppercase; font-weight: bold; letter-spacing: 2px;">Your First Order Discount</p>
          <h2 style="margin: 8px 0; font-size: 40px; color: #166534; font-weight: 900; letter-spacing: 3px;">${couponCode}</h2>
          <p style="margin: 0; font-size: 16px; color: #15803d; font-weight: 600;">Get 10% OFF on everything! 🛒</p>
        </div>
        <a href="${SITE_URL}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #16a34a, #15803d); color: white; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 12px rgba(22,163,74,0.3);">Shop Now →</a>
      </div>
      <div style="padding: 20px; background: #f8fafc; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0; font-size: 12px; color: #94a3b8;">
          © ${new Date().getFullYear()} NeXgro Store. Freshness delivered. Built by Jovin Nijo.
        </p>
      </div>
    </div>
  `;

  return sendEmail({ to: email, name, subject, textContent, htmlContent });
}

export async function sendOrderConfirmation(email: string, name: string, orderId: string, total: number) {
  const subject = `Order Confirmed! #${orderId} - NeXgro 🛒`;
  const textContent = `Hi ${name}, your order #${orderId} for ₹${total.toFixed(2)} has been confirmed. View details at ${SITE_URL}/orders/${orderId}`;
  const htmlContent = `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
      <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 40px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 32px; letter-spacing: 1px; font-weight: 800;">Order Confirmed! 🛒</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">We've received your request and we're on it!</p>
      </div>
      <div style="padding: 40px; background: white;">
        <p style="color: #1e293b; font-size: 18px; font-weight: 600; margin-bottom: 8px;">Hi ${name},</p>
        <p style="color: #475569; line-height: 1.6; font-size: 15px;">Great choice! Your order <strong>#${orderId}</strong> is officially in our system. Our team is already picking the freshest items for you.</p>
        
        <div style="margin: 30px 0; padding: 25px; background: #f0fdf4; border-radius: 16px; border: 1px solid #dcfce7;">
          <h3 style="margin-top: 0; color: #065f46; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; font-weight: 800;">Order Details</h3>
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px; padding-top: 10px; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 10px;">
            <span style="color: #475569;">Order ID</span>
            <span style="font-weight: bold; color: #1e293b;">#${orderId}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding-top: 10px;">
            <span style="color: #475569;">Amount Paid</span>
            <span style="font-size: 20px; font-weight: 800; color: #059669;">₹${total.toFixed(2)}</span>
          </div>
        </div>

        <a href="${SITE_URL}/orders/${orderId}" style="display: block; text-align: center; padding: 18px; background: #059669; color: white; text-decoration: none; border-radius: 14px; font-weight: 800; font-size: 16px; box-shadow: 0 4px 15px rgba(5,150,105,0.3); transition: transform 0.2s;">Track Order Progress →</a>
      </div>
      <div style="padding: 20px; background: #f8fafc; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0; font-size: 12px; color: #94a3b8; font-weight: 500;">© ${new Date().getFullYear()} NeXgro Store. Freshness Guaranteed.</p>
      </div>
    </div>
  `;

  return sendEmail({ to: email, name, subject, textContent, htmlContent });
}

export async function sendDeliveryNotification(email: string, name: string, orderId: string) {
  const subject = `Your NeXgro order has been delivered! 📦🎉`;
  const textContent = `Hi ${name}, good news! Your order #${orderId} has been delivered. Enjoy your groceries!`;
  const htmlContent = `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #3b82f6, #2563eb); padding: 40px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 32px;">Delivered! 📦</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0;">Hope you enjoy your fresh groceries</p>
      </div>
      <div style="padding: 32px; text-align: center;">
        <p style="color: #475569; font-size: 18px; font-weight: 500;">Hi ${name},</p>
        <p style="color: #475569; line-height: 1.6;">Your order <strong>#${orderId}</strong> was just delivered successfully. If you have any issues with your items, please let us know within 2 hours.</p>
        
        <div style="margin: 32px 0;">
          <a href="${SITE_URL}/orders/${orderId}" style="display: inline-block; padding: 14px 32px; border: 2px solid #3b82f6; color: #3b82f6; text-decoration: none; border-radius: 12px; font-weight: bold;">Rate Your Experience</a>
        </div>
        
        <p style="color: #94a3b8; font-size: 14px;">Did you know? You earned loyalty points on this order. Use them on your next purchase!</p>
      </div>
      <div style="padding: 20px; background: #f8fafc; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0; font-size: 12px; color: #94a3b8;">© ${new Date().getFullYear()} NeXgro Store. Fresh Groceries, Delivered.</p>
      </div>
    </div>
  `;

  return sendEmail({ to: email, name, subject, textContent, htmlContent });
}
export async function sendOrderCancellation(email: string, name: string, orderId: string, refundAmount: number, isCOD: boolean) {
  const subject = `Order #${orderId} - Cancellation Update ⚠️`;
  const textContent = `Hi ${name}, your order #${orderId} has been cancelled. Refund: ₹${refundAmount.toFixed(2)}`;
  const htmlContent = `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #fee2e2; border-radius: 20px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 40px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 32px; font-weight: 800;">Order Cancelled ⚠️</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Important update regarding your purchase</p>
      </div>
      <div style="padding: 40px; background: white;">
        <p style="color: #1e293b; font-size: 18px; font-weight: 600;">Hi ${name},</p>
        <p style="color: #475569; line-height: 1.6;">Your order <strong>#${orderId}</strong> has been cancelled by the administrator.</p>
        
        <div style="margin: 30px 0; padding: 25px; background: #fef2f2; border-radius: 16px; border: 1px solid #fee2e2;">
          <h3 style="margin-top: 0; color: #991b1b; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; font-weight: 800;">Refund Status</h3>
          <p style="color: #7f1d1d; font-size: 15px; margin: 10px 0;">
            ${isCOD 
              ? `Since this was a COD order, the non-refundable delivery fee and GST will be adjusted in your next order.` 
              : `A refund of <strong>₹${refundAmount.toFixed(2)}</strong> has been credited to your wallet (GST & Delivery fees are non-refundable).`}
          </p>
        </div>

        <div style="text-align: center;">
          <a href="${SITE_URL}/wallet" style="display: inline-block; padding: 16px 32px; background: #dc2626; color: white; text-decoration: none; border-radius: 14px; font-weight: 800; font-size: 15px;">View Wallet Balance</a>
        </div>
        
        <p style="color: #94a3b8; font-size: 13px; margin-top: 30px; text-align: center;">If you have any questions, please chat with our support team in the app.</p>
      </div>
      <div style="padding: 20px; background: #fef2f2; text-align: center; border-top: 1px solid #fee2e2;">
        <p style="margin: 0; font-size: 12px; color: #991b1b;">NeXgro Platform Safety & Reliability Team</p>
      </div>
    </div>
  `;

  return sendEmail({ to: email, name, subject, textContent, htmlContent });
}
