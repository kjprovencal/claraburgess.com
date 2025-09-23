import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // Call backend API to generate preview
    const response = await fetch(
      `${BACKEND_URL}/api/registry/preview/link?url=${encodeURIComponent(url)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || "Failed to scrape URL" },
        { status: response.status }
      );
    }

    const previewData = await response.json();

    // Transform the preview data into form-friendly format
    const scrapedData = {
      name: previewData.title || "",
      description: previewData.description || "",
      imageUrl: previewData.imageUrl || "",
      siteName: previewData.siteName || "",
      price: previewData.price
        ? parseFloat(previewData.price.replace(/[^0-9.-]/g, ""))
        : undefined,
      availability: previewData.availability || "",
    };

    return NextResponse.json(scrapedData);
  } catch (error) {
    console.error("Error scraping URL:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
