// SMS types for mboasms API integration

export interface SMSRequest {
  to: string | string[];        // Phone number(s) to send SMS to
  message: string;              // SMS content
  from?: string;                // Sender ID (optional)
}

export interface SMSResponse {
  success: boolean;
  message: string;
  data?: {
    messageId?: string;
    status?: string;
    recipients?: number;
    cost?: number;
  };
  error?: string;
}

export interface MboaSMSRequest {
  apikey: string;
  to: string;
  message: string;
  from?: string;
}

export interface MboaSMSResponse {
  status: string;
  message: string;
  data?: {
    message_id: string;
    status: string;
    recipients: number;
    cost: number;
  };
}