"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import RequireAuth from "@/components/RequireAuth";
import { useEffect, useState } from "react";

interface HistoryRecord {
  prediction: string;
  confidence: number;
  timestamp: string;
  filename: string;
  faces_detected?: number;
}

export default function HistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "fake" | "real">("all");

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.uid) return;

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/history/${user.uid}`
        );

        if (response.ok) {
          const data = await response.json();
          setHistory(data.history || []);
        }
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  const filteredHistory = history.filter((record) => {
    if (filter === "all") return true;
    return record.prediction.toLowerCase() === filter;
  });

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <RequireAuth>
      <div className="container section">
        {/* Header */}
        <div className="animate-fade-up-1" style={{ marginBottom: "2.5rem" }}>
          <span className="section-tag">Activity</span>
          <h1 style={{ marginTop: "0.75rem", marginBottom: "0.5rem" }}>
            Detection History
          </h1>
          <p style={{ color: "var(--text-muted)" }}>
            A record of all your past deepfake detection results.
          </p>
        </div>

        {/* Filters */}
        <div
          className="animate-fade-up-2"
          style={{
            display: "flex",
            gap: "0.75rem",
            marginBottom: "1.5rem",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {(["all", "fake", "real"] as const).map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              style={{
                padding: "0.4rem 1rem",
                borderRadius: "999px",
                border: `1px solid ${
                  filter === filterOption ? "rgba(167,139,250,0.4)" : "var(--border)"
                }`,
                background: filter === filterOption ? "rgba(167,139,250,0.1)" : "transparent",
                color: filter === filterOption ? "#a78bfa" : "var(--text-muted)",
                fontSize: "0.85rem",
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "Inter, system-ui",
                transition: "all 0.2s",
                textTransform: "capitalize",
              }}
            >
              {filterOption}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="card animate-fade-up-3" style={{ textAlign: "center", padding: "3rem" }}>
            <span className="spinner" style={{ width: 32, height: 32 }} />
            <p style={{ marginTop: "1rem", color: "var(--text-muted)" }}>Loading history...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && history.length === 0 && (
          <div
            className="card animate-fade-up-3"
            style={{ textAlign: "center", padding: "4rem 2rem" }}
          >
            <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>🕒</div>
            <h3 style={{ marginBottom: "0.5rem" }}>No history yet</h3>
            <p
              style={{
                color: "var(--text-muted)",
                maxWidth: 380,
                margin: "0 auto 2rem",
                fontSize: "0.92rem",
              }}
            >
              Detection history will appear here once you start analyzing images.
              Each result is logged with date, file name, and confidence score.
            </p>
            <Link href="/detect" className="btn-primary">
              ⚡ Analyze Your First Image
            </Link>
          </div>
        )}

        {/* History List */}
        {!loading && filteredHistory.length > 0 && (
          <div className="animate-fade-up-3" style={{ display: "grid", gap: "1rem" }}>
            {filteredHistory.map((record, index) => {
              const isFake = record.prediction.toLowerCase() === "fake";
              const isNoFace = record.prediction.toLowerCase().includes("no face");

              return (
                <div
                  key={index}
                  className="card"
                  style={{
                    padding: "1.25rem 1.5rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "1rem",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div
                      style={{
                        fontSize: "1.5rem",
                        width: 44,
                        height: 44,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "12px",
                        background: isNoFace
                          ? "rgba(251,146,60,0.1)"
                          : isFake
                          ? "rgba(239,68,68,0.1)"
                          : "rgba(52,211,153,0.1)",
                        border: `1px solid ${
                          isNoFace
                            ? "rgba(251,146,60,0.2)"
                            : isFake
                            ? "rgba(239,68,68,0.2)"
                            : "rgba(52,211,153,0.2)"
                        }`,
                      }}
                    >
                      {isNoFace ? "⚠️" : isFake ? "🚨" : "✅"}
                    </div>
                    <div>
                      <p
                        style={{
                          margin: "0 0 0.25rem",
                          fontWeight: 600,
                          fontSize: "0.95rem",
                          color: isNoFace ? "#fb923c" : isFake ? "#f87171" : "#34d399",
                        }}
                      >
                        {record.prediction}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.82rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        📎 {record.filename}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                    <div style={{ textAlign: "right" }}>
                      <p
                        style={{
                          margin: "0 0 0.25rem",
                          fontSize: "0.78rem",
                          color: "var(--text-muted)",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        Confidence
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "1.1rem",
                          fontWeight: 700,
                          fontFamily: "Space Grotesk, system-ui",
                          color: isNoFace ? "#fb923c" : isFake ? "#f87171" : "#34d399",
                        }}
                      >
                        {record.confidence}%
                      </p>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <p
                        style={{
                          margin: "0 0 0.25rem",
                          fontSize: "0.78rem",
                          color: "var(--text-muted)",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        Date
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.88rem",
                          color: "#e5e7eb",
                        }}
                      >
                        {formatDate(record.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* No Results for Filter */}
        {!loading && history.length > 0 && filteredHistory.length === 0 && (
          <div
            className="card animate-fade-up-3"
            style={{ textAlign: "center", padding: "3rem 2rem" }}
          >
            <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🔍</div>
            <h3 style={{ marginBottom: "0.35rem" }}>No {filter} detections found</h3>
            <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "0.9rem" }}>
              Try selecting a different filter or analyze more images.
            </p>
          </div>
        )}
      </div>
    </RequireAuth>
  );
}