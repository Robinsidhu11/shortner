import { NextResponse } from "next/server";
import { getLinksWithStats } from "@/lib/analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getLinksWithStats();
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("Failed to load link stats", err);
    return NextResponse.json(
      { error: "Failed to load link statistics." },
      { status: 500 }
    );
  }
}

