import { useCallback, useState } from "react";
import type { AgentType } from "@/types";

type SendEmberMessageInput = {
  message: string;
  opportunityId: string;
  agentType: AgentType;
  previousResponseId?: string;
  onToken?: (token: string) => void;
  onDone?: (payload: { responseId?: string; content: string }) => void;
};

export function useEmber() {
  const [isStreaming, setIsStreaming] = useState(false);

  const sendMessage = useCallback(async (input: SendEmberMessageInput) => {
    setIsStreaming(true);
    let content = "";

    const response = await fetch("/api/ember", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: input.message,
        opportunityId: input.opportunityId,
        agentType: input.agentType,
        previousResponseId: input.previousResponseId
      })
    });

    if (!response.ok || !response.body) {
      setIsStreaming(false);
      throw new Error("Ember failed to respond");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let responseId: string | undefined;

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split("\n\n");
      buffer = events.pop() ?? "";

      for (const event of events) {
        const line = event.split("\n").find((part) => part.startsWith("data: "));
        if (!line) continue;
        const payload = JSON.parse(line.slice(6));
        if (payload.type === "delta") {
          content += payload.text;
          input.onToken?.(payload.text);
        }
        if (payload.type === "done") {
          responseId = payload.responseId;
        }
      }
    }

    setIsStreaming(false);
    input.onDone?.({ responseId, content });
    return { responseId, content };
  }, []);

  return { sendMessage, isStreaming };
}
