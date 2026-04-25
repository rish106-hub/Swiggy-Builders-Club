"use client";

import type { ChatMessage as ChatMessageType } from "@/types";
import { PlanCard } from "@/components/plan/PlanCard";
import { AgentStatusBar } from "@/components/ui/AgentStatus";

interface ChatMessageProps {
  message: ChatMessageType;
  onConfirm?: (plan: ChatMessageType["plan"]) => void;
  onAlternatives?: () => void;
  loading?: boolean;
}

export function ChatMessageBubble({ message, onConfirm, onAlternatives, loading }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div className={`max-w-[85%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-2`}>
        {/* Agent status (shown before assistant message with running agents) */}
        {!isUser && message.agent_status && (
          <AgentStatusBar
            food={message.agent_status.food}
            instamart={message.agent_status.instamart}
            dineout={message.agent_status.dineout}
          />
        )}

        {/* Message bubble */}
        <div
          className="px-4 py-3 text-sm leading-relaxed"
          style={{
            background: isUser ? "#FC8019" : "#F5F5F5",
            color: isUser ? "#fff" : "#282C3F",
            borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
            maxWidth: "100%",
          }}
        >
          {message.content}
        </div>

        {/* Plan card */}
        {!isUser && message.plan && (
          <PlanCard
            plan={message.plan}
            onConfirm={() => onConfirm?.(message.plan)}
            onAlternatives={() => onAlternatives?.()}
            loading={loading}
          />
        )}

        {/* Quick replies */}
        {!isUser && message.quick_replies && message.quick_replies.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {message.quick_replies.map((reply, i) => (
              <button
                key={i}
                className="px-3 py-1.5 text-xs font-medium rounded-full border transition-colors"
                style={{
                  border: "1px solid #FC8019",
                  color: "#FC8019",
                  background: "transparent",
                }}
                onClick={() => {
                  const input = document.querySelector<HTMLInputElement>("#chat-input");
                  if (input) {
                    input.value = reply;
                    input.focus();
                  }
                }}
              >
                {reply}
              </button>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <span className="text-xs" style={{ color: "#9E9E9E" }}>
          {new Date(message.timestamp).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}
