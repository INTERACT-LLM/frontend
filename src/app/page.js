'use client';
import React from 'react';

import Header from '../components/Header/Header';
import ChatWindow from '../components/ChatWindow/ChatWindow';

export default function Home() {
  return (
    <main>
      <Header />
      <ChatWindow />
    </main>
  );
}
