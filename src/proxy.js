// gate keeper (check for valid cookie, if not show gate)
import { NextResponse } from "next/server";
import { verifyGateToken } from "@/lib/gate-token";

const COOKIE_NAME = "interactllm_gate";

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  // gate page and gate API must always be reachable, or we get a redirect loop
  if (pathname === "/gate" || pathname.startsWith("/api/gate")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const valid = token ? await verifyGateToken(token) : false;

  if (valid) {
    return NextResponse.next();
  }

  // API routes get a 401 instead of a redirect (so fetch() calls fail cleanly)
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Locked" }, { status: 401 });
  }

  // pages get redirected to the gate
  const url = request.nextUrl.clone();
  url.pathname = "/gate";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    // run on everything except Next.js internals and static assets
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};