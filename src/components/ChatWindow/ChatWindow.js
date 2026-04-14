'use client';

import React from 'react';
const ENDPOINT = 'http://localhost:8000/chat';

import styles from './ChatWindow.module.css';

export default function ChatWindow({ chatType }) {
  const [message, setMessage] = React.useState('');
  const [chat, setChat] = React.useState([]);

  async function sendMessage(event) {
    event.preventDefault();
    if (!message.trim()) return;

    const userMessage = message;

    // add user message to UI immediately
    setChat((previousMessages) => [...previousMessages, { role: 'user', text: userMessage }]);
    setMessage('');

    // call backend
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: userMessage }),
    });

    const data = await response.json();

    // add assistant reply
    setChat((prev) => [...prev, { role: 'assistant', text: data.message }]);
  }

    return (
    <>
    <div className={styles.wrapper}>
        <h1 className={styles.typeTitle}>{chatType.toUpperCase()}</h1>
        <div className={styles.chatWindow}>
        {chat.map((msg, i) => (
            <div key={i}>
            <b>{msg.role}:</b> {msg.text}
            </div>
        ))}
        </div>

        <form onSubmit={sendMessage} className={styles.inputRow}>
        <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
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