import { NextRequest, NextResponse } from "next/server";
import { SMSService } from "@/lib/sms-service";
import { SMSRequest, SMSResponse } from "@/lib/types/sms";

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: SMSRequest = await request.json();
    
    // Validate required fields
    if (!body.to || !body.message) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields: 'to' and 'message' are required",
        } satisfies SMSResponse,
        { status: 400 }
      );
    }

    // Initialize SMS service
    const smsService = new SMSService();

    // Validate phone numbers
    const recipients = Array.isArray(body.to) ? body.to : [body.to];
    for (const phone of recipients) {
      if (!smsService.validatePhoneNumber(phone)) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid phone number format: ${phone}. Use international format (+1234567890)`,
          } satisfies SMSResponse,
          { status: 400 }
        );
      }
    }

    // Validate message
    if (!smsService.validateMessage(body.message)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid message: must be between 1 and 1600 characters",
        } satisfies SMSResponse,
        { status: 400 }
      );
    }

    // Send SMS
    const result = await smsService.sendSMS(body.to, body.message, body.from);

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: "SMS sent successfully",
        data: {
          messageId: result.data?.message_id,
          status: result.data?.status,
          recipients: result.data?.recipients,
          cost: result.data?.cost,
        },
      } satisfies SMSResponse,
      { status: 200 }
    );

  } catch (error) {
    console.error("SMS API error:", error);
    
    // Handle specific error cases
    if (error instanceof Error && error.message.includes("MBOA_SMS_API_KEY")) {
      return NextResponse.json(
        {
          success: false,
          message: "SMS service not configured",
          error: "Missing API configuration",
        } satisfies SMSResponse,
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to send SMS",
        error: error instanceof Error ? error.message : "Unknown error",
      } satisfies SMSResponse,
      { status: 500 }
    );
  }
}

// Handle GET requests - return API documentation
export async function GET() {
  return NextResponse.json(
    {
      message: "SMS API Endpoint",
      method: "POST",
      endpoint: "/api/sendSMS",
      requiredFields: {
        to: "string | string[] - Phone number(s) in international format (+1234567890)",
        message: "string - SMS content (1-1600 characters)",
      },
      optionalFields: {
        from: "string - Sender ID (if supported by provider)",
      },
      example: {
        to: "+1234567890",
        message: "Hello from PlaceRank!",
        from: "PlaceRank",
      },
    },
    { status: 200 }
  );
}