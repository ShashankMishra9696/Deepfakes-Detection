"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/detect");
    } catch (err: any) {
      setError("Invalid credentials. Please check your email and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 80px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1.5rem",
      }}
    >
      <div className="page-container animate-fade-up" style={{ margin: 0, width: "100%" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "14px",
              background: "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(99,102,241,0.15))",
              border: "1px solid rgba(167,139,250,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
              margin: "0 auto 1.25rem",
            }}
          >
            🔑
          </div>
          <h1 className="page-title" style={{ margin: 0, fontSize: "1.75rem" }}>
            Welcome back
          </h1>
          <p className="page-subtitle" style={{ marginTop: "0.4rem" }}>
            Sign in to your account to continue
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <div style={{ textAlign: "right", marginTop: "-0.5rem", marginBottom: "1.25rem" }}>
            <Link
              href="/forget-password"
              style={{ fontSize: "0.82rem", color: "var(--purple-light)", textDecoration: "none" }}
            >
              Forgot password?
            </Link>
          </div>

          {error && <p className="error-text">{error}</p>}

          <div className="form-submit">
            <button
              type="submit"
              className="btn-primary btn-full"
              disabled={loading}
              style={{ fontSize: "0.95rem", padding: "0.85rem" }}
            >
              {loading ? (
                <>
                  <span className="spinner" /> Signing in...
                </>
              ) : (
                "Sign In →"
              )}
            </button>
          </div>
        </form>

        <p className="form-link">
          Don&apos;t have an account?{" "}
          <Link href="/signup">Create one free</Link>
        </p>
      </div>
    </div>
  );
}