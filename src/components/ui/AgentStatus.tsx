"use client";

import type { AgentStatus } from "@/types";

interface AgentStatusProps {
  food: AgentStatus;
  instamart: AgentStatus;
  dineout: AgentStatus;
}

function StatusDot({ status }: { status: AgentStatus["status"] }) {
  return (
    <span
      className="inline-block w-2 h-2 rounded-full"
      style={{
        backgroundColor:
          status === "done"
            ? "#60B246"
            : status === "error"
            ? "#E23744"
            : status === "running"
            ? "#FC8019"
            : "#9E9E9E",
        animation: status === "running" ? "pulse 1s infinite" : undefined,
      }}
    />
  );
}

const LABELS: Record<string, string> = {
  food: "Food",
  instamart: "Instamart",
  dineout: "Dineout",
};

export function AgentStatusBar({ food, instamart, dineout }: AgentStatusProps) {
  const agents = { food, instamart, dineout };
  const anyRunning = Object.values(agents).some((a) => a.status === "running");
  if (!anyRunning && Object.values(agents).every((a) => a.status === "idle")) return null;

  return (
    <div
      className="flex items-center gap-3 px-4 py-2 rounded-full text-sm"
      style={{ background: "#F5F5F5", width: "fit-content" }}
    >
      {Object.entries(agents).map(([key, agent]) => (
        <div key={key} className="flex items-center gap-1.5">
          <StatusDot status={agent.status} />
          <span style={{ color: "#535665", fontWeight: 500 }}>{LABELS[key]}</span>
          {agent.status === "running" && (
            <span style={{ color: "#9E9E9E", fontSize: 11 }}>…</span>
          )}
          {agent.status === "error" && agent.message && (
            <span style={{ color: "#E23744", fontSize: 11 }} title={agent.message}>!</span>
          )}
        </div>
      ))}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}
