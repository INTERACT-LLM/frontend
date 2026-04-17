'use client';

import React from 'react';
const ENDPOINT = 'http://localhost:8000/api/chat';

import styles from './ChatWindow.module.css';
import ChatMessages from "@/components/ChatMessages/ChatMessages";
import ChatInput from "@/components/ChatInput/ChatInput";

export default function ChatWindow({ chatType }) {
  const [messages, setMessages] = React.useState([]);
  const [sessionId, setSessionId] = React.useState();
  const [newMessage, setNewMessage] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const wrapperRef = React.useRef();

  // create a new sessionId on mount
  React.useEffect(() => {
    const newSessionId = `session-${Date.now()}`;
    setSessionId(newSessionId);
  }, []);

  React.useEffect(() => {
    if (!wrapperRef.current) return;

    wrapperRef.current.scrollTop = wrapperRef.current.scrollHeight;
  }, [messages]);

  async function submitNewMessage(event) {
    event.preventDefault();
    if (!newMessage.trim()) return;

    const userMessage = { role: 'user', content: newMessage };

    // add user content to UI immediately
    setMessages((prev) => [...prev, userMessage]);
    setNewMessage('');

    // call backend
    setIsLoading(true);
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userMessage,
        session_id: sessionId,
        lesson_id: chatType,
      }),
    });

    const data = await response.json();
    // remove the system prompt from the chat history before updating the UI  
    const messagesShown = data.messages.filter((msg) => msg.role !== 'system');

    setMessages(messagesShown);
    setIsLoading(false);
  }

    return (
    <>
    <div className={styles.wrapper} ref={wrapperRef}>
        <h1 className={styles.typeTitle}>{chatType.toUpperCase()}</h1>
        <div className={styles.chatWindow}>
          <ChatMessages messages={messages} isLoading={isLoading} />
          <ChatInput submitNewMessage={submitNewMessage} newMessage={newMessage} setNewMessage={setNewMessage} />
        </div>
    </div>
    </>
    );
}