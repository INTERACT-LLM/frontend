import { NextResponse } from "next/server";
import { endpoints } from "@/lib/api";

export async function GET(request, { params }) {
  const { lessonId } = await params;
  const chatId = request.nextUrl.searchParams.get('chat_id');
  const res = await fetch(`${endpoints.lessons}/${lessonId}/game-state?chat_id=${chatId}`);
  const data = await res.json();
  return NextResponse.json(data);
}