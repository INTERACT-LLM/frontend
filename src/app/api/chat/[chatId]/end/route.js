import { endpoints } from "@/lib/api";

// forwards "how the chat ended" to the backend.
// Also receives the sendBeacon from the page closing, which arrives as normal JSON.
export async function POST(request, { params }) {
  const { chatId } = await params;
  const body = await request.json();

  const response = await fetch(endpoints.chatEnd(chatId), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  // pass the backend's status on, so a 404 still counts as a failure in postLog
  return Response.json(data, { status: response.status });
}