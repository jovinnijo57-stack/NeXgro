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
