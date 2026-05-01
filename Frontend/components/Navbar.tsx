"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { useState, useRef, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [avatarEmoji, setAvatarEmoji] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Live-listen to Firestore profile so photo/avatar updates instantly
  useEffect(() => {
    if (!user) { setPhotoDataUrl(null); setAvatarEmoji(null); return; }
    const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setPhotoDataUrl(data.photoDataUrl || null);
        setAvatarEmoji(data.avatarEmoji || null);
      }
    });
    return () => unsub();
  }, [user]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const linkClass = (path: string) =>
    pathname === path ? "nav-link active" : "nav-link";

  const initials = (user?.displayName || user?.email || "U").charAt(0).toUpperCase();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="navbar-logo">
          <span className="navbar-logo-dot" />
          Deepfake Detector
        </Link>

        <nav className="navbar-links">
          <Link href="/" className={linkClass("/")}>Home</Link>
          <Link href="/about" className={linkClass("/about")}>About</Link>
          <Link href="/how-it-works" className={linkClass("/how-it-works")}>How It Works</Link>

          {user && (
            <>
              <Link href="/detect" className={linkClass("/detect")}>Detect</Link>
              <Link href="/dashboard" className={linkClass("/dashboard")}>Dashboard</Link>

              {/* Profile avatar */}
              <div ref={dropdownRef} style={{ position: "relative", marginLeft: "0.5rem" }}>
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  title={user.displayName || user.email || "Profile"}
                  style={{
                    width: 36, height: 36, borderRadius: "50%",
                    border: "2px solid rgba(167,139,250,0.5)",
                    background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(34,211,238,0.2))",
                    cursor: "pointer", overflow: "hidden", padding: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "border-color 0.2s",
                  }}
                >
                  {photoDataUrl ? (
                    // Uploaded photo from Firestore
                    <img src={photoDataUrl} alt="Profile"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : avatarEmoji ? (
                    // Chosen emoji avatar
                    <span style={{ fontSize: "1.2rem", lineHeight: 1 }}>{avatarEmoji}</span>
                  ) : (
                    // Fallback: first letter
                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#a78bfa", fontFamily: "Space Grotesk, system-ui" }}>
                      {initials}
                    </span>
                  )}
                </button>

                {dropdownOpen && (
                  <div style={{
                    position: "absolute", top: "calc(100% + 8px)", right: 0,
                    minWidth: 185, borderRadius: 12,
                    background: "rgba(10, 10, 30, 0.97)",
                    border: "1px solid rgba(167,139,250,0.2)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                    backdropFilter: "blur(16px)", zIndex: 100, overflow: "hidden",
                  }}>
                    {/* User info */}
                    <div style={{ padding: "0.85rem 1rem 0.65rem", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      {/* Mini avatar in dropdown */}
                      <div style={{ width: 32, height: 32, borderRadius: "50%", overflow: "hidden", flexShrink: 0, background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(34,211,238,0.2))", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {photoDataUrl
                          ? <img src={photoDataUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : avatarEmoji
                            ? <span style={{ fontSize: "1rem" }}>{avatarEmoji}</span>
                            : <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#a78bfa" }}>{initials}</span>}
                      </div>
                      <div style={{ overflow: "hidden" }}>
                        <p style={{ margin: 0, fontSize: "0.82rem", fontWeight: 600, color: "#e5e7eb", fontFamily: "Space Grotesk, system-ui", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {user.displayName || "No name set"}
                        </p>
                        <p style={{ margin: "0.1rem 0 0", fontSize: "0.72rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <Link href="/profile" onClick={() => setDropdownOpen(false)}
                      style={{ display: "block", padding: "0.65rem 1rem", fontSize: "0.84rem", color: "#d1d5db", textDecoration: "none" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(167,139,250,0.08)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                      👤 My Profile
                    </Link>

                    <button
                      onClick={() => { setDropdownOpen(false); logout(); }}
                      style={{ width: "100%", textAlign: "left", padding: "0.65rem 1rem", fontSize: "0.84rem", color: "#f87171", background: "transparent", border: "none", borderTop: "1px solid rgba(255,255,255,0.06)", cursor: "pointer", fontFamily: "inherit" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(248,113,113,0.06)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {!user && (
            <>
              <Link href="/login" className={linkClass("/login")}>Login</Link>
              <Link href="/signup" className={linkClass("/signup")}>Signup</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}