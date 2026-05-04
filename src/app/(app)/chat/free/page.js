'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import ChatWindow from "@/components/ChatWindow/ChatWindow";
import FreeChatPreviewModal from "@/components/FreeChatPreviewModal/FreeChatPreviewModal";

// wrapp search params in inner component
function FreeChatContent() {
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

// ✅ Outer page: wraps the inner component in a Suspense boundary
export default function FreeChatPage() {
  return (
    <Suspense fallback={null}>
      <FreeChatContent />
    </Suspense>
  );
}