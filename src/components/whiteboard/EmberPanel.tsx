"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { toast } from "@/components/ui/toast";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { agentLabels } from "@/lib/openai/agents";
import { extractJsonPayloads } from "@/lib/ember/fieldUpdates";
import { useEmber } from "@/hooks/useEmber";
import type { AgentType, EmberMessage } from "@/types";

type EmberPanelProps = {
  opportunityId: string;
  initialMessages: EmberMessage[];
  activeAgent: AgentType;
  activeTab: string;
  quickAction: string | null;
  onQuickActionHandled: () => void;
  onRefresh?: () => void | Promise<void>;
  onFieldUpdates?: (payload: unknown) => void;
  onCollapse?: () => void;
  readOnly?: boolean;
};

const quickActions: Record<string, string[]> = {
  Research: ["Why does timing matter now?", "Who is the real customer?"],
  Market: ["Analyze this market", "Find the gap competitors miss"],
  Moat: ["Build the moat", "What's my strongest defensibility angle?"],
  Risks: ["Stress-test the thesis", "Find hidden risks"],
  Execute: ["Generate action plan", "What's the highest leverage move this week?"],
  Notes: ["Synthesize notes", "What am I not asking?"],
  Fit: ["Pressure-test founder fit", "What edge am I missing?"],
  Signal: ["Assess validation signal", "What proof is still missing?"]
};

const emberModelLabel = "gpt-5-mini";

export function EmberPanel({ opportunityId, initialMessages, activeAgent, activeTab, quickAction, onQuickActionHandled, onRefresh, onFieldUpdates, onCollapse, readOnly }: EmberPanelProps) {
  const [messages, setMessages] = useState<EmberMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [streamingText, setStreamingText] = useState("");
  const [previousResponseId, setPreviousResponseId] = useState<string | undefined>();
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { sendMessage, isStreaming } = useEmber();
  usePullToRefresh(scrollRef, () => onRefresh?.(), Boolean(onRefresh));

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;
    const viewport = window.visualViewport;
    function updateOffset() {
      const offset = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
      setKeyboardOffset(offset);
    }
    updateOffset();
    viewport.addEventListener("resize", updateOffset);
    viewport.addEventListener("scroll", updateOffset);
    return () => {
      viewport.removeEventListener("resize", updateOffset);
      viewport.removeEventListener("scroll", updateOffset);
    };
  }, []);

  const visibleMessages = useMemo(() => {
    if (messages.length > 0) return messages;
    return [
      {
        id: "intro",
        opportunity_id: opportunityId,
        user_id: "",
        role: "assistant" as const,
        content: "Hi. I'm Ember — your research co-founder. What are you building?",
        agent_type: "core" as const,
        created_at: new Date().toISOString()
      }
    ];
  }, [messages, opportunityId]);

  const submitMessage = useCallback(async (message: string) => {
    if (readOnly || !message.trim() || isStreaming) return;

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
      extractJsonPayloads(result.content).forEach((payload) => onFieldUpdates?.(payload));
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
  }, [activeAgent, isStreaming, onFieldUpdates, opportunityId, previousResponseId, readOnly, sendMessage]);

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
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-os-border bg-os-surface px-3 py-1 text-xs text-os-sub">{emberModelLabel}</span>
            <span className="rounded-full border border-os-indigo/40 bg-os-indigo/10 px-3 py-1 text-xs text-os-indigo">
              {activeTab}
            </span>
            {onCollapse && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Collapse Ember"
                onClick={onCollapse}
                leftIcon={<ChevronRight className="h-4 w-4" aria-hidden="true" />}
              />
            )}
          </div>
        </div>
        <div className="scrollbar-thin mt-4 flex gap-2 overflow-x-auto pb-1">
          {(quickActions[activeTab] ?? []).map((action) => (
            <Button
              key={action}
              type="button"
              onClick={() => submitMessage(action)}
              variant="secondary"
              size="sm"
              className="min-w-max rounded-full"
              disabled={readOnly}
            >
              {action}
            </Button>
          ))}
        </div>
      </header>

      <div ref={scrollRef} className="scrollbar-thin flex-1 space-y-4 overflow-y-auto p-5">
        {messages.length === 0 && !streamingText && !isStreaming ? (
          <EmptyState
            icon={<MessageCircle className="h-5 w-5" aria-hidden="true" />}
            title="Hi. I'm Ember."
            description={readOnly ? "This is a shared demo thread. Copy the demo to your workspace before asking Ember to write new messages." : "Tell me what you're building, or fill in the whiteboard and tap a prompt chip. I'll turn the raw inputs into specific founder advice."}
          />
        ) : visibleMessages.map((message) => (
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

      <form onSubmit={onSubmit} className="safe-bottom sticky bottom-0 border-t border-os-border bg-os-bg p-4 keyboard-safe" style={{ paddingBottom: `calc(env(safe-area-inset-bottom) + ${keyboardOffset}px + 1rem)` }}>
        <div className="flex gap-3">
          <input
            aria-label="Ask Ember"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask Ember..."
            disabled={readOnly}
            className="h-12 min-w-0 flex-1 rounded-os-md border border-os-border bg-os-surface px-4 text-os-text focus:border-os-indigo"
          />
          <Button
            type="submit"
            disabled={isStreaming || readOnly}
            loading={isStreaming}
            size="icon"
            variant="primary"
            aria-label="Send message"
            leftIcon={<Send className="h-5 w-5" aria-hidden="true" />}
          />
        </div>
      </form>
    </aside>
  );
}
