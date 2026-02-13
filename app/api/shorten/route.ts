import { NextRequest, NextResponse } from "next/server";
import { createShortUrl } from "@/lib/shortener";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const url = typeof body.url === "string" ? body.url : "";

    if (!url.trim()) {
      return NextResponse.json(
        { error: "Please provide a URL to shorten." },
        { status: 400 }
      );
    }

    const short = await createShortUrl(url);

    return NextResponse.json(
      {
        shortCode: short.shortCode
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === "EMPTY_URL" || err.message === "INVALID_URL") {
        return NextResponse.json(
          { error: "Please provide a valid URL." },
          { status: 400 }
        );
      }
    }

    console.error("Error creating short URL", err);
    return NextResponse.json(
      { error: "Unexpected error while shortening URL." },
      { status: 500 }
    );
  }
}

