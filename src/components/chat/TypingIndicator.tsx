"use client";

export function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div
        className="px-4 py-3 flex items-center gap-1"
        style={{
          background: "#F5F5F5",
          borderRadius: "16px 16px 16px 4px",
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full"
            style={{
              background: "#FC8019",
              animation: `bounce 1.2s ${i * 0.2}s infinite`,
              display: "inline-block",
            }}
          />
        ))}
        <style>{`
          @keyframes bounce {
            0%, 100% { transform: translateY(0); opacity: 0.4; }
            50% { transform: translateY(-4px); opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
}
