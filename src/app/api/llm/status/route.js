import { NextResponse } from "next/server";
import { endpoints } from "@/lib/api";

// the status changes at runtime (failover), so never cache this route or its fetch
export const dynamic = "force-dynamic";

export async function GET() {
  const res = await fetch(endpoints.llmStatus, { cache: "no-store" });
  const data = await res.json();
  // pass the backend's status on, so a backend error shows the pill as offline
  return NextResponse.json(data, { status: res.status });
}