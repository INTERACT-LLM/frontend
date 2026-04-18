import ChatWindow from "@/components/ChatWindow/ChatWindow";

export default async function ChatPage({ params }) {
  const { type } = await params;

  return (
    <main>
      <ChatWindow chatType={type} />
    </main>
  );
}