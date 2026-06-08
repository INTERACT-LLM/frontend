import { NextResponse } from "next/server";
import { signGateToken } from "@/lib/gate-token";

const COOKIE_NAME = "interactllm_gate";
const FORTY_EIGHT_HOURS_SECONDS = 48 * 60 * 60;

export async function POST(request) {
  const { password } = await request.json();
  const expected = process.env.PROTOTYPE_PASSWORD;

  if (!expected) {
    return NextResponse.json(
      { error: "Gate not configured" },
      { status: 500 }
    );
  }

  if (password !== expected) {
    return NextResponse.json(
      { error: "Incorrect password" },
      { status: 401 }
    );
  }

  const token = await signGateToken();
  const response = NextResponse.json({ ok: true });

  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: FORTY_EIGHT_HOURS_SECONDS,
  });

  return response;
}