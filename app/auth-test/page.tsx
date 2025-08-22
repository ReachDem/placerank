"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { isValidCameroonPhoneNumber, formatPhoneNumberForDisplay } from "@/lib/phone-utils";

export default function AuthTestPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [name, setName] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [step, setStep] = useState<"signup" | "signin" | "otp">("signup");
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const session = authClient.useSession();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    // Validate phone number before sending
    if (!isValidCameroonPhoneNumber(phoneNumber)) {
      setError("Format de numéro invalide pour le Cameroun. Utilisez: +237xxxxxxxx, 237xxxxxxxx, ou 6xxxxxxxx/2xxxxxxxx");
      setLoading(false);
      return;
    }

    try {
      // Pour l'inscription, on utilise directement sendOtp puis verify
      // Better-auth créera automatiquement l'utilisateur avec signUpOnVerification
      const { data, error } = await authClient.phoneNumber.sendOtp({
        phoneNumber: phoneNumber,
      });

      if (error) {
        setError(error.message || "Erreur lors de l'envoi du code OTP");
      } else {
        setMessage(`Code OTP envoyé avec succès au ${formatPhoneNumberForDisplay(phoneNumber)} ! Vérifiez vos SMS.`);
        setStep("otp");
        setMode("signup");
      }
    } catch (err) {
      setError("Erreur lors de l'inscription");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    // Validate phone number before sending
    if (!isValidCameroonPhoneNumber(phoneNumber)) {
      setError("Format de numéro invalide pour le Cameroun. Utilisez: +237xxxxxxxx, 237xxxxxxxx, ou 6xxxxxxxx/2xxxxxxxx");
      setLoading(false);
      return;
    }

    try {
      // Pour la connexion d'un utilisateur existant
      const { data, error } = await authClient.phoneNumber.sendOtp({
        phoneNumber: phoneNumber,
      });

      if (error) {
        setError(error.message || "Erreur lors de l'envoi du code OTP");
      } else {
        setMessage(`Code OTP envoyé avec succès au ${formatPhoneNumberForDisplay(phoneNumber)} ! Vérifiez vos SMS.`);
        setStep("otp");
        setMode("signin");
      }
    } catch (err) {
      setError("Erreur lors de la connexion");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      // Vérification du code OTP - same method for both signup and signin
      // Better-auth will automatically create user on first verification if signUpOnVerification is enabled
      const { data, error } = await authClient.phoneNumber.verify({
        phoneNumber: phoneNumber,
        code: otpCode,
        disableSession: false, // Create session after verification
      });

      if (error) {
        setError(error.message || "Code OTP invalide");
      } else {
        setMessage(mode === "signup" ? "Inscription réussie !" : "Connexion réussie !");
        // The session will be automatically created, so we can just reload
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (err) {
      setError("Erreur lors de la vérification du code OTP");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      setStep("signup");
      setPhoneNumber("");
      setName("");
      setOtpCode("");
      setMessage("");
      setError("");
    } catch (err) {
      console.error("Erreur lors de la déconnexion:", err);
    }
  };

  const resetForm = () => {
    setStep("signup");
    setPhoneNumber("");
    setName("");
    setOtpCode("");
    setMessage("");
    setError("");
  };

  const switchMode = () => {
    if (step === "otp") {
      setStep("signup");
    }
    setMode(mode === "signup" ? "signin" : "signup");
    setPhoneNumber("");
    setName("");
    setOtpCode("");
    setMessage("");
    setError("");
  };

  if (session.data?.user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Connecté avec succès !
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">
                  <strong>Utilisateur:</strong> {session.data.user.name || "Utilisateur"}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>ID:</strong> {session.data.user.id}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Email:</strong> {session.data.user.email || "Non défini"}
                </p>
              </div>

              <button
                onClick={handleSignOut}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Authentification SMS PlaceRank
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {step === "signup" && "Créer un nouveau compte"}
          {step === "signin" && "Se connecter à votre compte"}
          {step === "otp" && "Entrez le code OTP reçu par SMS"}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {message && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {step === "signup" ? (
            <form onSubmit={handleSignUp} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nom complet
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Votre nom complet"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Numéro de téléphone
                </label>
                <div className="mt-1">
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+237612345678 ou 612345678"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Numéro camerounais (ex: +237612345678, 237612345678, ou 612345678)
                </p>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? "Création du compte..." : "Créer le compte"}
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={switchMode}
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  Déjà un compte ? Se connecter
                </button>
              </div>
            </form>
          ) : step === "signin" ? (
            <form onSubmit={handleSignIn} className="space-y-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Numéro de téléphone
                </label>
                <div className="mt-1">
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+237612345678 ou 612345678"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Numéro camerounais (ex: +237612345678, 237612345678, ou 612345678)
                </p>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? "Envoi du code..." : "Envoyer le code OTP"}
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={switchMode}
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  Pas de compte ? S'inscrire
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                  Code OTP
                </label>
                <div className="mt-1">
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="123456"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-center text-2xl tracking-widest"
                    maxLength={6}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Code envoyé au {formatPhoneNumberForDisplay(phoneNumber)}
                  {mode === "signup" && name && ` pour ${name}`}
                </p>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? "Vérification..." : (mode === "signup" ? "Confirmer l'inscription" : "Se connecter")}
                </button>
              </div>

              <div>
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Changer de numéro
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
