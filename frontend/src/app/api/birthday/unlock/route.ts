import { NextRequest, NextResponse } from "next/server";
import { sealBirthdayAccess } from "../../../../server/birthday-access";
import { birthdayParty } from "../../../../server/birthday-party";
import { renderBirthdayHtml } from "../../../../server/birthday-html";
import {
  verifyTurnstileToken,
  type TurnstileOutcome,
} from "../../../../server/turnstile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "private, no-store" };

function turnstileSecret(): string {
  return (process.env.TURNSTILE_SECRET_KEY ?? "").trim();
}

function clientIp(request: NextRequest): string | null {
  const header =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for");
  if (header === null) {
    return null;
  }
  const first = header.split(",")[0]?.trim() ?? "";
  return first === "" ? null : first;
}

function isHttps(request: NextRequest): boolean {
  const forwarded = request.headers.get("x-forwarded-proto");
  if (forwarded !== null) {
    return forwarded.split(",")[0]?.trim() === "https";
  }
  return request.nextUrl.protocol === "https:";
}

function unavailable(): NextResponse {
  return NextResponse.json(
    { error: "Verification is unavailable." },
    { status: 503, headers: NO_STORE },
  );
}

function outcomeResponse(
  outcome: Exclude<TurnstileOutcome, "pass">,
): NextResponse {
  switch (outcome) {
    case "fail":
      return NextResponse.json(
        { error: "Verification failed." },
        { status: 403, headers: NO_STORE },
      );
    case "unavailable":
      return unavailable();
    default: {
      const exhaustive: never = outcome;
      return exhaustive;
    }
  }
}

export async function POST(request: NextRequest) {
  const secret = turnstileSecret();
  let token = "";
  try {
    const body: unknown = await request.json();
    if (typeof body === "object" && body !== null && "token" in body) {
      const candidate = body.token;
      if (typeof candidate === "string") {
        token = candidate;
      }
    }
  } catch {
    return NextResponse.json(
      { error: "Verification failed." },
      { status: 400, headers: NO_STORE },
    );
  }

  const outcome = await verifyTurnstileToken(token, secret, clientIp(request));
  switch (outcome) {
    case "pass":
      break;
    case "fail":
    case "unavailable":
      return outcomeResponse(outcome);
    default: {
      const exhaustive: never = outcome;
      return exhaustive;
    }
  }

  if (secret === "") {
    return unavailable();
  }

  const response = NextResponse.json(
    { html: renderBirthdayHtml(birthdayParty) },
    { headers: NO_STORE },
  );
  response.cookies.set({
    name: "birthday_access",
    value: sealBirthdayAccess(secret),
    httpOnly: true,
    sameSite: "lax",
    secure: isHttps(request),
    path: "/api/birthday",
    maxAge: 30 * 60,
  });
  return response;
}
