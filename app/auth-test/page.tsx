"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { isValidCameroonPhoneNumber, formatPhoneNumberForDisplay } from "@/lib/phone-utils";

type AuthMethod = "email" | "phone";

export default function AuthTestPage() {
  const [authMethod, setAuthMethod] = useState<AuthMethod>("email");

  // Phone state
  const [phoneNumber, setPhoneNumber] = useState("");
  const [name, setName] = useState("");

  // Email state
  const [email, setEmail] = useState("");

  // Common state
  const [otpCode, setOtpCode] = useState("");
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [isSignUp, setIsSignUp] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const session = authClient.useSession();

  const resetState = () => {
    setPhoneNumber("");
    setName("");
    setEmail("");
    setOtpCode("");
    setStep("credentials");
    setIsSignUp(true);
    setLoading(false);
    setMessage("");
    setError("");
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      let response;
      if (authMethod === "phone") {
        if (!isValidCameroonPhoneNumber(phoneNumber)) {
          setError("Format de numéro invalide. Utilisez: +237... ou 6...");
          setLoading(false);
          return;
        }
        response = await authClient.phoneNumber.sendOtp({ phoneNumber });
      } else {
        response = await authClient.emailOtp.sendVerificationOtp({
          email,
          type: isSignUp ? "email-verification" : "sign-in",
        });
      }

      if (response.error) {
        setError(response.error.message || "Erreur lors de l'envoi du code.");
      } else {
        setMessage(`Code envoyé avec succès à ${authMethod === 'phone' ? formatPhoneNumberForDisplay(phoneNumber) : email}.`);
        setStep("otp");
      }
    } catch (err: any) {
      setError(err.message || "Une erreur inattendue est survenue.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      let response;
      if (authMethod === "phone") {
        response = await authClient.phoneNumber.verify({ phoneNumber, code: otpCode });
      } else {
        response = await authClient.signIn.emailOtp({ email, otp: otpCode });
      }

      if (response.error) {
        setError(response.error.message || "Code OTP invalide.");
      } else {
        setMessage(isSignUp ? "Inscription réussie !" : "Connexion réussie !");
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors de la vérification.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    resetState();
    window.location.reload();
  };

  if (session.data?.user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8 p-10 bg-white shadow-lg rounded-xl">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Connecté</h2>
            <p className="mt-2 text-sm text-gray-600">Bienvenue, {session.data.user.name || session.data.user.email}!</p>
          </div>
          <div className="text-sm text-gray-700 space-y-2">
            <p><strong>ID:</strong> {session.data.user.id}</p>
            <p><strong>Email:</strong> {session.data.user.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    );
  }

  const renderCredentialsForm = () => (
    <form onSubmit={handleSendOtp} className="space-y-6">
      {authMethod === 'email' ? (
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Adresse e-mail</label>
          <input id="email" name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nom@example.com" className="mt-1 block w-full px-3 py-2 border rounded-md"/>
        </div>
      ) : (
        <>
          {isSignUp && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nom complet</label>
              <input id="name" name="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Votre nom" className="mt-1 block w-full px-3 py-2 border rounded-md"/>
            </div>
          )}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Numéro de téléphone</label>
            <input id="phone" name="phone" type="tel" required value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="+2376..." className="mt-1 block w-full px-3 py-2 border rounded-md"/>
            <p className="mt-1 text-xs text-gray-500">Format international pour le Cameroun.</p>
          </div>
        </>
      )}
      <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
        {loading ? 'Envoi...' : (isSignUp ? 'Créer le compte' : 'Se connecter')}
      </button>
    </form>
  );

  const renderOtpForm = () => (
    <form onSubmit={handleVerifyOtp} className="space-y-6">
      <div>
        <label htmlFor="otp" className="block text-sm font-medium text-gray-700">Code OTP</label>
        <input id="otp" name="otp" type="text" required value={otpCode} onChange={(e) => setOtpCode(e.target.value)} placeholder="123456" maxLength={6} className="mt-1 block w-full px-3 py-2 border rounded-md text-center text-2xl tracking-widest"/>
        <p className="mt-1 text-xs text-gray-500">Code envoyé à {authMethod === 'phone' ? formatPhoneNumberForDisplay(phoneNumber) : email}.</p>
      </div>
      <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
        {loading ? 'Vérification...' : 'Confirmer'}
      </button>
      <button type="button" onClick={() => setStep('credentials')} className="w-full text-center text-sm text-indigo-600 hover:underline">
        Changer {authMethod === 'phone' ? 'de numéro' : "d'email"}
      </button>
    </form>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {isSignUp ? "Créer un compte" : "Se connecter"}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {step === 'credentials' ? `Avec votre ${authMethod === 'email' ? 'e-mail' : 'téléphone'}` : 'Entrez le code reçu'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="mb-4">
            <div className="flex border-b">
              <button onClick={() => { setAuthMethod('email'); resetState(); }} className={`flex-1 py-2 text-sm font-medium ${authMethod === 'email' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500'}`}>
                Email
              </button>
              <button onClick={() => { setAuthMethod('phone'); resetState(); }} className={`flex-1 py-2 text-sm font-medium ${authMethod === 'phone' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500'}`}>
                Téléphone
              </button>
            </div>
          </div>

          {message && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{message}</div>}
          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

          {step === "credentials" ? renderCredentialsForm() : renderOtpForm()}

          <div className="mt-6 text-center">
            <button onClick={() => setIsSignUp(!isSignUp)} className="text-sm text-indigo-600 hover:text-indigo-500">
              {isSignUp ? "Déjà un compte ? Se connecter" : "Pas de compte ? S'inscrire"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
