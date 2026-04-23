import { NextResponse } from "next/server";
import { endpoints } from "@/lib/api";

export async function GET(request, { params }) {
  const { lessonId } = await params;
  const res = await fetch(`${endpoints.lessons}/${lessonId}/prompts`);
  const data = await res.json();
  return NextResponse.json(data);
}