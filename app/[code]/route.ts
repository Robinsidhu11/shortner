import { NextRequest, NextResponse } from "next/server";
import { resolveShortCode } from "@/lib/shortener";
import { recordClickForCode } from "@/lib/analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Params {
  params: {
    code: string;
  };
}

export async function GET(req: NextRequest, { params }: Params) {
  const { code } = params;

  if (!code) {
    return new NextResponse("Missing short code.", { status: 400 });
  }

  const record = await resolveShortCode(code);

  if (!record) {
    return new NextResponse("Short link not found.", { status: 404 });
  }

  const forwardedFor = req.headers.get("x-forwarded-for");
  const ip = forwardedFor ? forwardedFor.split(",")[0] : null;
  const userAgent = req.headers.get("user-agent");

  try {
    await recordClickForCode(code, ip, userAgent);
  } catch (err) {
    console.error("Failed to record click", err);
  }

  return NextResponse.redirect(record.targetUrl, { status: 302 });
}

