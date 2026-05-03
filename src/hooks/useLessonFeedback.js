import React from 'react';

const IMMEDIATE_FEEDBACK_ENDPOINT = '/api/feedback/immediate';
const DETAILED_FEEDBACK_ENDPOINT = '/api/feedback/detailed';

export function useLessonFeedback({ lessonId, chatId, selectedModel }) {

    const [feedbacks, setFeedbacks] = React.useState([]);
    const [detailedFeedback, setDetailedFeedback] = React.useState(null);

    async function addFeedback(userMessage) {
        if (!lessonId || !chatId) return;
        const response = await fetch(IMMEDIATE_FEEDBACK_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                last_user_message: userMessage,
                lesson_id: lessonId,
                chat_id: chatId,
                model_id: selectedModel,
            }),
        }).then(res => res.json());

        setFeedbacks(prev => [...prev, {
            feedback: response?.FeedbackResponse,
            feedbackStatus: response?.feedback_status,
        }]);
    }

    async function fetchDetailedFeedback(messages) {
        if (!chatId) return;
        const cleanMessages = messages.map(({ role, content }) => ({ role, content }));
        const response = await fetch(DETAILED_FEEDBACK_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: cleanMessages,
                lesson_id: lessonId,
                chat_id: chatId,
                model_id: selectedModel,
            }),
        }).then(res => res.json());

        setDetailedFeedback(response?.GeneralFeedbackResponse ?? '');
    }

    return { feedbacks, detailedFeedback, addFeedback, fetchDetailedFeedback };
}