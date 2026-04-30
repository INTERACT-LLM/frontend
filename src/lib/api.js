// try API_BASE URL (custom local dev), then NEXT_PUBLIC_API_URL (custom prod), then fallback to localhost
const BASE = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const endpoints = {
  session: `${BASE}/api/session`,
  chat: `${BASE}/api/chat`,
  lessons: `${BASE}/api/lessons`,
  feedbackImmediate: `${BASE}/api/feedback/immediate`,
  feedbackDetailed: `${BASE}/api/feedback/detailed`,
  llmModels: `${BASE}/api/llm/models`,
  llmStatus: `${BASE}/api/llm/status`,
  freeChatPrompts: `${BASE}/api/chat/free/prompts`,
};