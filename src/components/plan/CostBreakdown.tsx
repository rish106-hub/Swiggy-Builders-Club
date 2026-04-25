"use client";

import type { CostBreakdown } from "@/types";

export function CostBreakdownView({ breakdown }: { breakdown: CostBreakdown }) {
  const steps = [
    { label: "Original bill", amount: breakdown.original, color: "#535665" },
    ...(breakdown.girf_percent
      ? [
          {
            label: `GIRF (${breakdown.girf_percent}% off)`,
            amount: breakdown.after_girf,
            saving: breakdown.original - breakdown.after_girf,
            color: "#60B246",
          },
        ]
      : []),
    ...(breakdown.card_percent && breakdown.card_percent > 0
      ? [
          {
            label: `${breakdown.card_bank ?? "Card"} offer (${breakdown.card_percent}% off)`,
            amount: breakdown.after_card,
            saving: breakdown.after_girf - breakdown.after_card,
            color: "#3D5AF1",
          },
        ]
      : []),
    ...(breakdown.dinecash_used && breakdown.dinecash_used > 0
      ? [
          {
            label: `DineCash (₹${breakdown.dinecash_used})`,
            amount: breakdown.after_dinecash,
            saving: breakdown.dinecash_used,
            color: "#FC8019",
          },
        ]
      : []),
  ];

  return (
    <div className="mt-3">
      <p className="text-xs font-semibold mb-3" style={{ color: "#9E9E9E", letterSpacing: "0.05em" }}>
        SAVINGS BREAKDOWN
      </p>
      <div className="space-y-2">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span style={{ color: "#535665" }}>{step.label}</span>
            <div className="flex items-center gap-2">
              {"saving" in step && step.saving && (
                <span className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                  style={{ background: `${step.color}18`, color: step.color }}>
                  −₹{step.saving.toLocaleString("en-IN")}
                </span>
              )}
              <span className="font-semibold" style={{ color: "#282C3F" }}>
                ₹{step.amount.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        ))}

        <div className="pt-2 mt-2 flex items-center justify-between"
          style={{ borderTop: "2px solid #FC8019" }}>
          <span className="font-bold" style={{ color: "#282C3F" }}>You pay</span>
          <div className="text-right">
            <div className="text-lg font-bold" style={{ color: "#FC8019" }}>
              ₹{breakdown.final.toLocaleString("en-IN")}
            </div>
            <div className="text-xs" style={{ color: "#60B246" }}>
              Save ₹{breakdown.net_savings.toLocaleString("en-IN")} total
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
