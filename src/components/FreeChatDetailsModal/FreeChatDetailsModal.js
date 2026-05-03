"use client";

import React from "react";
import BaseModal from "@/components/BaseModal/BaseModal";
import PromptBlock from "@/components/PromptBlock/PromptBlock";
import styles from "./FreeChatDetailsModal.module.css";

export default function FreeChatDetailsModal({ systemPrompt, onClose }) {
  return (
    <BaseModal
      eyebrow="About this chat"
      title="Free conversation"
      onClose={onClose}
      className={styles.modal}
    >
      <p className={styles.description}>
        An open-ended conversation with no lesson or scenario. Just talk freely —
        your tutor will follow your lead and adapt to your level.
      </p>
      <p className={styles.transparencyNote}>
        This is exactly what the AI receives before your conversation starts.
      </p>
      {!systemPrompt
        ? <div className={styles.loadingState}>Loading…</div>
        : <PromptBlock label="Chat system prompt" content={systemPrompt} />
      }
    </BaseModal>
  );
}