import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: RouteContext<"/api/photos/category/[category]">
) {
  try {
    const { category } = await params;

    // Forward the request to the backend
    const response = await fetch(
      `${process.env.BACKEND_URL || "http://localhost:3001"}/api/photos/category/${category}`,
      {
        method: "GET",
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
        { message: data.message || "Failed to fetch photos by category" },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error("Photos GET by category error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
