import { endpoints } from "@/lib/api";

// forwards "learner confirmed the tutor guessed the word" to the backend
export async function POST(request, { params }) {
  const { chatId } = await params;
  const body = await request.json();

  const response = await fetch(endpoints.chatTabuGuessed(chatId), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  return Response.json(data, { status: response.status });
}