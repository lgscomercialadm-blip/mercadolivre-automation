import { NextResponse } from "next/server";

export async function POST(): Promise<NextResponse> {
  return NextResponse.json({ ok: false, error: "Not implemented" }, { status: 501 });
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ ok: true });
}


