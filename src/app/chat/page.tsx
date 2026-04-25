"use client";

import { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import Link from "next/link";
import { ChatMessageBubble } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import type { ChatMessage, OccasionPlan } from "@/types";

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi! I'm Plus-One — your Swiggy household orchestrator. Tell me about an occasion you're planning (anniversary, birthday, parents visiting…) and I'll coordinate Food, Instamart, and Dineout for you all at once.",
  quick_replies: [
    "Anniversary dinner on Saturday",
    "Parents visiting this weekend",
    "Birthday surprise for my partner",
    "Client dinner booking",
  ],
  timestamp: new Date().toISOString(),
};

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    if (loading) return;

    const userMsg: ChatMessage = {
      id: uuidv4(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    const thinkingId = uuidv4();
    setMessages((prev) => [
      ...prev,
      {
        id: thinkingId,
        role: "assistant",
        content: "Coordinating across Food, Instamart, and Dineout…",
        agent_status: {
          food: { status: "running" },
          instamart: { status: "running" },
          dineout: { status: "running" },
        },
        timestamp: new Date().toISOString(),
      },
    ]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, household_id: "hh_demo001" }),
      });
      const data = await res.json();

      setMessages((prev) =>
        prev
          .filter((m) => m.id !== thinkingId)
          .concat({
            id: uuidv4(),
            role: "assistant",
            content: data.message ?? "Here's what I found.",
            plan: data.plan,
            quick_replies: data.quick_replies,
            agent_status: data.agent_status,
            timestamp: new Date().toISOString(),
          })
      );
    } catch {
      setMessages((prev) =>
        prev
          .filter((m) => m.id !== thinkingId)
          .concat({
            id: uuidv4(),
            role: "assistant",
            content: "Something went wrong. Please try again.",
            timestamp: new Date().toISOString(),
          })
      );
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (plan: OccasionPlan | undefined) => {
    if (!plan || confirming) return;
    setConfirming(true);

    setMessages((prev) => [
      ...prev,
      { id: uuidv4(), role: "user", content: "Yes, book it!", timestamp: new Date().toISOString() },
    ]);

    try {
      const res = await fetch("/api/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmed: true, plan, household_id: "hh_demo001" }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: "assistant",
          content: data.message ?? "Done! Have a wonderful occasion.",
          quick_replies: [],
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: "assistant",
          content: "Booking failed. Please complete it directly in the Swiggy app.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="flex flex-col h-screen" style={{ background: "#F5F5F5" }}>
      {/* Header */}
      <header
        className="flex items-center px-4 py-3 gap-3"
        style={{
          background: "#fff",
          borderBottom: "1px solid #E9E9E9",
          boxShadow: "0 1px 4px rgba(40,44,63,0.06)",
        }}
      >
        <Link
          href="/"
          className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
          style={{ background: "#F5F5F5", color: "#535665", border: "1px solid #E9E9E9" }}
        >
          ← Home
        </Link>
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
          style={{ background: "linear-gradient(135deg, #FC8019 0%, #FF4E00 100%)" }}
        >
          +1
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm" style={{ color: "#282C3F" }}>
            Plus-One
          </p>
          <p className="text-xs truncate" style={{ color: "#9E9E9E" }}>
            Swiggy Household Orchestrator
          </p>
        </div>
        <Link
          href="/household"
          className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
          style={{ background: "#F5F5F5", color: "#535665", border: "1px solid #E9E9E9" }}
        >
          My Household
        </Link>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.map((msg) => (
          <ChatMessageBubble
            key={msg.id}
            message={msg}
            onConfirm={handleConfirm}
            onAlternatives={() => sendMessage("Show me alternatives")}
            loading={confirming}
          />
        ))}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ background: "#fff", borderTop: "1px solid #E9E9E9" }}>
        <ChatInput
          onSend={sendMessage}
          disabled={loading || confirming}
          placeholder="Tell me about an occasion…"
        />
      </div>
    </div>
  );
}
