"use client";

import type { TimelineEvent } from "@/types";

export function TimelineView({ events }: { events: TimelineEvent[] }) {
  if (!events.length) return null;

  const sorted = [...events].sort((a, b) => a.time.localeCompare(b.time));

  const iconMap: Record<TimelineEvent["type"], string> = {
    depart: "🚶",
    arrive: "📍",
    delivery: "📦",
    milestone: "⭐",
    transport: "🚗",
  };

  return (
    <div className="mt-3">
      <p className="text-xs font-semibold mb-3" style={{ color: "#9E9E9E", letterSpacing: "0.05em" }}>
        TIMELINE
      </p>
      <div className="relative pl-5">
        {/* Vertical line */}
        <div
          className="absolute left-2 top-2 bottom-2 w-0.5"
          style={{ background: "linear-gradient(to bottom, #FC8019, #FF4E00)" }}
        />

        {sorted.map((event, i) => (
          <div key={i} className="relative flex items-start gap-3 mb-4 last:mb-0">
            {/* Dot */}
            <div
              className="absolute -left-3 w-2.5 h-2.5 rounded-full border-2 border-white"
              style={{ top: 4, background: event.status === "confirmed" ? "#60B246" : "#FC8019" }}
            />

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-base">{iconMap[event.type]}</span>
                <span className="font-medium text-sm" style={{ color: "#282C3F" }}>
                  {event.label}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-semibold" style={{ color: "#FC8019" }}>
                  {event.time}
                </span>
                {event.notes && (
                  <span className="text-xs" style={{ color: "#9E9E9E" }}>
                    {event.notes}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
