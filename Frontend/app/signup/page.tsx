"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { resizeImageToDataUrl } from "@/lib/resizeImage";
import Link from "next/link";

// Avatar options for users who don't want to upload a photo
const AVATARS = ["🧑", "👩", "🧔", "👩‍💻", "🧑‍💻", "🦸", "🦸‍♀️", "🧙", "🧙‍♀️", "🐱", "🐶", "🦊", "🐼", "🐨", "🦁", "🐸", "🤖", "👾", "🎭", "🌟"];

type PhotoMode = "none" | "upload" | "avatar";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName]         = useState("");
  const [phone, setPhone]       = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  // Photo state
  const [photoMode, setPhotoMode]         = useState<PhotoMode>("none");
  const [avatarFile, setAvatarFile]       = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }

    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);

      // Compress uploaded photo if any
      let photoDataUrl: string | null = null;
      if (photoMode === "upload" && avatarFile) {
        photoDataUrl = await resizeImageToDataUrl(avatarFile, 200, 0.7);
      }

      // Update Firebase Auth displayName only
      await updateProfile(user, { displayName: name.trim() || null });

      // Save everything to Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: name.trim() || "",
        email: email.trim(),
        phone: phone.trim() || "",
        photoDataUrl: photoDataUrl || "",
        avatarEmoji: photoMode === "avatar" ? (selectedEmoji || "") : "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      router.push("/detect");
    } catch (err: any) {
      setError(err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "calc(100vh - 80px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1.5rem" }}>
      <div className="page-container animate-fade-up" style={{ margin: 0, width: "100%" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ width: 52, height: 52, borderRadius: "14px", background: "linear-gradient(135deg, rgba(34,211,238,0.15), rgba(99,102,241,0.12))", border: "1px solid rgba(34,211,238,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", margin: "0 auto 1.25rem" }}>✨</div>
          <h1 className="page-title" style={{ margin: 0, fontSize: "1.75rem" }}>Create an account</h1>
          <p className="page-subtitle" style={{ marginTop: "0.4rem" }}>Free forever. No credit card required.</p>
        </div>

        {/* Photo section */}
        <div style={{ marginBottom: "1.75rem" }}>
          <p style={{ textAlign: "center", fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "0.85rem" }}>
            Choose a profile picture
          </p>

          {/* Mode toggle */}
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginBottom: "1rem" }}>
            {(["none", "upload", "avatar"] as PhotoMode[]).map((mode) => (
              <button key={mode} type="button"
                onClick={() => { setPhotoMode(mode); }}
                style={{
                  padding: "0.35rem 0.85rem", borderRadius: "20px", fontSize: "0.78rem",
                  cursor: "pointer", fontFamily: "inherit", fontWeight: 500,
                  border: photoMode === mode ? "1px solid rgba(167,139,250,0.6)" : "1px solid rgba(255,255,255,0.1)",
                  background: photoMode === mode ? "rgba(167,139,250,0.15)" : "transparent",
                  color: photoMode === mode ? "#a78bfa" : "var(--text-muted)",
                  transition: "all 0.2s",
                }}>
                {mode === "none" ? "Skip" : mode === "upload" ? "📷 Upload Photo" : "😀 Pick Avatar"}
              </button>
            ))}
          </div>

          {/* Upload photo */}
          {photoMode === "upload" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div onClick={() => fileRef.current?.click()}
                style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg, rgba(124,58,237,0.25), rgba(34,211,238,0.15))", border: "2px dashed rgba(167,139,250,0.45)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden" }}>
                {avatarPreview
                  ? <img src={avatarPreview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <span style={{ fontSize: "2rem" }}>📷</span>}
              </div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                {avatarPreview ? "Tap to change" : "Tap to upload"}
              </span>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />
            </div>
          )}

          {/* Emoji avatar grid */}
          {photoMode === "avatar" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.5rem", maxWidth: 260, margin: "0 auto" }}>
                {AVATARS.map((emoji) => (
                  <button key={emoji} type="button"
                    onClick={() => setSelectedEmoji(emoji)}
                    style={{
                      width: 44, height: 44, borderRadius: "50%", fontSize: "1.5rem",
                      cursor: "pointer", border: selectedEmoji === emoji
                        ? "2px solid #a78bfa" : "2px solid rgba(255,255,255,0.08)",
                      background: selectedEmoji === emoji
                        ? "rgba(167,139,250,0.15)" : "rgba(255,255,255,0.04)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.15s",
                    }}>
                    {emoji}
                  </button>
                ))}
              </div>
              {selectedEmoji && (
                <p style={{ textAlign: "center", marginTop: "0.6rem", fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  Selected: <span style={{ fontSize: "1.2rem" }}>{selectedEmoji}</span>
                </p>
              )}
            </div>
          )}
        </div>

        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" placeholder="John Doe" value={name}
              onChange={(e) => setName(e.target.value)} autoComplete="name" />
          </div>

          <div className="form-group">
            <label>Phone Number <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>(optional)</span></label>
            <input type="tel" placeholder="+91 98765 43210" value={phone}
              onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input type="email" placeholder="you@example.com" value={email}
              onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="Minimum 6 characters" value={password}
              onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" minLength={6} />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" placeholder="Re-enter your password" value={confirm}
              onChange={(e) => setConfirm(e.target.value)} required autoComplete="new-password" />
          </div>

          {error && <p className="error-text">{error}</p>}

          <div className="form-submit">
            <button type="submit" className="btn-primary btn-full" disabled={loading}
              style={{ fontSize: "0.95rem", padding: "0.85rem" }}>
              {loading ? <><span className="spinner" /> Creating account...</> : "Create Account →"}
            </button>
          </div>
        </form>

        <p style={{ textAlign: "center", fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "1.25rem", lineHeight: 1.5 }}>
          By creating an account you agree to our{" "}
          <span style={{ color: "var(--purple-light)" }}>Terms of Service</span> and{" "}
          <span style={{ color: "var(--purple-light)" }}>Privacy Policy</span>.
        </p>

        <p className="form-link">Already have an account? <Link href="/login">Sign in</Link></p>
      </div>
    </div>
  );
}