import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ 
    message: "Admin debug route works",
    timestamp: new Date().toISOString()
  });
}

export async function DELETE() {
  return NextResponse.json({ 
    message: "Admin debug DELETE works",
    timestamp: new Date().toISOString()
  });
}
