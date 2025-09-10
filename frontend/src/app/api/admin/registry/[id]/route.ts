import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: RouteContext<"/api/admin/registry/[id]">
) {
  try {
    const { id } = await params;

    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { message: "Authorization header required" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const response = await fetch(
      `${process.env.BACKEND_URL || "http://localhost:3001"}/api/admin/registry/${id}`,
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
        { message: data.message || "Failed to update registry item" },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error("Admin registry PUT error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteContext<"/api/admin/registry/[id]">
) {
  console.log("🔍 Admin DELETE route hit for ID:", await params);
  try {
    const { id } = await params;
    console.log("🔍 Processing DELETE for ID:", id);

    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { message: "Authorization header required" },
        { status: 401 }
      );
    }

    const backendUrl = `${process.env.BACKEND_URL || "http://localhost:3001"}/api/admin/registry/${id}`;
    console.log("🔍 Calling backend URL:", backendUrl);
    
    const response = await fetch(backendUrl, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
    });
    
    console.log("🔍 Backend response status:", response.status);

    if (response.ok) {
      return new NextResponse(null, { status: 204 });
    } else {
      const data = await response.json();
      return NextResponse.json(
        { message: data.message || "Failed to delete registry item" },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error("Admin registry DELETE error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
