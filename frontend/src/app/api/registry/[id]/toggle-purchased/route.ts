import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: RouteContext<"/api/registry/[id]/toggle-purchased">
) {
  try {
    const { id } = await params;

    // Forward the request to the backend
    const response = await fetch(
      `${process.env.BACKEND_URL || "http://localhost:3001"}/api/registry/${id}/toggle-purchased`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(
        { message: data.message || "Failed to toggle purchased status" },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error("Registry toggle purchased error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
