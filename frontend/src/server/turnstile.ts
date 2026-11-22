const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export type TurnstileOutcome = "pass" | "fail" | "unavailable";

export async function verifyTurnstileToken(
  token: string,
  secret: string,
  remoteIp: string | null,
  fetchImpl: typeof fetch = fetch,
): Promise<TurnstileOutcome> {
  if (secret.trim() === "") {
    return "unavailable";
  }
  if (token.trim() === "" || token.length > 4096) {
    return "fail";
  }

  try {
    const body = new URLSearchParams();
    body.set("secret", secret);
    body.set("response", token);
    if (remoteIp !== null && remoteIp !== "") {
      body.set("remoteip", remoteIp);
    }
    const response = await fetchImpl(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
    });
    if (!response.ok) {
      return "unavailable";
    }
    const data: unknown = await response.json();
    if (typeof data !== "object" || data === null || !("success" in data)) {
      return "unavailable";
    }
    return data.success === true ? "pass" : "fail";
  } catch {
    return "unavailable";
  }
}
