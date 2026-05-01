"use client";

import { useState, useRef, type ChangeEvent, type DragEvent } from "react";
import RequireAuth from "@/components/RequireAuth";
import { useAuth } from "@/lib/auth";

export default function DetectPage() {
  const { user } = useAuth();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [noFaceDetected, setNoFaceDetected] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    setConfidence(null);
    setError(null);
    setNoFaceDetected(false);
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) handleFile(file);
  };

  const handleAnalyze = async () => {
    if (!imageFile) {
      setError("Please upload an image first.");
      return;
    }
    if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
      setError("Backend URL not configured.");
      return;
    }

    setLoading(true);
    setError(null);
    setNoFaceDetected(false);

    try {
      const formData = new FormData();
      formData.append("file", imageFile);
      
      // Add user_id as query parameter
      const userId = user?.uid || "anonymous";
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/predict?user_id=${userId}`;

      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Backend error");
      }

      const data = await response.json();

      // Check if backend returned a "no face detected" response
      if (data.error || data.prediction === "No Face Detected") {
        setNoFaceDetected(true);
        setError(data.error || "No face detected in the image. Please upload an image with a clear face.");
        return;
      }

      setResult(data.prediction);
      setConfidence(data.confidence);
    } catch (err: any) {
      console.error(err);
      setError("Failed to analyze image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImageFile(null);
    setPreviewUrl(null);
    setResult(null);
    setConfidence(null);
    setError(null);
    setNoFaceDetected(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const isFake = result?.toLowerCase() === "fake";

  return (
    <RequireAuth>
      <div
        style={{
          maxWidth: 640,
          margin: "4rem auto",
          padding: "0 1.5rem 4rem",
        }}
      >
        {/* Header */}
        <div className="animate-fade-up-1" style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <span className="section-tag">AI-Powered</span>
          <h1 style={{ margin: "0.75rem 0 0.5rem" }}>Deepfake Detection</h1>
          <p style={{ color: "var(--text-muted)", margin: 0, maxWidth: 440, marginInline: "auto" }}>
            Upload an image and our Vision Transformer model will determine
            if it&apos;s real or AI-generated.
          </p>
        </div>

        {/* Main Card */}
        <div className="card animate-fade-up-2">
          {/* Upload Zone */}
          {!previewUrl ? (
            <div
              className={`upload-zone ${dragging ? "dragging" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
            >
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
              <span className="upload-icon">🖼️</span>
              <span className="upload-label">
                {dragging ? "Drop it here!" : "Drag & drop or click to upload"}
              </span>
              <span className="upload-sublabel">Supports JPEG, PNG, WebP — Max 10MB</span>
            </div>
          ) : (
            <div>
              {/* Preview */}
              <div
                style={{
                  borderRadius: "12px",
                  overflow: "hidden",
                  marginBottom: "1.25rem",
                  position: "relative",
                  maxHeight: 360,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(0,0,0,0.3)",
                }}
              >
                <img
                  src={previewUrl}
                  alt="Preview"
                  style={{ maxWidth: "100%", maxHeight: 360, objectFit: "contain", borderRadius: 12 }}
                />
                {/* File info */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "0.75rem",
                    left: "0.75rem",
                    background: "rgba(2,6,23,0.8)",
                    backdropFilter: "blur(8px)",
                    borderRadius: "8px",
                    padding: "0.35rem 0.65rem",
                    fontSize: "0.78rem",
                    color: "var(--text-muted)",
                    border: "1px solid var(--border)",
                  }}
                >
                  📎 {imageFile?.name}
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button
                  className="btn-primary"
                  onClick={handleAnalyze}
                  disabled={loading}
                  style={{ flex: 1, justifyContent: "center", padding: "0.85rem" }}
                >
                  {loading ? (
                    <>
                      <span className="spinner" /> Analyzing...
                    </>
                  ) : (
                    "⚡ Analyze Image"
                  )}
                </button>
                <button
                  className="btn-secondary"
                  onClick={handleReset}
                  disabled={loading}
                  style={{ padding: "0.85rem 1.25rem" }}
                >
                  ✕ Reset
                </button>
              </div>
            </div>
          )}

          {/* Error / No Face Detection */}
          {error && (
            <div
              style={{
                marginTop: "1rem",
                padding: "1rem",
                borderRadius: "12px",
                background: noFaceDetected 
                  ? "rgba(251, 146, 60, 0.08)" 
                  : "rgba(248, 113, 113, 0.08)",
                border: `1px solid ${noFaceDetected 
                  ? "rgba(251, 146, 60, 0.3)" 
                  : "rgba(248, 113, 113, 0.2)"}`,
                display: "flex",
                alignItems: "flex-start",
                gap: "0.75rem",
              }}
            >
              <span style={{ fontSize: "1.5rem" }}>
                {noFaceDetected ? "⚠️" : "❌"}
              </span>
              <div>
                <p
                  style={{
                    margin: "0 0 0.35rem",
                    color: noFaceDetected ? "#fb923c" : "#f87171",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                  }}
                >
                  {noFaceDetected ? "No Face Detected" : "Error"}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.85rem",
                    color: "var(--text-muted)",
                    lineHeight: 1.5,
                  }}
                >
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* Result */}
          {result && confidence !== null && !noFaceDetected && (
            <div className={`result-card ${isFake ? "fake" : "real"}`}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
                {isFake ? "🚨" : "✅"}
              </div>
              <p
                style={{
                  margin: "0 0 0.25rem",
                  fontSize: "0.78rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--text-muted)",
                  fontWeight: 600,
                }}
              >
                Detection Result
              </p>
              <div className={`result-label ${isFake ? "fake" : "real"}`}>
                {isFake ? "DEEPFAKE DETECTED" : "APPEARS REAL"}
              </div>
              <p
                style={{
                  margin: "0.5rem 0 1rem",
                  color: "var(--text-muted)",
                  fontSize: "0.9rem",
                }}
              >
                Confidence:{" "}
                <strong style={{ color: isFake ? "#f87171" : "#34d399" }}>
                  {confidence}%
                </strong>
              </p>
              <div className="confidence-bar">
                <div
                  className={`confidence-fill ${isFake ? "fake" : "real"}`}
                  style={{ width: `${confidence}%` }}
                />
              </div>
              <p
                style={{
                  marginTop: "1rem",
                  fontSize: "0.78rem",
                  color: "var(--text-muted)",
                  marginBottom: 0,
                }}
              >
                {isFake
                  ? "⚠️ This image shows signs of AI manipulation or generation."
                  : "ℹ️ No significant signs of manipulation detected in this image."}
              </p>
            </div>
          )}
        </div>

        {/* Tips */}
        <div
          className="animate-fade-up-3"
          style={{
            marginTop: "1.5rem",
            padding: "1rem 1.25rem",
            borderRadius: "12px",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid var(--border)",
            fontSize: "0.82rem",
            color: "var(--text-muted)",
          }}
        >
          💡 <strong style={{ color: "#e5e7eb" }}>Tips:</strong> Use high-resolution images with clear, visible faces for better accuracy.
          Portrait-style photos work best. The model is optimized for facial deepfakes and requires a detectable face in the image.
        </div>
      </div>
    </RequireAuth>
  );
}