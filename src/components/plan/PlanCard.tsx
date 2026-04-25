"use client";

import type { OccasionPlan } from "@/types";
import { CostBreakdownView } from "./CostBreakdown";
import { TimelineView } from "./TimelineView";

interface PlanCardProps {
  plan: OccasionPlan;
  onConfirm: () => void;
  onAlternatives: () => void;
  loading?: boolean;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  planned: { bg: "#FC801915", text: "#FC8019", border: "#FC801930" },
  confirmed: { bg: "#60B24615", text: "#60B246", border: "#60B24630" },
  failed: { bg: "#E2374415", text: "#E23744", border: "#E2374430" },
};

export function PlanCard({ plan, onConfirm, onAlternatives, loading }: PlanCardProps) {
  const rest = plan.restaurant;
  const statusStyle = STATUS_STYLES[plan.status] ?? STATUS_STYLES.planned;

  return (
    <div
      className="rounded-xl p-4 space-y-4"
      style={{
        background: "#fff",
        border: "1px solid #E9E9E9",
        boxShadow: "0 2px 12px rgba(40,44,63,0.12)",
        maxWidth: 480,
      }}
    >
      {/* Status badge */}
      <div className="flex items-center justify-between">
        <span
          className="text-xs font-semibold px-2 py-1 rounded-full"
          style={{ background: statusStyle.bg, color: statusStyle.text, border: `1px solid ${statusStyle.border}` }}
        >
          {plan.status.toUpperCase()}
        </span>
        <span className="text-xs" style={{ color: "#9E9E9E" }}>
          {plan.occasion.type} · {plan.occasion.date}
        </span>
      </div>

      {/* Restaurant */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-bold text-base" style={{ color: "#282C3F" }}>{rest.name}</p>
            <p className="text-sm" style={{ color: "#535665" }}>
              {rest.cuisine} · {rest.ambiance}
            </p>
          </div>
          <div className="text-right shrink-0">
            <div className="flex items-center gap-1 justify-end">
              <span className="text-yellow-500">★</span>
              <span className="font-semibold text-sm" style={{ color: "#282C3F" }}>{rest.rating}</span>
            </div>
            {rest.net_cost && (
              <div className="text-sm font-bold mt-0.5" style={{ color: "#FC8019" }}>
                ₹{rest.net_cost.toLocaleString("en-IN")}
              </div>
            )}
          </div>
        </div>
        {rest.reasoning && (
          <p className="text-xs mt-1" style={{ color: "#9E9E9E" }}>{rest.reasoning}</p>
        )}
      </div>

      {/* Gifts */}
      {plan.gifts.length > 0 && (
        <div>
          <p className="text-xs font-semibold mb-2" style={{ color: "#9E9E9E", letterSpacing: "0.05em" }}>
            SURPRISES
          </p>
          <div className="space-y-1.5">
            {plan.gifts.map((gift, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span>{gift.type === "cake" ? "🎂" : gift.type === "flowers" ? "💐" : "🎁"}</span>
                  <span style={{ color: "#282C3F" }}>{gift.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-medium" style={{ color: "#282C3F" }}>₹{gift.price}</span>
                  {gift.delivery_window && (
                    <div className="text-xs" style={{ color: "#9E9E9E" }}>
                      ~{gift.delivery_window.earliest}–{gift.delivery_window.latest}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cost breakdown */}
      {plan.cost_breakdown && <CostBreakdownView breakdown={plan.cost_breakdown} />}

      {/* Timeline */}
      {plan.timeline.length > 0 && <TimelineView events={plan.timeline} />}

      {/* CTA */}
      {plan.requires_confirmation && plan.status === "planned" && (
        <div className="flex gap-2 pt-2">
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 rounded-full text-sm font-semibold text-white transition-colors"
            style={{
              background: loading ? "#9E9E9E" : "#FC8019",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Booking…" : "Yes, book it! ✓"}
          </button>
          <button
            onClick={onAlternatives}
            disabled={loading}
            className="px-4 py-3 rounded-full text-sm font-semibold transition-colors"
            style={{
              background: "transparent",
              border: "1px solid #FC8019",
              color: "#FC8019",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            Alternatives
          </button>
        </div>
      )}
    </div>
  );
}
