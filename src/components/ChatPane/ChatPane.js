'use client';

import React from 'react';
import styles from './ChatPane.module.css';
import ChatMessages from "@/components/ChatMessages/ChatMessages";
import ChatInput from "@/components/ChatInput/ChatInput";
import ProgressBar from '@/components/ProgressBar/ProgressBar';
import LessonDetailsModal from "@/components/LessonDetailsModal/LessonDetailsModal";
import FreeChatDetailsModal from "@/components/FreeChatDetailsModal/FreeChatDetailsModal";

export default function ChatPane({
  lessonData,
  messages,
  feedbacks,
  isLoading,
  sessionReady,
  promptsData,
  showDetails,
  onShowDetails,
  onCloseDetails,
  canEndLesson,
  turnsRemaining,
  userTurns,
  minTurns,
  onSubmit,
  onEndLesson,
  streamingContent,
  isFreeChat,
  freeChatPrompt,
}) {
  return (
    <div className={styles.pane}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.lessonTitle}>
            {isFreeChat ? 'Free conversation' : lessonData?.lesson_presentation.ui_title}
          </span>
          {!isFreeChat && lessonData?.lesson_type && (
            <span className={styles.lessonType}>{lessonData.lesson_type}</span>
          )}
        </div>

        <div className={styles.headerRight}>
          <button className={styles.detailsBtn} onClick={onShowDetails}>
            {isFreeChat ? 'About this chat' : 'See lesson details'}
          </button>
          <button
            className={`${styles.endBtn} ${canEndLesson ? styles.endBtnActive : ''}`}
            onClick={onEndLesson}
            disabled={!canEndLesson}
            title={
              !canEndLesson && turnsRemaining !== null
                ? `${turnsRemaining} more turn${turnsRemaining !== 1 ? 's' : ''} needed`
                : isFreeChat ? 'End chat' : 'End lesson'
            }
          >
            {isFreeChat ? 'End chat' : 'End lesson'}
          </button>
        </div>
      </div>

      <div className={styles.messages}>
        <ChatMessages messages={messages} isLoading={isLoading} feedbacks={feedbacks} streamingContent={streamingContent} />
      </div>

      <div className={styles.footer}>
        {!isFreeChat && <ProgressBar userTurns={userTurns} minTurns={minTurns} />}
        <ChatInput onSubmit={onSubmit} disabled={isLoading || !sessionReady} />
      </div>

      {showDetails && !isFreeChat && lessonData && (
        <LessonDetailsModal
          lesson={lessonData}
          prompts={promptsData}
          onClose={onCloseDetails}
        />
      )}

      {showDetails && isFreeChat && (
        <FreeChatDetailsModal
          systemPrompt={freeChatPrompt}
          onClose={onCloseDetails}
        />
      )}
    </div>
  );
}