import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const response = await fetch(
      `${process.env.BACKEND_URL || "http://localhost:3001"}/zoho-oauth/test-email`,
      {
        method: "POST",
        headers: request.headers,
        body: JSON.stringify(await request.json()),
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to send test email" },
        { status: response.status }
      );
    }

    return NextResponse.json(await response.json());
  } catch (error) {
    console.error("Zoho OAuth API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
