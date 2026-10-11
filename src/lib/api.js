// the NEXT_PUBLIC_API_URL (custom prod), then fallback to localhost
const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const endpoints = {
  chat:             `${BASE}/api/chat`,
  chatStart:        `${BASE}/api/chat/start`,
  chatMessage:      `${BASE}/api/chat/message`,
  chatFreePrompts:  `${BASE}/api/chat/free/prompts`,
  // functions, because the chat id is part of the path
  chatEnd:          (chatId) => `${BASE}/api/chat/${chatId}/end`,
  chatTabuGuessed:  (chatId) => `${BASE}/api/chat/${chatId}/tabu/guessed`,
  lessons:          `${BASE}/api/lessons`,
  feedbackImmediate:`${BASE}/api/feedback/immediate`,
  feedbackDetailed: `${BASE}/api/feedback/detailed`,
  llmModels:        `${BASE}/api/llm/models`,
  llmStatus:        `${BASE}/api/llm/status`,
};