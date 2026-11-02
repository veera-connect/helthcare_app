import { apiClient } from "./api";
import type { AIMessage } from "../types";

export async function sendAIMessage(message: string, sessionId?: string): Promise<AIMessage> {
  const res = await apiClient.post<AIMessage>("/ai/chat", {
    message,
    session_id: sessionId,
  });
  return res.data;
}
