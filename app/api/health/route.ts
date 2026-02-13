import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      message: "Server is healthy",
      timestamp: new Date().toISOString()
    },
    { status: 200 }
  );
}

