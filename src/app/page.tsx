import Link from "next/link";

const features = [
  {
    icon: "🍽️",
    agent: "Food Agent",
    title: "Restaurant Intelligence",
    desc: "Finds 3 ranked restaurant options matching your cuisine preferences, dietary constraints, and budget — powered by Swiggy Food.",
    color: "#FC8019",
  },
  {
    icon: "🛍️",
    agent: "Instamart Agent",
    title: "Gift & Surprise Planning",
    desc: "Sources cakes and flowers with precision delivery timing — flowers arrive before you leave, cake arrives after starters.",
    color: "#60B246",
  },
  {
    icon: "🥂",
    agent: "Dineout Agent",
    title: "Smart Offer Stacking",
    desc: "Checks table availability and stacks GIRF + bank card + DineCash in the optimal order. Every rupee saved.",
    color: "#3D5AF1",
  },
];

const occasions = [
  "Anniversary dinner",
  "Parents visiting",
  "Birthday surprise",
  "Client dinner",
  "Friends gathering",
];

export default function LandingPage() {
  return (
    <div style={{ background: "#282C3F", minHeight: "100vh", color: "#fff" }}>
      {/* Top nav */}
      <nav
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(40,44,63,0.95)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "0 24px",
            height: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #FC8019 0%, #FF4E00 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 13,
                color: "#fff",
              }}
            >
              +1
            </div>
            <span style={{ fontWeight: 700, fontSize: 16, color: "#fff" }}>Plus-One</span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: "#FC8019",
                background: "rgba(252,128,25,0.12)",
                border: "1px solid rgba(252,128,25,0.3)",
                borderRadius: 9999,
                padding: "2px 8px",
                marginLeft: 4,
              }}
            >
              Swiggy Builders Club
            </span>
          </div>
          <Link
            href="/chat"
            style={{
              background: "#FC8019",
              color: "#fff",
              padding: "8px 20px",
              borderRadius: 9999,
              fontWeight: 600,
              fontSize: 14,
              textDecoration: "none",
              transition: "background 0.15s",
            }}
          >
            Open App
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "80px 24px 64px",
          textAlign: "center",
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(252,128,25,0.1)",
            border: "1px solid rgba(252,128,25,0.25)",
            borderRadius: 9999,
            padding: "6px 16px",
            marginBottom: 32,
          }}
        >
          <span style={{ color: "#FC8019", fontSize: 13, fontWeight: 600 }}>
            ✦ AI-powered occasion planning · Food + Instamart + Dineout
          </span>
        </div>

        <h1
          style={{
            fontSize: "clamp(36px, 6vw, 64px)",
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: 24,
            letterSpacing: "-1px",
          }}
        >
          Your household's{" "}
          <span
            style={{
              background: "linear-gradient(90deg, #FC8019 0%, #FF6B35 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            occasion planner.
          </span>
          <br />
          All of Swiggy, one conversation.
        </h1>

        <p
          style={{
            fontSize: 18,
            color: "rgba(255,255,255,0.6)",
            maxWidth: 580,
            margin: "0 auto 40px",
            lineHeight: 1.6,
          }}
        >
          Type your occasion. Three AI agents run in parallel — restaurants, gifts, table bookings,
          offer stacking — delivered as a single plan in seconds.
        </p>

        {/* CTA */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/chat"
            style={{
              background: "linear-gradient(135deg, #FC8019 0%, #FF4E00 100%)",
              color: "#fff",
              padding: "16px 36px",
              borderRadius: 9999,
              fontWeight: 700,
              fontSize: 16,
              textDecoration: "none",
              boxShadow: "0 8px 32px rgba(252,128,25,0.4)",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            Start Planning  →
          </Link>
          <Link
            href="/household"
            style={{
              background: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.8)",
              padding: "16px 36px",
              borderRadius: 9999,
              fontWeight: 600,
              fontSize: 16,
              textDecoration: "none",
              border: "1px solid rgba(255,255,255,0.12)",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            View Household
          </Link>
        </div>

        {/* Occasion pills */}
        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "center",
            flexWrap: "wrap",
            marginTop: 32,
          }}
        >
          {occasions.map((o) => (
            <span
              key={o}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 9999,
                padding: "6px 14px",
                fontSize: 13,
                color: "rgba(255,255,255,0.5)",
              }}
            >
              {o}
            </span>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 24px 80px",
        }}
      >
        {/* Section label */}
        <p
          style={{
            textAlign: "center",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.1em",
            color: "#FC8019",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          How it works
        </p>
        <h2
          style={{
            textAlign: "center",
            fontSize: 28,
            fontWeight: 700,
            marginBottom: 48,
            color: "#fff",
          }}
        >
          Three agents. One plan. Instantly.
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 20,
          }}
        >
          {features.map((f, i) => (
            <div
              key={f.agent}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16,
                padding: "28px 24px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Glow accent */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: f.color,
                  borderRadius: "16px 16px 0 0",
                }}
              />
              <div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  color: f.color,
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                {f.agent}
              </p>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#fff",
                  marginBottom: 10,
                }}
              >
                {f.title}
              </h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
                {f.desc}
              </p>
              <div
                style={{
                  position: "absolute",
                  bottom: 16,
                  right: 16,
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.06)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.3)",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats strip */}
      <section
        style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(255,255,255,0.02)",
          padding: "32px 24px",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 24,
            textAlign: "center",
          }}
        >
          {[
            { val: "3 agents", label: "run in parallel" },
            { val: "< 5s", label: "full plan ready" },
            { val: "GIRF + Card + DineCash", label: "offer stacking" },
            { val: "0 clicks", label: "to place order" },
          ].map((s) => (
            <div key={s.val}>
              <p style={{ fontSize: 22, fontWeight: 800, color: "#FC8019" }}>{s.val}</p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA section */}
      <section
        style={{
          maxWidth: 700,
          margin: "0 auto",
          padding: "80px 24px",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(28px, 4vw, 42px)",
            fontWeight: 800,
            marginBottom: 16,
            lineHeight: 1.2,
          }}
        >
          Ready to plan your next occasion?
        </h2>
        <p
          style={{
            fontSize: 16,
            color: "rgba(255,255,255,0.5)",
            marginBottom: 36,
            lineHeight: 1.6,
          }}
        >
          Just describe it. Plus-One handles restaurants, gifts, timing, and savings — all at once.
        </p>
        <Link
          href="/chat"
          style={{
            background: "linear-gradient(135deg, #FC8019 0%, #FF4E00 100%)",
            color: "#fff",
            padding: "18px 48px",
            borderRadius: 9999,
            fontWeight: 700,
            fontSize: 17,
            textDecoration: "none",
            boxShadow: "0 12px 40px rgba(252,128,25,0.45)",
            display: "inline-block",
          }}
        >
          Plan My Occasion →
        </Link>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.25)" }}>
          Plus-One · Built for Swiggy Builders Club ·{" "}
          <span style={{ color: "#FC8019" }}>Swiggy × AI</span>
        </p>
      </footer>
    </div>
  );
}
