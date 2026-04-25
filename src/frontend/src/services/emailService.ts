// Brevo Email Service Integration
const BREVO_API_KEY = import.meta.env.VITE_BREVO_API_KEY || "";

export interface SendEmailParams {
  to: string;
  name: string;
  subject: string;
  textContent: string;
  htmlContent: string;
}

export async function sendEmail({ to, name, subject, textContent, htmlContent }: SendEmailParams) {
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
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
      <h2 style="color: #16a34a;">Welcome to NeXgro!</h2>
      <p>Hi ${name},</p>
      <p>Please use the following verification code to complete your registration:</p>
      <div style="background-color: #f0fdf4; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #166534;">${otp}</span>
      </div>
      <p style="color: #64748b; font-size: 14px;">If you didn't request this code, you can safely ignore this email.</p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #94a3b8;">© 2026 NeXgro. Built by Jovin Nijo.</p>
    </div>
  `;

  return sendEmail({ to: email, name, subject, textContent, htmlContent });
}
export async function sendWelcomeEmail(email: string, name: string) {
  const couponCode = "WELCOME10";
  // NOTE: For emails, images must be hosted on a public URL. 
  // Replace the placeholder below with your live website URL once deployed.
  const bannerUrl = "https://nexgro.com/assets/banner1.png"; 

  const subject = "Welcome to NeXgro! 🥦 Your gift inside...";
  const textContent = `Hi ${name}, welcome to NeXgro! Use code ${couponCode} for 10% off your first order.`;
  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
      <img src="${bannerUrl}" alt="Welcome to NeXgro" style="width: 100%; height: auto; display: block;" />
      <div style="padding: 32px; text-align: center;">
        <h1 style="color: #16a34a; margin-top: 0;">Welcome, ${name}!</h1>
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">
          We're thrilled to have you on board. Start your journey to fresh, fast groceries with a special gift from us.
        </p>
        <div style="margin: 32px 0; padding: 20px; background: #f0fdf4; border: 2px dashed #16a34a; border-radius: 12px;">
          <p style="margin: 0; font-size: 14px; color: #16a34a; text-transform: uppercase; font-weight: bold; letter-spacing: 1px;">First Order Discount</p>
          <h2 style="margin: 8px 0; font-size: 32px; color: #16a34a;">${couponCode}</h2>
          <p style="margin: 0; font-size: 14px; color: #16a34a;">Get 10% OFF everything!</p>
        </div>
        <a href="https://nexgro.com" style="display: inline-block; padding: 14px 32px; background: #16a34a; color: white; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px;">Shop Now</a>
      </div>
      <div style="padding: 20px; background: #f8fafc; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0; font-size: 12px; color: #64748b;">
          © ${new Date().getFullYear()} NeXgro Store. Freshness delivered.
        </p>
      </div>
    </div>
  `;

  return sendEmail({ to: email, name, subject, textContent, htmlContent });
}
