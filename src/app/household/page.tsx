"use client";

import { useEffect, useState } from "react";
import type { HouseholdProfile } from "@/types";

const DIETARY_LABELS: Record<string, string> = {
  vegetarian: "🌱 Vegetarian",
  vegan: "🌿 Vegan",
  jain: "🙏 Jain",
  halal: "☪️ Halal",
  diabetic_friendly: "💊 Diabetic-friendly",
  gluten_free: "🌾 Gluten-free",
  lactose_intolerant: "🥛 Lactose-intolerant",
  no_pork: "🚫 No pork",
  no_beef: "🚫 No beef",
};

export default function HouseholdPage() {
  const [household, setHousehold] = useState<HouseholdProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/household?id=hh_demo001")
      .then((r) => r.json())
      .then((data) => {
        if (data.household_id) setHousehold(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "#F5F5F5" }}>
      {/* Header */}
      <header
        className="flex items-center px-4 py-3 gap-3"
        style={{ background: "#fff", borderBottom: "1px solid #E9E9E9" }}
      >
        <a href="/" className="text-sm font-medium" style={{ color: "#FC8019" }}>
          ← Back
        </a>
        <p className="font-bold text-sm flex-1 text-center" style={{ color: "#282C3F" }}>
          My Household
        </p>
        <div style={{ width: 40 }} />
      </header>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        {loading && (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 rounded-xl animate-pulse" style={{ background: "#E9E9E9" }} />
            ))}
          </div>
        )}

        {!loading && !household && (
          <div className="text-center py-12" style={{ color: "#9E9E9E" }}>
            <p className="text-4xl mb-3">👨‍👩‍👧</p>
            <p className="font-semibold">No household found</p>
            <p className="text-sm mt-1">Start a conversation to set up your household profile.</p>
          </div>
        )}

        {household && (
          <>
            {/* Members */}
            <section
              className="rounded-xl p-4"
              style={{ background: "#fff", boxShadow: "0 2px 12px rgba(40,44,63,0.08)" }}
            >
              <p className="text-xs font-semibold mb-3" style={{ color: "#9E9E9E", letterSpacing: "0.05em" }}>
                MEMBERS
              </p>
              <div className="space-y-3">
                {household.members.map((m) => (
                  <div key={m.id} className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                      style={{ background: "linear-gradient(135deg, #FC8019, #FF4E00)", fontSize: 16 }}
                    >
                      {m.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm" style={{ color: "#282C3F" }}>
                          {m.name}
                        </p>
                        <span
                          className="text-xs px-1.5 py-0.5 rounded-full"
                          style={{ background: "#F5F5F5", color: "#535665" }}
                        >
                          {m.role.replace("_", " ")}
                        </span>
                      </div>
                      {m.dietary_constraints.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {m.dietary_constraints.map((d) => (
                            <span key={d} className="text-xs px-2 py-0.5 rounded-full"
                              style={{ background: "#60B24615", color: "#60B246", border: "1px solid #60B24630" }}>
                              {DIETARY_LABELS[d] ?? d}
                            </span>
                          ))}
                        </div>
                      )}
                      {m.allergies.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {m.allergies.map((a) => (
                            <span key={a} className="text-xs px-2 py-0.5 rounded-full"
                              style={{ background: "#E2374415", color: "#E23744", border: "1px solid #E2374430" }}>
                              ⚠ No {a}
                            </span>
                          ))}
                        </div>
                      )}
                      {m.preferences.cuisines.length > 0 && (
                        <p className="text-xs mt-1" style={{ color: "#9E9E9E" }}>
                          Loves: {m.preferences.cuisines.join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Cards */}
            <section
              className="rounded-xl p-4"
              style={{ background: "#fff", boxShadow: "0 2px 12px rgba(40,44,63,0.08)" }}
            >
              <p className="text-xs font-semibold mb-3" style={{ color: "#9E9E9E", letterSpacing: "0.05em" }}>
                PAYMENT CARDS
              </p>
              {household.cards.length === 0 && (
                <p className="text-sm" style={{ color: "#9E9E9E" }}>No cards added yet.</p>
              )}
              <div className="space-y-2">
                {household.cards.map((c) => (
                  <div key={c.card_id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-5 rounded text-xs flex items-center justify-center font-bold text-white"
                        style={{ background: "#282C3F", fontSize: 9 }}
                      >
                        {c.bank}
                      </div>
                      <span className="text-sm" style={{ color: "#282C3F" }}>
                        {c.bank} {c.type}
                      </span>
                    </div>
                    {c.dinecash_balance !== undefined && c.dinecash_balance > 0 && (
                      <span className="text-xs font-semibold" style={{ color: "#FC8019" }}>
                        DineCash ₹{c.dinecash_balance}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Learned patterns */}
            {household.learned_patterns.length > 0 && (
              <section
                className="rounded-xl p-4"
                style={{ background: "#fff", boxShadow: "0 2px 12px rgba(40,44,63,0.08)" }}
              >
                <p className="text-xs font-semibold mb-3" style={{ color: "#9E9E9E", letterSpacing: "0.05em" }}>
                  LEARNED PREFERENCES
                </p>
                <div className="space-y-2">
                  {household.learned_patterns.map((p) => (
                    <div key={p.pattern_id} className="flex items-start gap-2 text-sm">
                      <span className="text-base">💡</span>
                      <div>
                        <p style={{ color: "#282C3F" }}>{p.description}</p>
                        <p className="text-xs" style={{ color: "#9E9E9E" }}>
                          Confidence {Math.round(p.confidence * 100)}% · {p.evidence_count} observations
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
