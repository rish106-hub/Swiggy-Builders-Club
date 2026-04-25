"use client";

import { useState } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, disabled, placeholder }: ChatInputProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 p-3">
      <div
        className="flex-1 flex items-end rounded-2xl px-4 py-2"
        style={{ border: "1.5px solid #E9E9E9", background: "#fff" }}
      >
        <textarea
          id="chat-input"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder={placeholder ?? "Tell me about an occasion…"}
          disabled={disabled}
          rows={1}
          className="w-full resize-none bg-transparent text-sm outline-none"
          style={{
            color: "#282C3F",
            lineHeight: "1.5",
            maxHeight: 120,
          }}
        />
      </div>
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors"
        style={{
          background: disabled || !value.trim() ? "#E9E9E9" : "#FC8019",
          color: disabled || !value.trim() ? "#9E9E9E" : "#fff",
          cursor: disabled || !value.trim() ? "not-allowed" : "pointer",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
        </svg>
      </button>
    </form>
  );
}
