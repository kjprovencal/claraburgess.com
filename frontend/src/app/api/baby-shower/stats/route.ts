import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(
      `${process.env.BACKEND_URL || "http://localhost:3001"}/baby-shower/stats`,
      {
        headers: request.headers,
      }
    );

    if (!response.ok) {
      console.error(
        "Backend response not ok:",
        response.status,
        response.statusText
      );
      return NextResponse.json(
        { error: "Failed to fetch stats" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
