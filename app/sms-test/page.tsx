"use client";

import { useState } from "react";
import { SMSResponse } from "@/lib/types/sms";

export default function SMSTestPage() {
  const [to, setTo] = useState("");
  const [message, setMessage] = useState("");
  const [from, setFrom] = useState("");
  const [result, setResult] = useState<SMSResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const sendSMS = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/sendSMS", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to,
          message,
          ...(from && { from }),
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        message: "Failed to send SMS",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">SMS API Test</h1>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="to" className="block text-sm font-medium mb-2">
              Phone Number (required)
            </label>
            <input
              id="to"
              type="text"
              placeholder="+1234567890"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              Use international format (+1234567890)
            </p>
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-2">
              Message (required)
            </label>
            <textarea
              id="message"
              placeholder="Your SMS message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
            <p className="text-sm text-gray-500 mt-1">
              {message.length}/1600 characters
            </p>
          </div>

          <div>
            <label htmlFor="from" className="block text-sm font-medium mb-2">
              Sender ID (optional)
            </label>
            <input
              id="from"
              type="text"
              placeholder="PlaceRank"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={sendSMS}
            disabled={loading || !to || !message}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send SMS"}
          </button>
        </div>

        {result && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Result</h2>
            <div
              className={`p-4 rounded-md ${
                result.success
                  ? "bg-green-100 border border-green-300"
                  : "bg-red-100 border border-red-300"
              }`}
            >
              <pre className="whitespace-pre-wrap text-sm">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">API Documentation</h2>
          <div className="bg-gray-100 p-4 rounded-md">
            <p className="text-sm">
              This page demonstrates the <code>/api/sendSMS</code> endpoint.
            </p>
            <p className="text-sm mt-2">
              To use with a real API key, update your <code>.env.local</code> file
              with your mboasms credentials.
            </p>
            <p className="text-sm mt-2">
              See <code>docs/SMS_API.md</code> for complete documentation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}