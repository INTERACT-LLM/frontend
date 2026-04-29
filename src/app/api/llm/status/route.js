import { NextResponse } from "next/server";
import { endpoints } from "@/lib/api";

export async function GET() {
  const res = await fetch(endpoints.llmStatus);
  const data = await res.json();
  return NextResponse.json(data);
}