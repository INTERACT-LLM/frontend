const API_BASE_URL = process.env.API_BASE_URL;

export const endpoints = {
  chat:            `${API_BASE_URL}/api/chat`,
  lessons:         `${API_BASE_URL}/api/lessons`,
  feedback:        `${API_BASE_URL}/api/feedback/immediate`,
  detailedFeedback:`${API_BASE_URL}/api/feedback/detailed`,
};