import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await fetch(
      `${process.env.BACKEND_URL || "http://localhost:3001"}/zoho-oauth/status`,
      {
        method: "GET",
        headers: request.headers,
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to get Zoho OAuth status" },
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
