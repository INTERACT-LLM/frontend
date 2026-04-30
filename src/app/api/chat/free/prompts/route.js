import { endpoints } from "@/lib/api";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const session_id = searchParams.get('session_id');

  const response = await fetch(
    `${endpoints.freeChatPrompts}?session_id=${session_id}`
  );

  const data = await response.json();
  return Response.json(data);
}