"use client";

import { useEffect, useRef, useState } from "react";

const TURNSTILE_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      callback: (token: string) => void;
      "error-callback": () => void;
      "expired-callback": () => void;
      theme: "auto";
    },
  ) => string;
  remove: (widgetId: string) => void;
  reset: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

type HtmlPayload = { html: string };
type MessagePayload = { message: string };

function isHtmlPayload(data: unknown): data is HtmlPayload {
  return (
    typeof data === "object" &&
    data !== null &&
    "html" in data &&
    typeof data.html === "string"
  );
}

function isMessagePayload(data: unknown): data is MessagePayload {
  return (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof data.message === "string"
  );
}

function loadTurnstile(): Promise<void> {
  if (window.turnstile) {
    return Promise.resolve();
  }
  const existing = document.querySelector<HTMLScriptElement>(
    `script[src="${TURNSTILE_SRC}"]`,
  );
  if (existing) {
    if (existing.dataset.loaded === "true") {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      existing.addEventListener(
        "load",
        () => {
          existing.dataset.loaded = "true";
          resolve();
        },
        { once: true },
      );
      existing.addEventListener(
        "error",
        () => reject(new Error("Turnstile failed to load")),
        { once: true },
      );
    });
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = TURNSTILE_SRC;
    script.async = true;
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => reject(new Error("Turnstile failed to load"));
    document.head.appendChild(script);
  });
}

export default function BirthdayGate({ siteKey }: { siteKey: string }) {
  const widgetHostRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef("");
  const pendingRef = useRef(false);
  const [html, setHtml] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (siteKey === "" || html !== null || success !== null) {
      return;
    }
    const host = widgetHostRef.current;
    if (!host) {
      return;
    }
    let removed = false;

    const showVerifyError = () => {
      if (!removed) {
        setError("We could not verify you. Refresh the page and try again.");
      }
    };

    const unlock = async (token: string) => {
      if (pendingRef.current) {
        return;
      }
      pendingRef.current = true;
      setError("");
      try {
        const response = await fetch("/api/birthday/unlock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data: unknown = await response.json();
        if (removed) {
          return;
        }
        if (!response.ok || !isHtmlPayload(data)) {
          showVerifyError();
          if (widgetIdRef.current !== "" && window.turnstile) {
            window.turnstile.reset(widgetIdRef.current);
          }
          return;
        }
        setHtml(data.html);
      } catch {
        showVerifyError();
      } finally {
        pendingRef.current = false;
      }
    };

    loadTurnstile()
      .then(() => {
        if (removed || !widgetHostRef.current || !window.turnstile) {
          if (!removed && !window.turnstile) {
            showVerifyError();
          }
          return;
        }
        widgetIdRef.current = window.turnstile.render(widgetHostRef.current, {
          sitekey: siteKey,
          theme: "auto",
          callback: (token) => {
            void unlock(token);
          },
          "error-callback": showVerifyError,
          "expired-callback": () => {
            if (!removed) {
              setError("Please confirm you are human again.");
            }
          },
        });
      })
      .catch(() => {
        showVerifyError();
      });

    return () => {
      removed = true;
      if (widgetIdRef.current !== "" && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = "";
      }
    };
  }, [siteKey, html, success]);

  useEffect(() => {
    const node = contentRef.current;
    if (!node) {
      return;
    }
    node.innerHTML = html ?? "";
    const form = node.querySelector("form");
    if (!(form instanceof HTMLFormElement)) {
      return;
    }

    const submitForm = async (current: HTMLFormElement) => {
      const button = current.querySelector("button[type='submit']");
      if (button instanceof HTMLButtonElement) {
        button.disabled = true;
      }
      setError("");
      try {
        const response = await fetch("/api/birthday/rsvp", {
          method: "POST",
          body: new FormData(current),
        });
        const data: unknown = await response.json();
        if (response.status === 401) {
          setHtml(null);
          setError("Please confirm you are human again, then resubmit.");
          return;
        }
        if (!response.ok || !isMessagePayload(data)) {
          setError("We could not save your RSVP. Please try again.");
          if (button instanceof HTMLButtonElement) {
            button.disabled = false;
          }
          return;
        }
        setHtml(null);
        setSuccess(data.message);
      } catch {
        setError("We could not save your RSVP. Please try again.");
        if (button instanceof HTMLButtonElement) {
          button.disabled = false;
        }
      }
    };

    const onSubmit = (event: SubmitEvent) => {
      event.preventDefault();
      void submitForm(form);
    };
    form.addEventListener("submit", onSubmit);
    return () => form.removeEventListener("submit", onSubmit);
  }, [html]);

  const showIntro = html === null && success === null;

  return (
    <div className="mb-16">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-50/30 via-transparent to-blue-50/30 pointer-events-none"></div>
        <div className="relative">
          {showIntro && (
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Clara&apos;s Birthday Party
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Confirm you are human to see the party details and RSVP.
              </p>
            </div>
          )}
          {showIntro && siteKey === "" && (
            <p className="text-center text-red-600" role="alert">
              This page is unavailable right now.
            </p>
          )}
          {showIntro && siteKey !== "" && (
            <div ref={widgetHostRef} className="flex justify-center min-h-16" />
          )}
          {error !== "" && (
            <p className="text-center text-red-600 mt-4" role="alert">
              {error}
            </p>
          )}
          <div ref={contentRef} className="mt-8" />
          {success !== null && (
            <p
              className="text-center text-lg text-gray-800 dark:text-gray-200"
              role="status"
            >
              {success}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
