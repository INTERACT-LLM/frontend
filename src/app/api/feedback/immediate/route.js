import { NextResponse } from "next/server";
import { endpoints } from "@/lib/api";

export async function POST(request) {
  const body = await request.json();
  const res = await fetch(`${endpoints.feedbackImmediate}?session_id=${body.session_id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data);
}