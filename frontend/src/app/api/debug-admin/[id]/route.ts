import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: RouteContext<"/api/debug-admin/[id]">
) {
  const { id } = await params;
  return NextResponse.json({ 
    message: `Debug admin route with ID: ${id}`,
    id,
    timestamp: new Date().toISOString()
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteContext<"/api/debug-admin/[id]">
) {
  const { id } = await params;
  return NextResponse.json({ 
    message: `Debug admin DELETE with ID: ${id}`,
    id,
    timestamp: new Date().toISOString()
  });
}
