import { endpoints } from "@/lib/api";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const chat_id = searchParams.get("chat_id");

  const response = await fetch(`${endpoints.chatFreePrompts}?chat_id=${chat_id}`);
  const data = await response.json();
  return Response.json(data);
}