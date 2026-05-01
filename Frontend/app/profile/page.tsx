"use client";

import { useEffect, useState, useRef } from "react";
import RequireAuth from "@/components/RequireAuth";
import { auth, db } from "@/lib/firebase";
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/lib/AuthContext";
import { resizeImageToDataUrl } from "@/lib/resizeImage";

const AVATARS = ["🧑", "👩", "🧔", "👩‍💻", "🧑‍💻", "🦸", "🦸‍♀️", "🧙", "🧙‍♀️", "🐱", "🐶", "🦊", "🐼", "🐨", "🦁", "🐸", "🤖", "👾", "🎭", "🌟"];
type PhotoMode = "photo" | "avatar" | "none";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();

  const [name, setName]           = useState("");
  const [phone, setPhone]         = useState("");
  const [photo, setPhoto]         = useState<string | null>(null);
  const [avatarEmoji, setAvatarEmoji] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoMode, setPhotoMode] = useState<PhotoMode>("none");

  const [editing, setEditing]     = useState(false);
  const [saved, setSaved]         = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Store originals for cancel
  const orig = useRef({ name: "", phone: "", photo: null as string | null, emoji: null as string | null, mode: "none" as PhotoMode });

  // Password
  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword]   = useState("");
  const [newPassword, setNewPassword]           = useState("");
  const [confirmPassword, setConfirmPassword]   = useState("");
  const [passwordError, setPasswordError]       = useState("");
  const [passwordSuccess, setPasswordSuccess]   = useState(false);
  const [passwordLoading, setPasswordLoading]   = useState(false);

  // Load from Firestore
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const data = snap.data();
          const n = data.name || user.displayName || "";
          const ph = data.phone || "";
          const pic = data.photoDataUrl || null;
          const emoji = data.avatarEmoji || null;
          const mode: PhotoMode = pic ? "photo" : emoji ? "avatar" : "none";
          setName(n); setPhone(ph); setPhoto(pic); setAvatarEmoji(emoji); setPhotoMode(mode);
          orig.current = { name: n, phone: ph, photo: pic, emoji, mode };
        } else {
          const n = user.displayName || "";
          setName(n);
          orig.current = { name: n, phone: "", photo: null, emoji: null, mode: "none" };
        }
      } catch {
        setName(user.displayName || "");
      }
    };
    load();
  }, [user]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => { setPhoto(reader.result as string); setPhotoMode("photo"); setAvatarEmoji(null); };
    reader.readAsDataURL(file);
  };

  const saveProfile = async () => {
    if (!user || !auth.currentUser) return;
    setSaveLoading(true);
    setSaveError("");
    try {
      let photoDataUrl = photo;
      // Compress if new file uploaded
      if (photoFile) {
        photoDataUrl = await resizeImageToDataUrl(photoFile, 200, 0.7);
        setPhoto(photoDataUrl);
        setPhotoFile(null);
      }

      // If switched to avatar, clear photo
      if (photoMode === "avatar") photoDataUrl = null;
      if (photoMode === "none") { photoDataUrl = null; }

      await updateProfile(auth.currentUser, { displayName: name.trim() || null });

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: name.trim() || "",
        email: user.email || "",
        phone: phone.trim() || "",
        photoDataUrl: photoDataUrl || "",
        avatarEmoji: photoMode === "avatar" ? (avatarEmoji || "") : "",
        updatedAt: serverTimestamp(),
      }, { merge: true });

      await refreshUser();

      orig.current = { name: name.trim(), phone: phone.trim(), photo: photoDataUrl, emoji: photoMode === "avatar" ? avatarEmoji : null, mode: photoMode };
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setSaveError(err.message || "Failed to save. Please try again.");
    } finally {
      setSaveLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditing(false); setSaveError(""); setPhotoFile(null);
    setName(orig.current.name); setPhone(orig.current.phone);
    setPhoto(orig.current.photo); setAvatarEmoji(orig.current.emoji);
    setPhotoMode(orig.current.mode as PhotoMode);
  };

  const handlePasswordChange = async () => {
    setPasswordError(""); setPasswordSuccess(false);
    if (!currentPassword || !newPassword || !confirmPassword) { setPasswordError("All fields are required"); return; }
    if (newPassword.length < 6) { setPasswordError("New password must be at least 6 characters"); return; }
    if (newPassword !== confirmPassword) { setPasswordError("New passwords do not match"); return; }
    if (!user?.email || !auth.currentUser) { setPasswordError("User not authenticated"); return; }
    setPasswordLoading(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
      setPasswordSuccess(true);
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      setChangingPassword(false);
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential")
        setPasswordError("Current password is incorrect");
      else if (err.code === "auth/weak-password") setPasswordError("New password is too weak");
      else setPasswordError("Failed to change password. Please try again.");
    } finally { setPasswordLoading(false); }
  };

  const initials = (name || user?.email || "U").charAt(0).toUpperCase();
  const inputStyle = { background: "rgba(0,0,0,0.3)", border: "1px solid rgba(167,139,250,0.4)", borderRadius: "8px", padding: "0.4rem 0.7rem", color: "#e5e7eb", fontSize: "0.88rem", outline: "none", fontFamily: "Inter, system-ui", width: "55%" };

  return (
    <RequireAuth>
      <div className="profile-page">
        <div className="profile-card animate-fade-up">
          <h1 style={{ textAlign: "center", fontSize: "1.6rem", marginBottom: "2rem", fontFamily: "Space Grotesk, system-ui, sans-serif", letterSpacing: "-0.02em" }}>
            My Profile
          </h1>

          {/* Avatar display */}
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div className="avatar-ring">
              <div className="avatar-inner" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                {photo && photoMode === "photo"
                  ? <img src={photo} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : avatarEmoji && photoMode === "avatar"
                    ? <span style={{ fontSize: "2.8rem", lineHeight: 1 }}>{avatarEmoji}</span>
                    : <span style={{ fontFamily: "Space Grotesk, system-ui", fontWeight: 700, fontSize: "2rem", color: "#a78bfa" }}>{initials}</span>}
              </div>
            </div>

            {/* Edit photo options */}
            {editing && (
              <div style={{ marginTop: "1rem" }}>
                {/* Mode switcher */}
                <div style={{ display: "flex", gap: "0.4rem", justifyContent: "center", marginBottom: "0.85rem" }}>
                  {(["photo", "avatar", "none"] as PhotoMode[]).map((mode) => (
                    <button key={mode} type="button"
                      onClick={() => { setPhotoMode(mode); if (mode !== "photo") setPhotoFile(null); if (mode !== "avatar") {} }}
                      style={{ padding: "0.3rem 0.7rem", borderRadius: "20px", fontSize: "0.75rem", cursor: "pointer", fontFamily: "inherit",
                        border: photoMode === mode ? "1px solid rgba(167,139,250,0.6)" : "1px solid rgba(255,255,255,0.1)",
                        background: photoMode === mode ? "rgba(167,139,250,0.15)" : "transparent",
                        color: photoMode === mode ? "#a78bfa" : "var(--text-muted)", transition: "all 0.2s" }}>
                      {mode === "photo" ? "📷 Upload" : mode === "avatar" ? "😀 Avatar" : "✕ Remove"}
                    </button>
                  ))}
                </div>

                {/* Upload input */}
                {photoMode === "photo" && (
                  <label style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", cursor: "pointer", fontSize: "0.82rem", color: "var(--purple-light)", padding: "0.35rem 0.8rem", borderRadius: "8px", border: "1px solid rgba(167,139,250,0.25)", background: "rgba(167,139,250,0.06)" }}>
                    {photo ? "Change Photo" : "Choose Photo"}
                    <input ref={fileRef} type="file" accept="image/*" hidden onChange={handlePhotoUpload} />
                  </label>
                )}

                {/* Emoji grid */}
                {photoMode === "avatar" && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.4rem", maxWidth: 240, margin: "0 auto" }}>
                    {AVATARS.map((emoji) => (
                      <button key={emoji} type="button"
                        onClick={() => setAvatarEmoji(emoji)}
                        style={{ width: 40, height: 40, borderRadius: "50%", fontSize: "1.3rem", cursor: "pointer",
                          border: avatarEmoji === emoji ? "2px solid #a78bfa" : "2px solid rgba(255,255,255,0.08)",
                          background: avatarEmoji === emoji ? "rgba(167,139,250,0.15)" : "rgba(255,255,255,0.04)",
                          display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Info fields */}
          <div style={{ marginBottom: "1rem" }}>
            <div className="profile-field">
              <span className="profile-field-label">Email</span>
              <span className="profile-field-value" style={{ fontSize: "0.88rem" }}>{user?.email}</span>
            </div>
            <div className="profile-field">
              <span className="profile-field-label">Member Since</span>
              <span className="profile-field-value" style={{ fontSize: "0.88rem" }}>
                {user?.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—"}
              </span>
            </div>
            <div className="profile-field">
              <span className="profile-field-label">Display Name</span>
              {editing
                ? <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter display name" style={inputStyle} />
                : <span className="profile-field-value" style={{ fontSize: "0.88rem" }}>{name || <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>Not set</span>}</span>}
            </div>
            <div className="profile-field">
              <span className="profile-field-label">Phone</span>
              {editing
                ? <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" style={inputStyle} />
                : <span className="profile-field-value" style={{ fontSize: "0.88rem" }}>{phone || <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>Not set</span>}</span>}
            </div>
          </div>

          {saved && <p className="success-text" style={{ marginBottom: "0.75rem" }}>✓ Profile saved successfully</p>}
          {saveError && <p className="error-text" style={{ marginBottom: "0.75rem" }}>{saveError}</p>}

          <div className="profile-actions">
            {editing ? (
              <>
                <button className="btn-primary" onClick={saveProfile} disabled={saveLoading} style={{ flex: 1, justifyContent: "center" }}>
                  {saveLoading ? <><span className="spinner" /> Saving...</> : "Save Changes"}
                </button>
                <button className="btn-secondary" onClick={cancelEdit} style={{ padding: "0.75rem 1.25rem" }}>Cancel</button>
              </>
            ) : (
              <button className="btn-secondary" onClick={() => setEditing(true)} style={{ width: "100%", justifyContent: "center" }}>✏️ Edit Profile</button>
            )}
          </div>

          {/* Change Password */}
          <div style={{ marginTop: "2rem", paddingTop: "2rem", borderTop: "1px solid var(--border)" }}>
            {!changingPassword ? (
              <button className="btn-secondary" onClick={() => setChangingPassword(true)} style={{ width: "100%", justifyContent: "center" }}>🔑 Change Password</button>
            ) : (
              <div>
                <h3 style={{ marginBottom: "1.25rem", fontSize: "1.1rem", fontFamily: "Space Grotesk, system-ui" }}>Change Password</h3>
                <div className="form-group">
                  <label>Current Password</label>
                  <input type="password" placeholder="Enter current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input type="password" placeholder="Minimum 6 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={6} />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input type="password" placeholder="Re-enter new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                </div>
                {passwordError && <p className="error-text" style={{ marginBottom: "0.75rem" }}>{passwordError}</p>}
                {passwordSuccess && <p className="success-text" style={{ marginBottom: "0.75rem" }}>✓ Password changed successfully</p>}
                <div className="profile-actions">
                  <button className="btn-primary" onClick={handlePasswordChange} disabled={passwordLoading} style={{ flex: 1, justifyContent: "center" }}>
                    {passwordLoading ? <><span className="spinner" /> Updating...</> : "Update Password"}
                  </button>
                  <button className="btn-secondary" onClick={() => { setChangingPassword(false); setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); setPasswordError(""); }} style={{ padding: "0.75rem 1.25rem" }}>Cancel</button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </RequireAuth>
  );
}