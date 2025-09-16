"use client";

import { authenticatedFetch } from "@/utils/auth";
import { useState, useEffect } from "react";

interface OAuthStatus {
  hasAccessToken: boolean;
  hasRefreshToken: boolean;
  isExpired: boolean;
  expiresAt?: string;
}

interface MailApiStatus {
  isReady: boolean;
  error?: string;
}

interface ZohoStatus {
  oauth: OAuthStatus;
  mailApi: MailApiStatus;
}

export default function ZohoManager() {
  const [authorizationCode, setAuthorizationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [status, setStatus] = useState<ZohoStatus | null>(null);
  const [testEmail, setTestEmail] = useState({
    to: "",
    subject: "",
    content: "",
  });

  // Load initial status
  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const response = await authenticatedFetch("/api/zoho-oauth/status");
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error("Failed to load Zoho status:", error);
    }
  };

  const handleSubmitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorizationCode.trim()) {
      setMessage({ type: "error", text: "Please enter an authorization code" });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await authenticatedFetch("/api/zoho-oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: authorizationCode.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: "success", text: data.message });
        setAuthorizationCode("");
        await loadStatus(); // Refresh status
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to exchange authorization code",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error occurred" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeToken = async () => {
    if (
      !confirm(
        "Are you sure you want to revoke the current token? This will disable email functionality."
      )
    ) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await authenticatedFetch("/api/zoho-oauth/token", {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: "success", text: data.message });
        await loadStatus(); // Refresh status
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to revoke token",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error occurred" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail.to.trim()) {
      setMessage({
        type: "error",
        text: "Please enter a recipient email address",
      });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await authenticatedFetch("/api/zoho-oauth/test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testEmail),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: "success", text: "Test email sent successfully!" });
        setTestEmail({ to: "", subject: "", content: "" });
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to send test email",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error occurred" });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Zoho OAuth Management
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Manage Zoho OAuth tokens for email functionality using the Self Client
          workflow.
        </p>
      </div>

      {/* Status Display */}
      {status && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Current Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-700">OAuth Status</h4>
              <ul className="mt-2 space-y-1 text-sm">
                <li className="flex items-center">
                  <span
                    className={`w-2 h-2 rounded-full mr-2 ${status.oauth.hasAccessToken ? "bg-green-400" : "bg-red-400"}`}
                  ></span>
                  Access Token:{" "}
                  {status.oauth.hasAccessToken ? "Present" : "Missing"}
                </li>
                <li className="flex items-center">
                  <span
                    className={`w-2 h-2 rounded-full mr-2 ${status.oauth.hasRefreshToken ? "bg-green-400" : "bg-red-400"}`}
                  ></span>
                  Refresh Token:{" "}
                  {status.oauth.hasRefreshToken ? "Present" : "Missing"}
                </li>
                <li className="flex items-center">
                  <span
                    className={`w-2 h-2 rounded-full mr-2 ${!status.oauth.isExpired ? "bg-green-400" : "bg-red-400"}`}
                  ></span>
                  Status: {status.oauth.isExpired ? "Expired" : "Valid"}
                </li>
                <li className="text-gray-600">
                  Expires: {formatDate(status.oauth.expiresAt)}
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700">Mail API Status</h4>
              <ul className="mt-2 space-y-1 text-sm">
                <li className="flex items-center">
                  <span
                    className={`w-2 h-2 rounded-full mr-2 ${status.mailApi.isReady ? "bg-green-400" : "bg-red-400"}`}
                  ></span>
                  Ready: {status.mailApi.isReady ? "Yes" : "No"}
                </li>
                {status.mailApi.error && (
                  <li className="text-red-600 text-xs">
                    Error: {status.mailApi.error}
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Message Display */}
      {message && (
        <div
          className={`rounded-md p-4 ${
            message.type === "success"
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          <p
            className={`text-sm ${
              message.type === "success" ? "text-green-800" : "text-red-800"
            }`}
          >
            {message.text}
          </p>
        </div>
      )}

      {/* Authorization Code Input */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Exchange Authorization Code
        </h3>
        <form onSubmit={handleSubmitCode} className="space-y-4">
          <div>
            <label
              htmlFor="authCode"
              className="block text-sm font-medium text-gray-700"
            >
              Authorization Code
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Generate this code in the Zoho API Console with the required scope
            </p>
            <input
              type="text"
              id="authCode"
              value={authorizationCode}
              onChange={(e) => setAuthorizationCode(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter authorization code from Zoho Console"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !authorizationCode.trim()}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Exchanging..." : "Exchange for Tokens"}
          </button>
        </form>
      </div>

      {/* Token Management */}
      {status?.oauth.hasRefreshToken && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Token Management
          </h3>
          <button
            onClick={handleRevokeToken}
            disabled={isLoading}
            className="px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Revoking..." : "Revoke Token"}
          </button>
        </div>
      )}

      {/* Test Email */}
      {status?.oauth.hasAccessToken && !status.oauth.isExpired && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Test Email</h3>
          <form onSubmit={handleTestEmail} className="space-y-4">
            <div>
              <label
                htmlFor="testTo"
                className="block text-sm font-medium text-gray-700"
              >
                To Email Address
              </label>
              <input
                type="email"
                id="testTo"
                value={testEmail.to}
                onChange={(e) =>
                  setTestEmail({ ...testEmail, to: e.target.value })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="recipient@example.com"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label
                htmlFor="testSubject"
                className="block text-sm font-medium text-gray-700"
              >
                Subject (optional)
              </label>
              <input
                type="text"
                id="testSubject"
                value={testEmail.subject}
                onChange={(e) =>
                  setTestEmail({ ...testEmail, subject: e.target.value })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Test Email Subject"
                disabled={isLoading}
              />
            </div>
            <div>
              <label
                htmlFor="testContent"
                className="block text-sm font-medium text-gray-700"
              >
                Content (optional)
              </label>
              <textarea
                id="testContent"
                rows={3}
                value={testEmail.content}
                onChange={(e) =>
                  setTestEmail({ ...testEmail, content: e.target.value })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Test email content (HTML supported)"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !testEmail.to.trim()}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Sending..." : "Send Test Email"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
