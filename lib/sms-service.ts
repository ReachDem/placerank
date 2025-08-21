import { MboaSMSRequest, MboaSMSResponse } from "@/lib/types/sms";

// SMS Service using mboasms API
export class SMSService {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    this.apiUrl = process.env.MBOA_SMS_API_URL || "https://api.mboasms.com";
    this.apiKey = process.env.MBOA_SMS_API_KEY || "";
    
    if (!this.apiKey) {
      throw new Error("MBOA_SMS_API_KEY environment variable is required");
    }
  }

  async sendSMS(to: string | string[], message: string, from?: string): Promise<MboaSMSResponse> {
    try {
      // Convert array to comma-separated string if needed
      const recipients = Array.isArray(to) ? to.join(",") : to;

      const requestData: MboaSMSRequest = {
        apikey: this.apiKey,
        to: recipients,
        message,
        ...(from && { from })
      };

      const response = await fetch(`${this.apiUrl}/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: MboaSMSResponse = await response.json();
      return result;
    } catch (error) {
      console.error("SMS sending error:", error);
      throw new Error(`Failed to send SMS: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  // Validate phone number format
  validatePhoneNumber(phone: string): boolean {
    // Basic international phone number validation
    // Should start with + and contain only digits
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  }

  // Validate SMS message length
  validateMessage(message: string): boolean {
    // SMS standard limit is 160 characters for single SMS
    return message.length > 0 && message.length <= 1600; // Allow up to 10 concatenated SMS
  }
}