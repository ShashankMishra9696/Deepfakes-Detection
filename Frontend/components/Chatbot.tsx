"use client";

import { useState, useEffect, useRef } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Timestamp | null;
}

const SUGGESTIONS = [
  "What is a deepfake?",
  "How accurate is detection?",
  "Can videos be deepfakes?",
  "How do I upload an image?",
  "What makes an image fake?",
  "Is my data safe here?",
];

function MessageContent({ content }: { content: string }) {
  const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {lines.map((line, i) => (
        <p key={i} style={{ margin: 0, lineHeight: "1.6", fontSize: "12.5px" }}>
          {line}
        </p>
      ))}
    </div>
  );
}

export default function Chatbot() {
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user || !open) return;
    const q = query(
      collection(db, "chats", user.uid, "messages"),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setMessages(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Message, "id">) }))
      );
    });
    return () => unsub();
  }, [user, open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const handler = () => setShowMenu(false);
    if (showMenu) document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [showMenu]);

  const displayName =
    user?.displayName?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    null;

  const sendMessage = async (text?: string) => {
    const userMessage = (text || input).trim();
    if (!userMessage || loading) return;
    setInput("");
    setLoading(true);

    if (user) {
      await addDoc(collection(db, "chats", user.uid, "messages"), {
        role: "user",
        content: userMessage,
        createdAt: serverTimestamp(),
      });
    } else {
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: "user", content: userMessage, createdAt: null },
      ]);
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: userMessage },
          ],
        }),
      });
      const data = await res.json();
      const reply = data.reply || "Sorry, I couldn't process that.";

      if (user) {
        await addDoc(collection(db, "chats", user.uid, "messages"), {
          role: "assistant",
          content: reply,
          createdAt: serverTimestamp(),
        });
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: reply,
            createdAt: null,
          },
        ]);
      }
    } catch {
      if (!user) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: "Connection error. Please try again.",
            createdAt: null,
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteAllMessages = async () => {
    setDeleting(true);
    setShowConfirm(false);
    setShowMenu(false);
    if (user) {
      const snap = await getDocs(collection(db, "chats", user.uid, "messages"));
      await Promise.all(
        snap.docs.map((d) =>
          deleteDoc(doc(db, "chats", user.uid, "messages", d.id))
        )
      );
    } else {
      setMessages([]);
    }
    setDeleting(false);
  };

  const startNewChat = async () => {
    setShowMenu(false);
    await deleteAllMessages();
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const hasMessages = messages.length > 0;

  return (
    <>
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .chat-msg { animation: fadeInUp 0.2s ease forwards; }
        .suggestion-btn:hover {
          background: rgba(99,102,241,0.15) !important;
          border-color: #6366f1 !important;
          color: #a5b4fc !important;
          transform: translateY(-1px);
        }
        .send-btn:hover:not(:disabled) {
          opacity: 0.85;
          transform: scale(1.05);
        }
        .menu-item:hover { background: #1e1e2e !important; }
        .icon-btn:hover { background: rgba(255,255,255,0.1) !important; }
        .chatbot-input:focus { border-color: #6366f1 !important; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a2a3e; border-radius: 4px; }
      `}</style>

      {/* Floating Button */}
      <div style={{ position: "fixed", bottom: "28px", right: "28px", zIndex: 9999 }}>
        {!open && (
          <div style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            background: "rgba(99,102,241,0.4)",
            animation: "pulse-ring 2s ease-out infinite",
          }} />
        )}
        <button
          onClick={() => { setOpen(!open); setShowMenu(false); }}
          style={{
            position: "relative",
            width: "56px", height: "56px", borderRadius: "50%",
            background: open ? "#16161f" : "linear-gradient(135deg, #6366f1, #4f46e5)",
            border: open ? "2px solid #6366f1" : "none",
            cursor: "pointer",
            boxShadow: "0 4px 20px rgba(99,102,241,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "22px",
            transition: "all 0.25s ease",
          }}
        >
          {open ? "✕" : "🤖"}
        </button>
      </div>

      {/* Chat Window */}
      {open && (
        <div style={{
          position: "fixed",
          bottom: "96px", right: "28px",
          zIndex: 9999,
          width: "340px",
          background: "#0d0d14",
          border: "1px solid #1e1e2e",
          borderRadius: "18px",
          boxShadow: "0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.08)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          fontFamily: "inherit",
          animation: "fadeInUp 0.2s ease",
        }}>

          {/* Header */}
          <div style={{
            background: "linear-gradient(135deg, #6366f1, #4f46e5)",
            padding: "13px 14px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "50%",
              background: "rgba(255,255,255,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "18px", flexShrink: 0,
            }}>🤖</div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: "13px", color: "#fff" }}>
                DeepFake Assistant
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <div style={{
                  width: "6px", height: "6px", borderRadius: "50%",
                  background: "#4ade80", boxShadow: "0 0 5px #4ade80",
                }} />
                <p style={{ margin: 0, fontSize: "10px", color: "rgba(255,255,255,0.7)" }}>
                  Powered by Groq AI · Online
                </p>
              </div>
            </div>

            <div style={{ position: "relative" }}>
              <button
                className="icon-btn"
                onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                style={{
                  background: "transparent", border: "none", cursor: "pointer",
                  color: "#fff", fontSize: "20px", padding: "4px 7px",
                  borderRadius: "6px", lineHeight: 1, transition: "background 0.15s",
                }}
              >⋮</button>

              {showMenu && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: "absolute", top: "34px", right: 0,
                    background: "#16161f", border: "1px solid #2a2a3e",
                    borderRadius: "10px", overflow: "hidden",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                    minWidth: "155px", zIndex: 10,
                  }}>
                  <button
                    className="menu-item"
                    onClick={startNewChat}
                    style={{
                      width: "100%", background: "transparent", border: "none",
                      padding: "10px 14px", color: "#e0e0f0", fontSize: "12.5px",
                      cursor: "pointer", textAlign: "left",
                      display: "flex", alignItems: "center", gap: "8px",
                      transition: "background 0.15s",
                    }}>
                    ✨ New Chat
                  </button>
                  <div style={{ height: "1px", background: "#2a2a3e" }} />
                  <button
                    className="menu-item"
                    onClick={() => { setShowMenu(false); setShowConfirm(true); }}
                    style={{
                      width: "100%", background: "transparent", border: "none",
                      padding: "10px 14px", color: "#f87171", fontSize: "12.5px",
                      cursor: "pointer", textAlign: "left",
                      display: "flex", alignItems: "center", gap: "8px",
                      transition: "background 0.15s",
                    }}>
                    🗑️ Delete Chat
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Confirm Delete */}
          {showConfirm && (
            <div style={{
              background: "#111118", borderBottom: "1px solid #1e1e2e",
              padding: "12px 14px",
            }}>
              <p style={{ margin: "0 0 10px", fontSize: "12px", color: "#e0e0f0" }}>
                Delete all messages? This cannot be undone.
              </p>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={deleteAllMessages}
                  style={{
                    flex: 1, background: "#f87171", border: "none",
                    borderRadius: "8px", padding: "7px", color: "#fff",
                    fontSize: "12px", fontWeight: 700, cursor: "pointer",
                  }}>
                  Delete
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  style={{
                    flex: 1, background: "#1e1e2e", border: "none",
                    borderRadius: "8px", padding: "7px", color: "#a0a0b0",
                    fontSize: "12px", cursor: "pointer",
                  }}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: "auto",
            padding: "14px",
            maxHeight: "340px", minHeight: "220px",
            display: "flex", flexDirection: "column", gap: "10px",
            background: "#0d0d14",
          }}>

            {/* Intro + Suggestions */}
            {!hasMessages && !loading && (
              <div style={{ animation: "fadeInUp 0.3s ease" }}>
                <div style={{
                  background: "#111118", border: "1px solid #1e1e2e",
                  borderRadius: "14px", padding: "13px", marginBottom: "12px",
                }}>
                  <p style={{ margin: "0 0 5px", fontSize: "13px", fontWeight: 700, color: "#f1f1f5" }}>
                    {displayName ? `Hey ${displayName}! 👋` : "Hey there! 👋"}
                  </p>
                  <p style={{ margin: 0, fontSize: "12px", color: "#bbbbd3", lineHeight: 1.55 }}>
                    Ask me anything about deepfake detection, results, or how this app works.
                  </p>
                </div>

                <p style={{
                  margin: "0 0 7px",
                  fontSize: "10px", color: "#ffffff",
                  textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: 600,
                }}>
                  Suggested
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      className="suggestion-btn"
                      onClick={() => sendMessage(s)}
                      style={{
                        background: "#111118", border: "1px solid #1e1e2e",
                        borderRadius: "8px", padding: "8px 11px",
                        color: "#9ea5bd", fontSize: "12px",
                        cursor: "pointer", textAlign: "left",
                        transition: "all 0.15s ease",
                      }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message bubbles */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className="chat-msg"
                style={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                  gap: "7px",
                  alignItems: "flex-end",
                }}
              >
                {msg.role === "assistant" && (
                  <div style={{
                    width: "24px", height: "24px", borderRadius: "50%",
                    background: "rgba(99,102,241,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "12px", flexShrink: 0,
                  }}>🤖</div>
                )}
                <div style={{
                  maxWidth: "78%",
                  padding: "9px 12px",
                  borderRadius: msg.role === "user"
                    ? "14px 14px 3px 14px"
                    : "14px 14px 14px 3px",
                  background: msg.role === "user"
                    ? "linear-gradient(135deg, #6366f1, #4f46e5)"
                    : "#161620",
                  color: "#f1f1f5",
                  border: msg.role === "assistant" ? "1px solid #1e1e2e" : "none",
                  wordBreak: "break-word",
                }}>
                  <MessageContent content={msg.content} />
                </div>
              </div>
            ))}

            {/* Loading */}
            {loading && (
              <div className="chat-msg" style={{ display: "flex", alignItems: "flex-end", gap: "7px" }}>
                <div style={{
                  width: "24px", height: "24px", borderRadius: "50%",
                  background: "rgba(99,102,241,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "12px",
                }}>🤖</div>
                <div style={{
                  background: "#161620", border: "1px solid #1e1e2e",
                  padding: "10px 14px", borderRadius: "14px 14px 14px 3px",
                  display: "flex", gap: "4px", alignItems: "center",
                }}>
                  {[0, 150, 300].map((delay) => (
                    <span key={delay} style={{
                      width: "6px", height: "6px", borderRadius: "50%",
                      background: "#6366f1", display: "inline-block",
                      animation: "bounce 1s infinite",
                      animationDelay: `${delay}ms`,
                    }} />
                  ))}
                </div>
              </div>
            )}

            {deleting && (
              <div style={{ textAlign: "center", fontSize: "11px", color: "#6b6b80" }}>
                Clearing chat...
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: "10px",
            borderTop: "1px solid #1e1e2e",
            background: "#0d0d14",
            display: "flex", gap: "7px", alignItems: "center",
          }}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask about deepfakes..."
              className="chatbot-input"
              style={{
                flex: 1, background: "#111118",
                border: "1px solid #1e1e2e", borderRadius: "10px",
                padding: "9px 12px", color: "#f1f1f5",
                fontSize: "12.5px", outline: "none",
                transition: "border-color 0.2s",
              }}
            />
            <button
              className="send-btn"
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              style={{
                background: loading || !input.trim()
                  ? "#111118"
                  : "linear-gradient(135deg, #e0e1f0, #4f46e5)",
                border: "1px solid #1e1e2e",
                borderRadius: "10px",
                width: "36px", height: "36px",
                color: loading || !input.trim() ? "#3a3a4e" : "#fff",
                fontSize: "15px", cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
              ➤
            </button>
          </div>

          {!user && (
            <p style={{
              textAlign: "center", fontSize: "10px",
              color: "#3a3a4e", padding: "0 0 8px", margin: 0,
            }}>
              Login to save chat history
            </p>
          )}
        </div>
      )}
    </>
  );
}