'use client';

import React from 'react';
const ENDPOINT = 'http://localhost:8000/api/chat';

import styles from './ChatWindow.module.css';

export default function ChatWindow({ chatType }) {
  const [content, setContent] = React.useState('');
  const [chat, setChat] = React.useState([]);
  const [sessionId, setSessionId] = React.useState();

  // create a new sessionId on mount
  React.useEffect(() => {
    const newSessionId = `session-${Date.now()}`;
    setSessionId(newSessionId);
  }, []);

  async function sendContent(event) {
    event.preventDefault();
    if (!content.trim()) return;

    const userMessage = { role: 'user', content: content};

    // add user content to UI immediately
    setChat((prev) => [...prev, userMessage]);
    setContent('');

    // call backend
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

    setChat(messagesShown);
  }

    return (
    <>
    <div className={styles.wrapper}>
        <h1 className={styles.typeTitle}>{chatType.toUpperCase()}</h1>
        <div className={styles.chatWindow}>
        {chat.map((msg, i) => (
            <div key={i}>
            <b>{msg.role}:</b> {msg.content}
            </div>
        ))}
        </div>

        <form onSubmit={sendContent} className={styles.inputRow}>
        <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type a message..."
            className={styles.input}
        />

        <button type="submit" className={styles.button}>
            Send
        </button>
        </form>
    </div>
    </>
    );
}