// WhatsApp Service Integration (Twilio or Meta Business API)
// To get started:
// 1. Twilio: Go to twilio.com, sign up, and get your Account SID, Auth Token, and WhatsApp sender number.
// 2. Meta: Go to developers.facebook.com, create a Business App, and set up the WhatsApp product.

const WHATSAPP_API_KEY = import.meta.env.VITE_WHATSAPP_API_KEY || "";
const WHATSAPP_SENDER = import.meta.env.VITE_WHATSAPP_SENDER || "+14155238886"; // Default Twilio sandbox number

import { toast } from "sonner";

export async function sendWhatsAppMessage(to: string, message: string) {
  if (!WHATSAPP_API_KEY) {
    console.warn("WHATSAPP_API_KEY is not set. Skipping WhatsApp message.");
    // Simulated behavior for demo
    console.log(`[WhatsApp Simulation] To: ${to}, Message: ${message}`);
    return { success: true, simulated: true };
  }

  // Example using a generic fetch (actual implementation depends on the provider)
  try {
    // This is a placeholder for a real API call to a provider like Twilio or a custom backend
    const response = await fetch("https://api.nexgro.com/v1/send-whatsapp", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${WHATSAPP_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ to, message, from: WHATSAPP_SENDER }),
    });

    if (!response.ok) throw new Error("WhatsApp API error");
    return await response.json();
  } catch (error) {
    console.error("WhatsApp Service Error:", error);
    toast.error("Failed to send WhatsApp reminder.");
    return { success: false, error };
  }
}

export async function sendAbandonedCartReminder(phone: string, name: string) {
  const message = `Hi ${name}! 🛒 We noticed you left some fresh items in your NeXgro cart. Don't let them go! Complete your purchase now and get fresh delivery today. Visit: https://nexgro-app.onrender.com/cart`;
  return sendWhatsAppMessage(phone, message);
}

export async function sendOrderUpdateWhatsApp(phone: string, orderId: string, status: string) {
  const message = `Update on your NeXgro order #${orderId}: Your status is now ${status}. Track it here: https://nexgro-app.onrender.com/orders/${orderId}`;
  return sendWhatsAppMessage(phone, message);
}
