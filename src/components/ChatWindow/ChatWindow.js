'use client';

import React from 'react';
const ENDPOINT = 'http://localhost:8000/api/chat';

import { Send } from "lucide-react";
import styles from './ChatWindow.module.css';
import UserMessage from '@/components/UserMessage/UserMessage';
import AssistantMessage from '@/components/AssistantMessage/AssistantMessage';

const messageComponents = {
  user: UserMessage,
  assistant: AssistantMessage,
};

export default function ChatWindow({ chatType }) {
  const [content, setContent] = React.useState('');
  const [chat, setChat] = React.useState([]);
  const [sessionId, setSessionId] = React.useState();
  const [isSending, setIsSending] = React.useState(false);
  const messageRefs = React.useRef([]);
  const inputRef = React.useRef(null);

  // create a new sessionId on mount
  React.useEffect(() => {
    const newSessionId = `session-${Date.now()}`;
    setSessionId(newSessionId);
  }, []);

  React.useEffect(() => {
    if (chat.length === 0) return;

    const targetIndex = Math.max(chat.length - 2, 0);
    const targetNode = messageRefs.current[targetIndex];
    if (!targetNode) return;

    targetNode.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, [chat]);

  async function sendContent(event) {
    event.preventDefault();
    if (!content.trim() || !sessionId || isSending) return;

    const userMessage = { role: 'user', content: content };

    setChat((prev) => [...prev, userMessage]);
    setContent('');
    setIsSending(true);

    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          session_id: sessionId,
          lesson_id: chatType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message.');
      }

      const data = await response.json();
      const messagesShown = data.messages.filter((msg) => msg.role !== 'system');
      setChat(messagesShown);
    } catch {
      setChat((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I could not send that message right now. Please try again.',
        },
      ]);
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  }

  return (
    <>
      <div className={styles.wrapper}>
        <h1 className={styles.typeTitle}>{chatType.toUpperCase()}</h1>
        <div className={styles.chatWindow}>
          {chat.map((msg, i) => {
            const MessageComponent = messageComponents[msg.role];
            return MessageComponent
              ? (
                <div key={i} ref={(node) => {
                  messageRefs.current[i] = node;
                }}>
                  <MessageComponent content={msg.content} />
                </div>
              )
              : null;
          })}
        </div>

        <form onSubmit={sendContent} className={styles.inputRow}>
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type a message..."
            className={styles.input}
            ref={inputRef}
            disabled={isSending}
          />
          <button type="submit" className={styles.button} disabled={isSending || !content.trim()}>
            <Send size={16} />
          </button>
        </form>
      </div>
    </>
  );
}