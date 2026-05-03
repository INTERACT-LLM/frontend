'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import ChatWindow from "@/components/ChatWindow/ChatWindow";
import FreeChatPreviewModal from "@/components/FreeChatPreviewModal/FreeChatPreviewModal";

export default function FreeChatPage() {
  const searchParams = useSearchParams();
  const [showModal, setShowModal] = React.useState(
    () => searchParams.get('setup') === 'true'
  );
  const [tutorStarts, setTutorStarts] = React.useState(
    () => searchParams.get('tutor_starts') === 'true'
  );

  return (
    <main>
      <ChatWindow lessonId={null} tutorStarts={tutorStarts} ready={!showModal} />

      {showModal && (
        <FreeChatPreviewModal
          onClose={() => setShowModal(false)}
          onStart={(val) => {
            setTutorStarts(val);
            setShowModal(false);
          }}
        />
      )}
    </main>
  );
}