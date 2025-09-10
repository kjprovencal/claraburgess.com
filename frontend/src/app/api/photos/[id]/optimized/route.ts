import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: RouteContext<"/api/photos/[id]/optimized">
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);

    // Extract optimization parameters from query string
    const width = searchParams.get("width");
    const height = searchParams.get("height");
    const crop = searchParams.get("crop");
    const quality = searchParams.get("quality");

    // Build query string for backend
    const queryParams = new URLSearchParams();
    if (width) queryParams.append("width", width);
    if (height) queryParams.append("height", height);
    if (crop) queryParams.append("crop", crop);
    if (quality) queryParams.append("quality", quality);

    const queryString = queryParams.toString();
    const backendUrl = `${process.env.BACKEND_URL || "http://localhost:3001"}/api/photos/${id}/optimized${queryString ? `?${queryString}` : ""}`;

    // Forward the request to the backend
    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(
        { message: data.message || "Failed to get optimized photo" },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error("Photos optimized GET error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
