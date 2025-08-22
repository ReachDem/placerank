import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const getEmailContent = (
  otp: string,
  type: "sign-in" | "email-verification" | "forget-password"
) => {
  let actionText = "";
  let subject = "";

  switch (type) {
    case "sign-in":
      actionText = "vous connecter";
      subject = "Code de connexion PlaceRank";
      break;
    case "email-verification":
      actionText = "vérifier votre adresse e-mail";
      subject = "Vérifiez votre e-mail pour PlaceRank";
      break;
    case "forget-password":
      actionText = "réinitialiser votre mot de passe";
      subject = "Réinitialisation du mot de passe PlaceRank";
      break;
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="text-align: center; color: #333;">${subject}</h2>
      <p style="font-size: 16px; color: #555;">
        Bonjour,
      </p>
      <p style="font-size: 16px; color: #555;">
        Utilisez le code ci-dessous pour ${actionText} sur PlaceRank.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <p style="font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #000; background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
          ${otp}
        </p>
      </div>
      <p style="font-size: 16px; color: #555;">
        Ce code expirera dans 10 minutes. Si vous n'avez pas demandé ce code, vous pouvez ignorer cet e-mail en toute sécurité.
      </p>
      <p style="font-size: 14px; color: #aaa; text-align: center; margin-top: 30px;">
        © ${new Date().getFullYear()} PlaceRank. Tous droits réservés.
      </p>
    </div>
  `;

  const text = `Votre code de vérification pour PlaceRank est : ${otp}. Il est valide pour 10 minutes.`;

  return { subject, html, text };
};

export const sendVerificationEmail = async ({
  to,
  otp,
  type,
}: {
  to: string;
  otp: string;
  type: "sign-in" | "email-verification" | "forget-password";
}) => {
  const { subject, html, text } = getEmailContent(otp, type);

  try {
    const { data, error } = await resend.emails.send({
      from: "PlaceRank <noreply@placerank.com>",
      to,
      subject,
      html,
      text,
    });

    if (error) {
      console.error("Error sending email with Resend:", error);
      throw new Error("Failed to send verification email.");
    }

    console.log("Email sent successfully:", data);
    return data;
  } catch (error) {
    console.error("Exception when sending email:", error);
    throw error;
  }
};
