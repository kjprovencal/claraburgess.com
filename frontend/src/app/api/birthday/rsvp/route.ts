import { NextRequest, NextResponse } from "next/server";
import {
  openBirthdayAccess,
  signBirthdayGate,
} from "../../../../server/birthday-access";
import { birthdayParty } from "../../../../server/birthday-party";
import {
  parseBirthdayRsvp,
  readFormText,
} from "../../../../server/birthday-rsvp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "private, no-store" };

function turnstileSecret(): string {
  return (process.env.TURNSTILE_SECRET_KEY ?? "").trim();
}

function backendUrl(): string {
  return process.env.BACKEND_URL || "http://localhost:3001";
}

export async function POST(request: NextRequest) {
  const secret = turnstileSecret();
  if (secret === "") {
    return NextResponse.json(
      { error: "Verification is unavailable." },
      { status: 503, headers: NO_STORE },
    );
  }

  const access = request.cookies.get("birthday_access")?.value;
  if (!openBirthdayAccess(secret, access)) {
    return NextResponse.json(
      { error: "Please confirm you are human again." },
      { status: 401, headers: NO_STORE },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Check the form and try again." },
      { status: 400, headers: NO_STORE },
    );
  }

  const parsed = parseBirthdayRsvp({
    name: readFormText(form, "name"),
    email: readFormText(form, "email"),
    attending: readFormText(form, "attending"),
    guestCount: readFormText(form, "guestCount"),
    note: readFormText(form, "note"),
  });
  if (!parsed.ok) {
    return NextResponse.json(
      { error: parsed.error },
      { status: 400, headers: NO_STORE },
    );
  }

  const body = JSON.stringify(parsed.value);
  const timestamp = String(Date.now());
  const signature = signBirthdayGate(secret, timestamp);

  try {
    const response = await fetch(`${backendUrl()}/birthday/rsvp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-birthday-timestamp": timestamp,
        "x-birthday-signature": signature,
      },
      body,
      cache: "no-store",
    });

    if (response.status === 429) {
      return NextResponse.json(
        { error: "Too many RSVPs from this network. Please try again later." },
        { status: 429, headers: NO_STORE },
      );
    }

    if (response.status === 400) {
      return NextResponse.json(
        { error: "Check the form and try again." },
        { status: 400, headers: NO_STORE },
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: "We could not save your RSVP." },
        { status: 503, headers: NO_STORE },
      );
    }
  } catch (error) {
    console.error("Birthday RSVP forward failed:", error);
    return NextResponse.json(
      { error: "We could not save your RSVP." },
      { status: 503, headers: NO_STORE },
    );
  }

  return NextResponse.json(
    { message: birthdayParty.successMessage },
    { headers: NO_STORE },
  );
}
