import ChatWindow from "@/components/ChatWindow/ChatWindow";

export default async function ChatPage({ params }) {
  const { lessonId } = await params;

  return (
    <main>
      <ChatWindow lessonId={lessonId} />
    </main>
  );
}