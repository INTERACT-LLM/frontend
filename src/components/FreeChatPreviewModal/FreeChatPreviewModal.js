"use client";

import React from "react";
import { useRouter } from "next/navigation";
import BaseModal from "@/components/BaseModal/BaseModal";
import TutorStartsFooter from "@/components/TutorStartsFooter/TutorStartsFooter";
import styles from "./FreeChatPreviewModal.module.css";

export default function FreeChatPreviewModal({ onClose }) {
  const router = useRouter();

  const handleStart = (tutorStarts) => {
    onClose();
    const query = tutorStarts ? "?tutor_starts=true" : "";
    router.push(`/free-chat${query}`);
  };

  return (
    <BaseModal
      title="Free conversation"
      onClose={onClose}
      footer={
        <TutorStartsFooter
          onClose={onClose}
          onStart={handleStart}
          startLabel="Start chatting →"
        />
      }
    >
      <p className={styles.description}>
        An open-ended conversation with no lesson or scenario. Just talk freely —
        your tutor will follow your lead and adapt to your level.
      </p>
    </BaseModal>
  );
}