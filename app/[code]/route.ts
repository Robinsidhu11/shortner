import { NextRequest, NextResponse } from "next/server";
import { resolveShortCode } from "@/lib/shortener";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Params {
  params: {
    code: string;
  };
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { code } = params;

  if (!code) {
    return new NextResponse("Missing short code.", { status: 400 });
  }

  const record = await resolveShortCode(code);

  if (!record) {
    return new NextResponse("Short link not found.", { status: 404 });
  }

  return NextResponse.redirect(record.targetUrl, { status: 302 });
}

