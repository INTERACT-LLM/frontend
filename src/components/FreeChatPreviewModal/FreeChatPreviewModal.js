"use client";

import React from "react";
import BaseModal from "@/components/BaseModal/BaseModal";
import TutorStartsFooter from "@/components/TutorStartsFooter/TutorStartsFooter";
import styles from "./FreeChatPreviewModal.module.css";

export default function FreeChatPreviewModal({ onClose, onStart }) {
  const handleStart = (tutorStarts) => {
    onClose();
    if (onStart) onStart(tutorStarts);
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
        An open-ended conversation with no lesson or scenario. Just talk freely:
        Your tutor will follow your lead and adapt to your level.
      </p>
    </BaseModal>
  );
}