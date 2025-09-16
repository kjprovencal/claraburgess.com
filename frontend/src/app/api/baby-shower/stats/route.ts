import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(
      `${process.env.BACKEND_URL || "http://localhost:3001"}/baby-shower/stats`,
      {
        headers: request.headers,
      }
    );

    return NextResponse.json(await response.json());
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
