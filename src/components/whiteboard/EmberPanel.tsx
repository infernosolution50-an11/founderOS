"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { agentLabels } from "@/lib/openai/agents";
import { useEmber } from "@/hooks/useEmber";
import type { AgentType, EmberMessage } from "@/types";

type EmberPanelProps = {
  opportunityId: string;
  initialMessages: EmberMessage[];
  activeAgent: AgentType;
  activeTab: string;
  quickAction: string | null;
  onQuickActionHandled: () => void;
};

const quickActions: Record<string, string[]> = {
  Research: ["Why does timing matter now?", "Who is the real customer?"],
  Market: ["Analyze this market", "Find the gap competitors miss"],
  Moat: ["Build the moat", "What's my strongest defensibility angle?"],
  Risks: ["Stress-test the thesis", "Find hidden risks"],
  Execute: ["Generate action plan", "What's the highest leverage move this week?"],
  Notes: ["Synthesize notes", "What am I not asking?"]
};

export function EmberPanel({ opportunityId, initialMessages, activeAgent, activeTab, quickAction, onQuickActionHandled }: EmberPanelProps) {
  const [messages, setMessages] = useState<EmberMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [streamingText, setStreamingText] = useState("");
  const [previousResponseId, setPreviousResponseId] = useState<string | undefined>();
  const { sendMessage, isStreaming } = useEmber();

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  const visibleMessages = useMemo(() => {
    if (messages.length > 0) return messages;
    return [
      {
        id: "intro",
        opportunity_id: opportunityId,
        user_id: "",
        role: "assistant" as const,
        content: "Fill in your opportunity and ask me anything. I'm your research co-founder — Ember.",
        agent_type: "core" as const,
        created_at: new Date().toISOString()
      }
    ];
  }, [messages, opportunityId]);

  const submitMessage = useCallback(async (message: string) => {
    if (!message.trim() || isStreaming) return;

    const userMessage: EmberMessage = {
      id: crypto.randomUUID(),
      opportunity_id: opportunityId,
      user_id: "",
      role: "user",
      content: message,
      agent_type: activeAgent,
      created_at: new Date().toISOString()
    };

    setMessages((current) => [...current.filter((item) => item.id !== "intro"), userMessage]);
    setInput("");
    setStreamingText("");

    try {
      const result = await sendMessage({
        message,
        opportunityId,
        agentType: activeAgent,
        previousResponseId,
        onToken: (token) => setStreamingText((current) => current + token)
      });

      setPreviousResponseId(result.responseId);
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          opportunity_id: opportunityId,
          user_id: "",
          role: "assistant",
          content: result.content,
          agent_type: activeAgent,
          created_at: new Date().toISOString()
        }
      ]);
      setStreamingText("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ember failed to respond");
      setStreamingText("");
    }
  }, [activeAgent, isStreaming, opportunityId, previousResponseId, sendMessage]);

  useEffect(() => {
    if (!quickAction) return;
    submitMessage(quickAction);
    onQuickActionHandled();
  }, [onQuickActionHandled, quickAction, submitMessage]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitMessage(input);
  }

  return (
    <aside className="flex min-h-[calc(100vh-77px)] flex-col bg-os-panel">
      <header className="border-b border-os-border p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold">Ember</h2>
            <p className="text-sm text-os-sub">{agentLabels[activeAgent]}</p>
          </div>
          <span className="rounded-full border border-os-indigo/40 bg-os-indigo/10 px-3 py-1 text-xs text-os-indigo">
            {activeTab}
          </span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {(quickActions[activeTab] ?? []).map((action) => (
            <button
              key={action}
              type="button"
              onClick={() => submitMessage(action)}
              className="rounded-full border border-os-border px-3 py-2 text-xs text-os-sub transition hover:border-os-indigo hover:text-os-text"
            >
              {action}
            </button>
          ))}
        </div>
      </header>

      <div className="scrollbar-thin flex-1 space-y-4 overflow-y-auto p-5">
        {visibleMessages.map((message) => (
          <div key={message.id} className={message.role === "user" ? "ml-auto max-w-[84%]" : "mr-auto max-w-[88%]"}>
            <div className={message.role === "user" ? "rounded-2xl bg-os-indigo p-4 text-white" : "rounded-2xl border border-os-border bg-os-surface p-4 text-os-text"}>
              <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>
            </div>
          </div>
        ))}
        {streamingText && (
          <div className="mr-auto max-w-[88%] rounded-2xl border border-os-border bg-os-surface p-4 text-sm leading-6 text-os-text">
            <p className="whitespace-pre-wrap">{streamingText}</p>
          </div>
        )}
        {isStreaming && !streamingText && <p className="text-sm text-os-sub">Ember is thinking...</p>}
      </div>

      <form onSubmit={onSubmit} className="sticky bottom-0 border-t border-os-border bg-os-bg p-4">
        <div className="flex gap-3">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask Ember..."
            className="min-w-0 flex-1 rounded-xl border border-os-border bg-os-surface px-4 py-3 text-os-text outline-none focus:border-os-indigo"
          />
          <button type="submit" disabled={isStreaming} className="rounded-xl bg-os-indigo px-4 py-3 text-white disabled:opacity-50">
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </aside>
  );
}
