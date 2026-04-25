/**
 * WhatsApp Business API Integration Service
 * 
 * To use a real WhatsApp API, you typically need:
 * 1. A Meta Developer Account
 * 2. A verified Business Phone Number
 * 3. An Access Token
 */

const WHATSAPP_API_URL = "https://graph.facebook.com/v18.0/YOUR_PHONE_NUMBER_ID/messages";
const WHATSAPP_TOKEN = "YOUR_ACCESS_TOKEN";

export async function sendWhatsAppOTP(phone: string, otp: string) {
  // NOTE: In production, you MUST use an environment variable for the token
  // and your Phone Number ID.
  
  // Clean the phone number (must be in E.164 format: +123456789)
  const cleanPhone = phone.replace(/\D/g, "");

  try {
    const response = await fetch(WHATSAPP_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: cleanPhone,
        type: "template",
        template: {
          name: "otp_verification", // You must create this template in Meta Dashboard
          language: {
            code: "en_US"
          },
          components: [
            {
              type: "body",
              parameters: [
                {
                  type: "text",
                  text: otp
                }
              ]
            },
            {
              type: "button",
              sub_type: "url",
              index: "0",
              parameters: [
                {
                  type: "text",
                  text: otp
                }
              ]
            }
          ]
        }
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("WhatsApp API Error:", error);
      throw new Error("Failed to send WhatsApp message");
    }

    return await response.json();
  } catch (error) {
    console.error("WhatsApp Service Error:", error);
    throw error;
  }
}
