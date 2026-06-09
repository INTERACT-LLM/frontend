// the NEXT_PUBLIC_API_URL (custom prod), then fallback to localhost
const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const endpoints = {
  session:          `${BASE}/api/session`,
  chat:             `${BASE}/api/chat`,
  chatStart:        `${BASE}/api/chat/start`,
  chatMessage:      `${BASE}/api/chat/message`,
  chatFreePrompts:  `${BASE}/api/chat/free/prompts`,
  lessons:          `${BASE}/api/lessons`,
  feedbackImmediate:`${BASE}/api/feedback/immediate`,
  feedbackDetailed: `${BASE}/api/feedback/detailed`,
  llmModels:        `${BASE}/api/llm/models`,
  llmStatus:        `${BASE}/api/llm/status`,
};