import { NextResponse } from "next/server";
import { endpoints } from "@/lib/api";

export async function POST(request) {
  const body = await request.json();
  console.log("session body:", JSON.stringify(body));
  
  const res = await fetch(endpoints.session, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  
  const text = await res.text();
  console.log("session response status:", res.status);
  console.log("session response:", text);
  
  return NextResponse.json(JSON.parse(text));
}