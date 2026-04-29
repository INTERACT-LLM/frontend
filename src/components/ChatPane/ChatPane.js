'use client';

import React from 'react';
import styles from './ChatPane.module.css';
import ChatMessages from "@/components/ChatMessages/ChatMessages";
import ChatInput from "@/components/ChatInput/ChatInput";
import ProgressBar from '@/components/ProgressBar/ProgressBar';
import LessonDetailsModal from "@/components/LessonDetailsModal/LessonDetailsModal";

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
}) {
  return (
    <div className={styles.pane}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.lessonTitle}>{lessonData?.lesson_presentation.ui_title}</span>
          {lessonData?.lesson_type && (
            <span className={styles.lessonType}>{lessonData.lesson_type}</span>
          )}
        </div>

        <div className={styles.headerRight}>
          <button className={styles.detailsBtn} onClick={onShowDetails}>
            See lesson details
          </button>
          <button
            className={`${styles.endBtn} ${canEndLesson ? styles.endBtnActive : ''}`}
            onClick={onEndLesson}
            disabled={!canEndLesson}
            title={
              !canEndLesson && turnsRemaining !== null
                ? `${turnsRemaining} more turn${turnsRemaining !== 1 ? 's' : ''} needed`
                : 'End lesson'
            }
          >
            End lesson
          </button>
        </div>
      </div>

      <div className={styles.messages}>
        <ChatMessages messages={messages} isLoading={isLoading} feedbacks={feedbacks} streamingContent={streamingContent} />
      </div>

      <div className={styles.footer}>
        <ProgressBar userTurns={userTurns} minTurns={minTurns} />
        <ChatInput onSubmit={onSubmit} disabled={isLoading || !sessionReady} />
      </div>

      {showDetails && lessonData && (
        <LessonDetailsModal
          lesson={lessonData}
          prompts={promptsData}
          onClose={onCloseDetails}
        />
      )}
    </div>
  );
}