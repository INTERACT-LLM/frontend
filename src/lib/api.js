const API_BASE_URL = process.env.API_BASE_URL;

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const endpoints = {
  session: `${BASE}/api/session`,
  chat: `${BASE}/api/chat`,
  lessons: `${BASE}/api/lessons`,
  feedbackImmediate: `${BASE}/api/feedback/immediate`,
  feedbackDetailed: `${BASE}/api/feedback/detailed`,
};