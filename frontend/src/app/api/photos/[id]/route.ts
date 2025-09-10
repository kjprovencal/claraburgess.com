import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: RouteContext<"/api/photos/[id]">
) {
  try {
    const { id } = await params;

    // Forward the request to the backend
    const response = await fetch(
      `${process.env.BACKEND_URL || "http://localhost:3001"}/api/photos/${id}`,
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
        { message: data.message || "Failed to fetch photo" },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error("Photos GET by ID error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteContext<"/api/photos/[id]">
) {
  try {
    const { id } = await params;

    // Get the authorization header from the request
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { message: "Authorization header required" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Forward the request to the backend
    const response = await fetch(
      `${process.env.BACKEND_URL || "http://localhost:3001"}/api/photos/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(
        { message: data.message || "Failed to update photo" },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error("Photos PUT error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteContext<"/api/photos/[id]">
) {
  try {
    const { id } = await params;

    // Get the authorization header from the request
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { message: "Authorization header required" },
        { status: 401 }
      );
    }

    // Forward the request to the backend
    const response = await fetch(
      `${process.env.BACKEND_URL || "http://localhost:3001"}/api/photos/${id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
      }
    );

    if (response.ok) {
      return new NextResponse(null, { status: 204 });
    } else {
      const data = await response.json();
      return NextResponse.json(
        { message: data.message || "Failed to delete photo" },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error("Photos DELETE error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
