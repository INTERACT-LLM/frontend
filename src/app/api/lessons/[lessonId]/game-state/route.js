import { NextResponse } from "next/server";
import { endpoints } from "@/lib/api";

export async function GET(request, { params }) {
  const { lessonId } = await params;
  const sessionId = request.nextUrl.searchParams.get('session_id');
  const res = await fetch(`${endpoints.lessons}/${lessonId}/game-state?session_id=${sessionId}`);
  const data = await res.json();
  return NextResponse.json(data);
}