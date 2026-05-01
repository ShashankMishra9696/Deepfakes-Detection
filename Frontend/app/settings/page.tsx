"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(false);

  return (
    <div className="container section">
      {/* Header */}
      <div className="animate-fade-up-1" style={{ marginBottom: "2.5rem" }}>
        <span className="section-tag">Preferences</span>
        <h1 style={{ marginTop: "0.75rem", marginBottom: "0.5rem" }}>
          Settings
        </h1>
        <p style={{ color: "var(--text-muted)" }}>
          Manage your account preferences and application settings.
        </p>
      </div>

      <div style={{ maxWidth: 580 }}>
        {/* Appearance */}
        <div className="card animate-fade-up-2" style={{ marginBottom: "1.25rem" }}>
          <h3 style={{ marginBottom: "1.25rem", color: "#e5e7eb" }}>🎨 Appearance</h3>

          <div className="profile-field">
            <div>
              <span className="profile-field-label">Theme</span>
              <p style={{ margin: "0.2rem 0 0", fontSize: "0.9rem", color: "#e5e7eb" }}>
                Dark Mode
              </p>
            </div>
            <span
              style={{
                padding: "0.3rem 0.8rem",
                borderRadius: "999px",
                background: "rgba(167,139,250,0.1)",
                border: "1px solid rgba(167,139,250,0.25)",
                color: "#a78bfa",
                fontSize: "0.78rem",
                fontWeight: 600,
              }}
            >
              Active
            </span>
          </div>

          <div className="profile-field" style={{ border: "none", paddingBottom: 0 }}>
            <div>
              <span className="profile-field-label">Language</span>
              <p style={{ margin: "0.2rem 0 0", fontSize: "0.9rem", color: "#e5e7eb" }}>
                English (US)
              </p>
            </div>
            <span
              style={{
                padding: "0.3rem 0.8rem",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
                fontSize: "0.78rem",
              }}
            >
              Default
            </span>
          </div>
        </div>

        {/* Notifications */}
        <div className="card animate-fade-up-3" style={{ marginBottom: "1.25rem" }}>
          <h3 style={{ marginBottom: "1.25rem", color: "#e5e7eb" }}>🔔 Notifications</h3>

          <div className="profile-field" style={{ border: "none", paddingBottom: 0 }}>
            <div>
              <span className="profile-field-label">Email Notifications</span>
              <p style={{ margin: "0.2rem 0 0", fontSize: "0.88rem", color: "var(--text-muted)" }}>
                Receive results and alerts by email
              </p>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              style={{
                width: 44,
                height: 24,
                borderRadius: "999px",
                border: "none",
                background: notifications
                  ? "linear-gradient(135deg, #7c3aed, #6366f1)"
                  : "rgba(255,255,255,0.08)",
                cursor: "pointer",
                position: "relative",
                transition: "background 0.2s",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: 3,
                  left: notifications ? "calc(100% - 21px)" : 3,
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "white",
                  transition: "left 0.2s",
                  display: "block",
                }}
              />
            </button>
          </div>
        </div>

        {/* Privacy */}
        <div className="card animate-fade-up-4" style={{ marginBottom: "1.25rem" }}>
          <h3 style={{ marginBottom: "1.25rem", color: "#e5e7eb" }}>🔒 Privacy</h3>

          <div className="profile-field">
            <div>
              <span className="profile-field-label">Image Storage</span>
              <p style={{ margin: "0.2rem 0 0", fontSize: "0.9rem", color: "#e5e7eb" }}>
                Never stored
              </p>
            </div>
            <span
              style={{
                padding: "0.3rem 0.8rem",
                borderRadius: "999px",
                background: "rgba(52,211,153,0.1)",
                border: "1px solid rgba(52,211,153,0.25)",
                color: "#34d399",
                fontSize: "0.78rem",
                fontWeight: 600,
              }}
            >
              🛡️ Secure
            </span>
          </div>

          <div className="profile-field" style={{ border: "none", paddingBottom: 0 }}>
            <div>
              <span className="profile-field-label">Detection Logging</span>
              <p style={{ margin: "0.2rem 0 0", fontSize: "0.88rem", color: "var(--text-muted)" }}>
                Results are stored locally in your account only
              </p>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div
          className="card animate-fade-up-4"
          style={{
            border: "1px solid rgba(248,113,113,0.2)",
            background: "rgba(239,68,68,0.04)",
          }}
        >
          <h3 style={{ marginBottom: "1rem", color: "#f87171" }}>⚠️ Danger Zone</h3>
          <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>
            These actions are irreversible. Please be certain before proceeding.
          </p>
          <button
            style={{
              padding: "0.65rem 1.25rem",
              borderRadius: "10px",
              border: "1px solid rgba(248,113,113,0.3)",
              background: "rgba(239,68,68,0.08)",
              color: "#f87171",
              cursor: "pointer",
              fontSize: "0.88rem",
              fontWeight: 500,
              fontFamily: "DM Sans, system-ui",
              transition: "all 0.2s",
            }}
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
