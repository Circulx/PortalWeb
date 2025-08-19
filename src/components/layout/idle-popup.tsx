"use client";
import { useState, useEffect, useCallback } from "react";

export default function IdlePopup() {
  const [isIdle, setIsIdle] = useState(false);
  const idleTime = 10000; // 10 seconds

  const resetTimer = useCallback(() => {
    setIsIdle(false);
    clearTimeout((window as any).idleTimeout);
    (window as any).idleTimeout = setTimeout(() => {
      setIsIdle(true);
    }, idleTime);
  }, []);

  useEffect(() => {
    const events = ["mousemove", "keydown", "scroll", "touchstart"];
    events.forEach((event) => {
      window.addEventListener(event, resetTimer, { passive: true });
    });
    resetTimer();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsIdle(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
      window.removeEventListener("keydown", onKeyDown);
      clearTimeout((window as any).idleTimeout);
    };
  }, [resetTimer]);

  if (!isIdle) return null;

  // Theme
  const ORANGE = "#FF6A00"; // primary accent
  const BLACK = "#111111";
  const WHITE = "#FFFFFF";
  const OVERLAY_BG = "rgba(0,0,0,0.55)";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Idle notice"
      onClick={() => setIsIdle(false)}
      style={{
        position: "fixed",
        inset: 0,
        background: OVERLAY_BG,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "16px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 560,
          borderRadius: 14,
          overflow: "hidden",
          boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
          background: WHITE,
          color: BLACK,
          transform: "translateY(8px)",
          animation: "slideUp 240ms ease-out forwards",
        }}
      >
        {/* Header accent bar */}
        <div
          style={{
            height: 6,
            background: ORANGE,
          }}
        />

        {/* Content */}
        <div
          style={{
            padding: "20px 22px 18px 22px",
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 10px",
              borderRadius: 999,
              background: "#FFF5EE",
              color: ORANGE,
              fontWeight: 600,
              fontSize: 12,
              letterSpacing: 0.3,
              textTransform: "uppercase",
              border: `1px solid ${ORANGE}1A`,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: ORANGE,
                boxShadow: `0 0 0 3px ${ORANGE}26`,
              }}
            />
            Exclusive
          </div>

          {/* Title */}
          <h2
            style={{
              margin: "14px 0 8px 0",
              fontSize: 22,
              lineHeight: 1.2,
              letterSpacing: -0.2,
              fontWeight: 800,
              color: BLACK,
            }}
          >
            Don’t miss out on exclusive offers for our B2B partners!
          </h2>

          {/* Subtext */}
          <p
            style={{
              margin: "0 0 14px 0",
              color: "#333",
              fontSize: 14.5,
              lineHeight: 1.6,
            }}
          >
            Unlock partner-only pricing, priority support, and tailored solutions designed to scale with your business.
          </p>

          {/* Added text (kept) */}
          <p
            style={{
              margin: "0 0 14px 0",
              color: "#333",
              fontSize: 14.5,
              lineHeight: 1.6,
            }}
          >
            Explore products with the lowest rates from across our range of products across all categories and across all brands
          </p>

          {/* Divider (optional to keep a clean end of content) */}
          {/* You can remove this if you want tighter end spacing */}
          {/* <div
            style={{
              height: 1,
              background: "#EEE",
              margin: "10px 0 0 0",
            }}
          /> */}
        </div>

        {/* Removed: Footnote + dismiss hint row */}
        {/* Removed: Bottom black band */}
      </div>

      <style jsx global>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
