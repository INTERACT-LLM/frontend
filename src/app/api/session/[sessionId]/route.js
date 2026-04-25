import { NextResponse } from "next/server";
import { endpoints } from "@/lib/api";

export async function DELETE(request, { params }) {
  const { sessionId } = await params;
  await fetch(`${endpoints.session}/${sessionId}`, { method: 'DELETE' });
  return NextResponse.json({ ok: true });
}