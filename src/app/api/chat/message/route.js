import { endpoints } from "@/lib/api";

export async function POST(request) {
  const body = await request.json();
  const res = await fetch(endpoints.chatMessage, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return new Response(res.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    },
  });
}