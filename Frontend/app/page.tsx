"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

/* Intersection observer for scroll-reveal */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add("visible");
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* Animated counter */
function useCounter(target: number, duration = 1800) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      let start = 0;
      const step = target / (duration / 16);
      const tick = () => {
        start = Math.min(start + step, target);
        el.textContent = Math.round(start).toString();
        if (start < target) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => io.disconnect();
  }, [target, duration]);
  return ref;
}

export default function HomePage() {
  useReveal();

  return (
    <>
      {/* ══════════════════════ HERO ══════════════════════ */}
      <section className="hero">

        {/* Floating grid lines */}
        <div aria-hidden style={{
          position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden",
          backgroundImage: `linear-gradient(rgba(0,255,136,0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0,255,136,0.03) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent)",
        }} />

        <div className="animate-fade-up-1">
          <span className="hero-badge">
            <span className="hero-badge-dot" />
            Vision Transformer AI — v2.4.1
          </span>
        </div>

        <div className="animate-fade-up-2">
          <h1>
            <span className="hero-title-normal" style={{ display: "block" }}>Detect</span>
            <span className="hero-title-accent" style={{ display: "block" }}>Deepfakes</span>
            <span className="hero-title-normal" style={{ display: "block", fontSize: "0.6em", fontWeight: 300, letterSpacing: "-0.01em", color: "#64748b", marginTop: "0.3em" }}>
              with confidence.
            </span>
          </h1>
        </div>

        <div className="animate-fade-up-3">
          <p className="hero-subtitle">
            Upload any image. Our 86M-parameter Vision Transformer analyzes
            pixel-level artifacts and manipulation patterns — in under 3 seconds.
          </p>
        </div>

        <div className="hero-actions animate-fade-up-4">
          <Link href="/detect" className="btn-primary">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L13 7L7 13M1 7H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Start Detection
          </Link>
          <Link href="/signup" className="btn-secondary">
            Create Free Account
          </Link>
        </div>

        {/* Stats */}
        <div className="hero-stats animate-fade-up-5">
          <div className="hero-stat">
            <span className="hero-stat-value">99.2%<span style={{fontSize:"0.5em",opacity:0.7}}>%</span></span>
            <span className="hero-stat-label">accuracy</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-value">&lt;3s<span style={{fontSize:"0.5em",opacity:0.7}}>s</span></span>
            <span className="hero-stat-label">analysis time</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-value">0<span style={{fontSize:"0.5em",opacity:0.7}}>kb</span></span>
            <span className="hero-stat-label">data stored</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-value">86M<span style={{fontSize:"0.5em",opacity:0.7}}>M</span></span>
            <span className="hero-stat-label">parameters</span>
          </div>
        </div>
      </section>

      {/* ══════════════════════ FEATURES ══════════════════════ */}
      <section className="section">
        <div className="container">
          <div className="section-header reveal">
            <span className="section-tag">Capabilities</span>
            <h2>Built for reliability<br />and total privacy</h2>
            <p style={{ maxWidth: 460, margin: "0 auto", fontSize: "0.95rem" }}>
              Every component is optimized for accuracy, speed, and zero data exposure.
            </p>
          </div>

          <div className="card-grid">
            {[
              {
                icon: "◎",
                color: "card-icon",
                title: "High Accuracy",
                body: "Vision Transformer trained on diverse real and synthetic image datasets. Detects GAN artifacts, blending seams, frequency anomalies.",
                tag: "99.2% overall",
              },
              {
                icon: "⬡",
                color: "card-icon card-icon-red",
                title: "Zero Data Stored",
                body: "Images are processed in-memory only. No disk writes, no logs, no third-party sharing. Your analysis stays completely private.",
                tag: "privacy-first",
              },
              {
                icon: "▷",
                color: "card-icon card-icon-blue",
                title: "Fast Analysis",
                body: "Full inference in under 3 seconds. Confidence percentage returned alongside every binary verdict so you know the certainty.",
                tag: "< 3s latency",
              },
            ].map((f, i) => (
              <div key={f.title} className={`card reveal`} style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className="bracket-tl" />
                <div className={f.color} style={{ fontFamily: "monospace", fontSize: "1.1rem", fontWeight: 300 }}>
                  {f.icon}
                </div>
                <h3>{f.title}</h3>
                <p style={{ margin: "0 0 1rem", color: "#64748b", fontSize: "0.88rem", lineHeight: 1.7 }}>{f.body}</p>
                <span style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.68rem",
                  color: "var(--acid)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  background: "rgba(0,255,136,0.06)",
                  border: "1px solid rgba(0,255,136,0.15)",
                  padding: "0.2rem 0.6rem",
                  borderRadius: "4px",
                }}>
                  {f.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ HOW IT WORKS ══════════════════════ */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-header reveal">
            <span className="section-tag">Process</span>
            <h2>Three steps to the truth</h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1px", position: "relative" }}>
            {/* Vertical connecting line */}
            <div style={{
              position: "absolute",
              left: 24, top: 40, bottom: 40,
              width: 1,
              background: "linear-gradient(180deg, transparent, rgba(0,255,136,0.2), transparent)",
              pointerEvents: "none",
            }} />

            {[
              { num: "01", title: "Upload Image", body: "Drag and drop or select any JPEG, PNG, or WebP file. Transmitted over HTTPS. Never written to disk." },
              { num: "02", title: "AI Analysis", body: "Image divided into 16×16 patches. Fed through 12-layer Vision Transformer attending to global manipulation patterns." },
              { num: "03", title: "Get Result", body: "Real or Fake verdict returned with a confidence score in under 3 seconds. Image immediately discarded." },
            ].map((step, i) => (
              <div key={step.num} className="reveal" style={{ transitionDelay: `${i * 0.12}s` }}>
                <div style={{
                  display: "flex", gap: "1.5rem", alignItems: "flex-start",
                  padding: "1.5rem", borderRadius: "var(--radius)",
                  background: "var(--bg-card)", border: "1px solid var(--border)",
                  marginBottom: "1px",
                  transition: "border-color 0.3s",
                }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(0,255,136,0.15)")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
                >
                  <span style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.75rem",
                    color: "var(--acid)",
                    background: "rgba(0,255,136,0.06)",
                    border: "1px solid rgba(0,255,136,0.15)",
                    borderRadius: "6px",
                    padding: "0.4rem 0.6rem",
                    flexShrink: 0,
                    lineHeight: 1,
                    marginTop: "0.1rem",
                  }}>
                    {step.num}
                  </span>
                  <div>
                    <h3 style={{ margin: "0 0 0.4rem", color: "var(--white)" }}>{step.title}</h3>
                    <p style={{ margin: 0, fontSize: "0.88rem", color: "#64748b", lineHeight: 1.7 }}>{step.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="reveal" style={{ textAlign: "center", marginTop: "2.5rem" }}>
            <Link href="/how-it-works" className="btn-secondary">
              Full Technical Overview →
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════ CTA ══════════════════════ */}
      <section className="section-sm">
        <div className="container">
          <div className="reveal card" style={{
            textAlign: "center",
            padding: "4rem 2rem",
            background: "linear-gradient(135deg, rgba(0,255,136,0.04) 0%, rgba(14,165,233,0.03) 100%)",
            border: "1px solid rgba(0,255,136,0.12)",
            position: "relative",
            overflow: "hidden",
          }}>
            {/* Corner brackets */}
            <div className="bracket-tl" style={{ width: 30, height: 30, top: 20, left: 20 }} />
            <div className="bracket-br" style={{ width: 30, height: 30, bottom: 20, right: 20 }} />

            {/* Background glow */}
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(0,255,136,0.04), transparent)",
            }} />

            <span className="section-tag" style={{ marginBottom: "1rem", display: "inline-block" }}>
              Get started
            </span>
            <h2 style={{ marginBottom: "0.75rem", position: "relative" }}>
              Ready to detect deepfakes?
            </h2>
            <p style={{ color: "#64748b", maxWidth: 400, margin: "0 auto 2.5rem", fontSize: "0.95rem" }}>
              Create a free account. No credit card. No data stored.
              Analyze your first image in under 60 seconds.
            </p>
            <div className="hero-actions" style={{ marginTop: 0 }}>
              <Link href="/signup" className="btn-primary">
                Create Free Account
              </Link>
              <Link href="/about" className="btn-secondary">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
