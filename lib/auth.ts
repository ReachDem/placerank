import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP, phoneNumber } from "better-auth/plugins";
import { PrismaClient } from "@/lib/generated/prisma";
import { normalizeCameroonPhoneNumber } from "./phone-utils";
import { sendVerificationEmail } from "./email";

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  
  plugins: [
    emailOTP({
      sendVerificationOTP: async ({ email, otp, type }) => {
        await sendVerificationEmail({
          to: email,
          otp,
          type,
        });
      },

      signUpOnVerification: true,
      otpLength: 6,
      expiresIn: 600, // 10 minutes
      allowedAttempts: 5,
    }),
    phoneNumber({
      sendOTP: async ({ phoneNumber, code }) => {
        try {
          const formattedPhone = normalizeCameroonPhoneNumber(phoneNumber);
          const message = `PlaceRank code: ${code.split('').join('  ')}. Valide 10 minutes.`;
          const baseUrl = process.env.BETTER_AUTH_URL || 'http://localhost:3000';

          const response = await fetch(`${baseUrl}/api/sendSMS`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sender: "ReachDem",
              message,
              phone: formattedPhone,
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API SMS a échoué (${response.status}): ${errorText}`);
          }
        } catch (error) {
          console.error(`Échec envoi SMS au ${phoneNumber}:`, error);
          throw new Error("Erreur lors de l'envoi du code SMS");
        }
      },
      signUpOnVerification: {
        getTempEmail: (phoneNumber) => `${phoneNumber.replace(/\+/g, '')}@placerank-temp.com`,
        getTempName: (phoneNumber) => `user-${phoneNumber.slice(-4)}`,
      },
      otpLength: 6,
      expiresIn: 600,
      allowedAttempts: 3,
    }),
  ],
});