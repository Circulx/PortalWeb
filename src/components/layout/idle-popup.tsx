"use client"
import { useState, useEffect } from "react"
"use client"
import { useState, useEffect } from "react"

export default function IdlePopup() {
  const [isIdle, setIsIdle] = useState(false)
  const idleTime = 5000 // 5 seconds
  const [isIdle, setIsIdle] = useState(false)
  const idleTime = 5000 // 5 seconds

  useEffect(() => {
    // Only set the initial timer to show popup after idle time
    const timeout = setTimeout(() => {
      setIsIdle(true)
    }, idleTime)

    // Only listen for Escape key to close popup
    // Only set the initial timer to show popup after idle time
    const timeout = setTimeout(() => {
      setIsIdle(true)
    }, idleTime)

    // Only listen for Escape key to close popup
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsIdle(false)
    }
    window.addEventListener("keydown", onKeyDown)
      if (e.key === "Escape") setIsIdle(false)
    }
    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
      clearTimeout(timeout)
    }
  }, [])
      window.removeEventListener("keydown", onKeyDown)
      clearTimeout(timeout)
    }
  }, [])

  if (!isIdle) return null
  if (!isIdle) return null

  // Theme
  const ORANGE = "#FF6A00" // primary accent
  const BLACK = "#111111"
  const WHITE = "#FFFFFF"
  const OVERLAY_BG = "rgba(0,0,0,0.55)"
  const ORANGE = "#FF6A00" // primary accent
  const BLACK = "#111111"
  const WHITE = "#FFFFFF"
  const OVERLAY_BG = "rgba(0,0,0,0.55)"

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Idle notice"
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
          position: "relative", // Added relative positioning for close button
          position: "relative", // Added relative positioning for close button
        }}
      >
        <button
          onClick={() => setIsIdle(false)}
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            zIndex: 10,
            width: "32px",
            height: "32px",
            background: "rgba(0,0,0,0.5)",
            borderRadius: "50%",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(0,0,0,0.7)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(0,0,0,0.5)"
          }}
          aria-label="Close popup"
        >
          <div style={{ position: "relative", width: "16px", height: "16px" }}>
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "12px",
                height: "2px",
                background: WHITE,
                transform: "translate(-50%, -50%) rotate(45deg)",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "12px",
                height: "2px",
                background: WHITE,
                transform: "translate(-50%, -50%) rotate(-45deg)",
              }}
            />
          </div>
        </button>

        <button
          onClick={() => setIsIdle(false)}
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            zIndex: 10,
            width: "32px",
            height: "32px",
            background: "rgba(0,0,0,0.5)",
            borderRadius: "50%",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(0,0,0,0.7)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(0,0,0,0.5)"
          }}
          aria-label="Close popup"
        >
          <div style={{ position: "relative", width: "16px", height: "16px" }}>
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "12px",
                height: "2px",
                background: WHITE,
                transform: "translate(-50%, -50%) rotate(45deg)",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "12px",
                height: "2px",
                background: WHITE,
                transform: "translate(-50%, -50%) rotate(-45deg)",
              }}
            />
          </div>
        </button>

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
            Don't miss out on exclusive offers for our B2B partners!
            Don't miss out on exclusive offers for our B2B partners!
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
              margin: "0 0 18px 0",
              margin: "0 0 18px 0",
              color: "#333",
              fontSize: 14.5,
              lineHeight: 1.6,
            }}
          >
            Explore products with the lowest rates from across our range of products across all categories and across
            all brands
            Explore products with the lowest rates from across our range of products across all categories and across
            all brands
          </p>

          <a
            href="www.ind2b.com" // Replace with your actual URL
            target="_blank"
            rel="noopener noreferrer"
          <a
            href="https://www.ind2b.com/seller" // Replace with your actual URL
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              width: "100%",
              aspectRatio: "4/3",
              borderRadius: "8px",
              overflow: "hidden",
              marginBottom: "16px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              cursor: "pointer",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.02)"
              e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.15)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)"
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)"
            }}
          >
            <img
              src="/sell.jpg"
              alt="B2B Partnership Advertisement"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </a>
              display: "block",
              width: "100%",
              aspectRatio: "4/3",
              borderRadius: "8px",
              overflow: "hidden",
              marginBottom: "16px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              cursor: "pointer",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.02)"
              e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.15)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)"
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)"
            }}
          >
            <img
              src="/sell.jpg"
              alt="B2B Partnership Advertisement"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </a>
        </div>
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
  )
  )
}
