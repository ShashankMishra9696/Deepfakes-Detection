"use client";

import { useAuth } from "@/lib/auth";
import RequireAuth from "@/components/RequireAuth";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total_checks: 0,
    fake_count: 0,
    real_count: 0,
    no_face_count: 0,
    avg_confidence: 0,
  });
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const displayName = user?.email?.split("@")[0] || "User";
  const capitalizedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.uid) return;
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/stats/${user.uid}`
        );
        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  const statCards = [
    {
      id: "total",
      label: "Total Checks",
      value: loading ? "..." : stats.total_checks,
      icon: "📊",
      color: "#6366f1",
      bg: "rgba(99,102,241,0.08)",
      border: "rgba(99,102,241,0.25)",
      glow: "rgba(99,102,241,0.15)",
    },
    {
      id: "fakes",
      label: "Fakes Detected",
      value: loading ? "..." : stats.fake_count,
      icon: "🚨",
      color: "#f87171",
      bg: "rgba(248,113,113,0.08)",
      border: "rgba(248,113,113,0.25)",
      glow: "rgba(248,113,113,0.15)",
    },
    {
      id: "real",
      label: "Real Images",
      value: loading ? "..." : stats.real_count,
      icon: "✅",
      color: "#34d399",
      bg: "rgba(52,211,153,0.08)",
      border: "rgba(52,211,153,0.25)",
      glow: "rgba(52,211,153,0.15)",
    },
    {
      id: "confidence",
      label: "Avg. Confidence",
      value: loading ? "..." : stats.avg_confidence > 0 ? `${stats.avg_confidence}%` : "—",
      icon: "⚡",
      color: "#38bdf8",
      bg: "rgba(56,189,248,0.08)",
      border: "rgba(56,189,248,0.25)",
      glow: "rgba(56,189,248,0.15)",
    },
  ];

  const actionCards = [
    {
      id: "detect",
      href: "/detect",
      icon: "🖼️",
      iconBg: "rgba(99,102,241,0.15)",
      iconColor: "#a5b4fc",
      title: "Analyze New Image",
      desc: "Upload and analyze a new image for deepfake detection.",
      border: "rgba(99,102,241,0.3)",
      hoverBorder: "#6366f1",
    },
    {
      id: "history",
      href: "/history",
      icon: "🕒",
      iconBg: "rgba(56,189,248,0.15)",
      iconColor: "#7dd3fc",
      title: "View History",
      desc: "Review your past detection results and trends.",
      border: "rgba(56,189,248,0.2)",
      hoverBorder: "#38bdf8",
    },
    {
      id: "profile",
      href: "/profile",
      icon: "👤",
      iconBg: "rgba(52,211,153,0.15)",
      iconColor: "#6ee7b7",
      title: "Edit Profile",
      desc: "Update your display name and profile photo.",
      border: "rgba(52,211,153,0.2)",
      hoverBorder: "#34d399",
    },
  ];

  return (
    <RequireAuth>
      <div style={{ minHeight: "100vh", background: "#0a0a0f", padding: "2.5rem 1.5rem" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

          {/* Header */}
          <div style={{ marginBottom: "3rem" }}>
            <p style={{
              margin: "0 0 0.4rem",
              fontSize: "0.75rem",
              color: "#6b6b80",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              fontWeight: 600,
            }}>
              Welcome back
            </p>
            <h1 style={{
              margin: "0 0 0.5rem",
              fontSize: "clamp(2rem, 5vw, 2.8rem)",
              fontWeight: 800,
              color: "#f1f1f5",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}>
              {capitalizedName} <span style={{ fontSize: "2rem" }}>👋</span>
            </h1>
            <p style={{ color: "#6b6b80", margin: 0, fontSize: "0.95rem" }}>
              Here&apos;s a summary of your deepfake detection activity.
            </p>
          </div>

          {/* Stat Cards */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1.25rem",
            marginBottom: "2.5rem",
          }}>
            {statCards.map((card) => (
              <div
                key={card.id}
                onMouseEnter={() => setHoveredCard(card.id)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  background: hoveredCard === card.id ? card.bg : "#111118",
                  border: `1px solid ${hoveredCard === card.id ? card.border : "#1e1e2e"}`,
                  borderRadius: "14px",
                  padding: "1.5rem",
                  position: "relative",
                  overflow: "hidden",
                  transition: "all 0.25s ease",
                  transform: hoveredCard === card.id ? "translateY(-4px)" : "translateY(0)",
                  boxShadow: hoveredCard === card.id
                    ? `0 12px 32px ${card.glow}`
                    : "0 2px 8px rgba(0,0,0,0.3)",
                  cursor: "default",
                }}
              >
                {/* Background glow orb */}
                <div style={{
                  position: "absolute",
                  top: "-20px",
                  right: "-20px",
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  background: card.bg,
                  filter: "blur(20px)",
                  opacity: hoveredCard === card.id ? 1 : 0.5,
                  transition: "opacity 0.25s",
                }} />

                <div style={{ fontSize: "1.6rem", marginBottom: "0.75rem" }}>{card.icon}</div>
                <div style={{
                  fontSize: "clamp(1.8rem, 4vw, 2.4rem)",
                  fontWeight: 800,
                  color: card.color,
                  lineHeight: 1,
                  marginBottom: "0.4rem",
                  fontVariantNumeric: "tabular-nums",
                }}>
                  {card.value}
                </div>
                <div style={{
                  fontSize: "0.78rem",
                  color: "#6b6b80",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontWeight: 600,
                }}>
                  {card.label}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div style={{ marginBottom: "2.5rem" }}>
            <h2 style={{
              fontSize: "1.1rem",
              fontWeight: 700,
              color: "#f1f1f5",
              marginBottom: "1.25rem",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}>
              Quick Actions
            </h2>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "1.25rem",
            }}>
              {actionCards.map((card) => (
                <Link key={card.id} href={card.href} style={{ textDecoration: "none" }}>
                  <div
                    onMouseEnter={() => setHoveredCard(`action-${card.id}`)}
                    onMouseLeave={() => setHoveredCard(null)}
                    style={{
                      background: "#111118",
                      border: `1px solid ${hoveredCard === `action-${card.id}` ? card.hoverBorder : "#1e1e2e"}`,
                      borderRadius: "14px",
                      padding: "1.5rem",
                      cursor: "pointer",
                      transition: "all 0.25s ease",
                      transform: hoveredCard === `action-${card.id}` ? "translateY(-4px)" : "translateY(0)",
                      boxShadow: hoveredCard === `action-${card.id}`
                        ? `0 12px 32px rgba(0,0,0,0.4)`
                        : "0 2px 8px rgba(0,0,0,0.3)",
                      height: "100%",
                    }}
                  >
                    <div style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "10px",
                      background: card.iconBg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.3rem",
                      marginBottom: "1rem",
                      transition: "transform 0.2s",
                      transform: hoveredCard === `action-${card.id}` ? "scale(1.1)" : "scale(1)",
                    }}>
                      {card.icon}
                    </div>
                    <h3 style={{
                      margin: "0 0 0.4rem",
                      fontSize: "1rem",
                      fontWeight: 700,
                      color: "#f1f1f5",
                    }}>
                      {card.title}
                    </h3>
                    <p style={{
                      margin: 0,
                      fontSize: "0.85rem",
                      color: "#6b6b80",
                      lineHeight: 1.5,
                    }}>
                      {card.desc}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Activity Summary */}
          {stats.total_checks === 0 ? (
            <div style={{
              background: "#111118",
              border: "1px solid #1e1e2e",
              borderRadius: "14px",
              padding: "3rem",
              textAlign: "center",
            }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔍</div>
              <h3 style={{ margin: "0 0 0.5rem", color: "#f1f1f5", fontSize: "1.2rem" }}>
                No detections yet
              </h3>
              <p style={{ color: "#6b6b80", maxWidth: "360px", margin: "0 auto 1.5rem", fontSize: "0.9rem" }}>
                Your detection history will appear here after you analyze your first image.
              </p>
              <Link href="/detect" style={{
                display: "inline-block",
                background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                color: "#fff",
                padding: "0.75rem 1.75rem",
                borderRadius: "10px",
                fontWeight: 700,
                fontSize: "0.9rem",
                textDecoration: "none",
                transition: "opacity 0.2s",
              }}>
                ⚡ Start First Detection
              </Link>
            </div>
          ) : (
            <div style={{
              background: "#111118",
              border: "1px solid #1e1e2e",
              borderRadius: "14px",
              padding: "1.75rem 2rem",
            }}>
              <h3 style={{
                margin: "0 0 1.25rem",
                fontSize: "1rem",
                fontWeight: 700,
                color: "#f1f1f5",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}>
                Activity Summary
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.85rem 1rem",
                  background: "#0a0a0f",
                  borderRadius: "10px",
                  border: "1px solid #1e1e2e",
                }}>
                  <span style={{ color: "#a0a0b0", fontSize: "0.9rem" }}>Detection Accuracy</span>
                  <span style={{ fontWeight: 700, color: "#34d399", fontSize: "0.95rem" }}>
                    {stats.avg_confidence}% avg
                  </span>
                </div>

                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.85rem 1rem",
                  background: "#0a0a0f",
                  borderRadius: "10px",
                  border: "1px solid #1e1e2e",
                }}>
                  <span style={{ color: "#a0a0b0", fontSize: "0.9rem" }}>Fakes Found</span>
                  <span style={{ fontWeight: 700, color: "#f87171", fontSize: "0.95rem" }}>
                    {stats.fake_count}
                  </span>
                </div>

                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.85rem 1rem",
                  background: "#0a0a0f",
                  borderRadius: "10px",
                  border: "1px solid #1e1e2e",
                }}>
                  <span style={{ color: "#a0a0b0", fontSize: "0.9rem" }}>Real Images Verified</span>
                  <span style={{ fontWeight: 700, color: "#34d399", fontSize: "0.95rem" }}>
                    {stats.real_count}
                  </span>
                </div>

                {stats.no_face_count > 0 && (
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.85rem 1rem",
                    background: "#0a0a0f",
                    borderRadius: "10px",
                    border: "1px solid #1e1e2e",
                  }}>
                    <span style={{ color: "#a0a0b0", fontSize: "0.9rem" }}>No Face Detected</span>
                    <span style={{ fontWeight: 700, color: "#fb923c", fontSize: "0.95rem" }}>
                      {stats.no_face_count}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </RequireAuth>
  );
}