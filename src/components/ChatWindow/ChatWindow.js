import React from 'react';
const ENDPOINT = 'http://localhost:8000/chat';

export default function ChatWindow() {
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
      <div
        style={{
          marginBottom: 20,
          padding: 50,
          border: '1px solid #ccc',
          height: 300,
          overflowY: 'scroll',
        }}
      >
        {chat.map((msg, i) => (
          <div key={i} style={{ margin: '8px 0' }}>
            <b>{msg.role}:</b> {msg.text}
          </div>
        ))}
      </div>

      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        style={{ width: '70%', marginRight: 10 }}
      />

      <button onClick={sendMessage}>Send</button>
    </>
  );
}
