import { NextResponse } from "next/server";
import { endpoints } from "@/lib/api";

export async function GET(request, { params }) {
  const { lessonId } = await params;
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");

  const res = await fetch(`${endpoints.lessons}/${lessonId}/prompts?session_id=${sessionId}`);
  
  if (!res.ok) {
    const text = await res.text();
    console.error("prompts error:", text);
    return NextResponse.json({ error: text }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}