import { NextResponse } from "next/server";
import { endpoints } from "@/lib/api";

export async function GET(request, { params }) {
  const { lessonId } = await params;
  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get("chat_id");

  const res = await fetch(`${endpoints.lessons}/${lessonId}/prompts?chat_id=${chatId}`);
  
  if (!res.ok) {
    const text = await res.text();
    console.error("prompts error:", text);
    return NextResponse.json({ error: text }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}