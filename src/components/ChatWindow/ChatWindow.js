'use client';

import React from 'react';
const ENDPOINT = 'http://localhost:8000/chat';

import styles from './ChatWindow.module.css';

export default function ChatWindow({ chatType }) {
  const [content, setContent] = React.useState('');
  const [chat, setChat] = React.useState([]);

  async function sendContent(event) {
    event.preventDefault();
    if (!content.trim()) return;

    const userContent = content;

    // add user content to UI immediately
    setChat((prev) => [...prev, { role: 'user', content: userContent }]);
    setContent('');

    // call backend
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: userContent }),
    });

    const data = await response.json();

    // add assistant reply
    setChat((prev) => [...prev, { role: 'assistant', content: data.content }]);
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