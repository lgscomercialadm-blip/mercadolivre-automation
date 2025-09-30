import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const jar = await cookies();
  const tokenCookie = jar.get("meli_token");
  const token = tokenCookie ? JSON.parse(tokenCookie.value) : null;
  return NextResponse.json({ token });
}


