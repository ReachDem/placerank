import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { phoneNumber } from "better-auth/plugins"
// If your Prisma file is located elsewhere, you can change the path
import { PrismaClient } from "@/lib/generated/prisma";
import { normalizeCameroonPhoneNumber } from "./phone-utils";

const prisma = new PrismaClient();
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  

  plugins: [
    phoneNumber({
      sendOTP: async ({ phoneNumber, code }, request) => {
        try {
          console.log(`Tentative d'envoi OTP au numéro: ${phoneNumber}`);
          
          // Normalize Cameroon phone number using utility function
          const formattedPhone = normalizeCameroonPhoneNumber(phoneNumber);
          
          console.log(`Numéro formaté: ${formattedPhone}, Code OTP: ${code}`);

          // Construct OTP message in French for Cameroon
            const message = `PlaceRank code: ${code.split('').join('  ')}. Valide 10 minutes.`;

          // Send SMS using API route instead of direct service
          const baseUrl = process.env.BETTER_AUTH_URL || 'http://localhost:3000';
          const response = await fetch(`${baseUrl}/api/sendSMS`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sender: "ReachDem",
              message: message,
              phone: formattedPhone
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API SMS a échoué (${response.status}): ${errorText}`);
          }

          const result = await response.json();
          console.log(`SMS OTP envoyé avec succès au ${formattedPhone}:`, result);
        } catch (error) {
          console.error(`Échec envoi SMS au ${phoneNumber}:`, error);
          throw new Error("Erreur lors de l'envoi du code SMS");
        }
      },
      // Allow signup with phone number verification
      signUpOnVerification: {
        getTempEmail: (phoneNumber) => {
          // Generate a temporary email for the user
          return `${phoneNumber.replace(/\+/g, '')}@placerank-temp.com`;
        },
        getTempName: (phoneNumber) => {
          // Use phone number as temporary name until user provides real name
          return `user-${phoneNumber.slice(-4)}`;
        }
      },
      // OTP configuration
      otpLength: 6,
      expiresIn: 600, // 10 minutes
      allowedAttempts: 3
    })
  ]
});