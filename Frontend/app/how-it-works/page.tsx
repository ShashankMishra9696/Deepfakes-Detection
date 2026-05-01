import Link from "next/link";

export default function HowItWorksPage() {
  return (
    <div className="section">
      <div className="container">
        {/* Header */}
        <div className="animate-fade-up-1" style={{ marginBottom: "4rem", maxWidth: 600 }}>
          <span className="section-tag">Process Overview</span>
          <h1 style={{ marginTop: "0.75rem", marginBottom: "1rem" }}>
            How It Works
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1.05rem", lineHeight: 1.8 }}>
            Our <span className="highlight">deepfake detection</span> pipeline is fast, accurate, and completely private.
            Here&apos;s exactly what happens when you upload an image.
          </p>
        </div>

        {/* Steps */}
        <div className="animate-fade-up-2" style={{ marginBottom: "5rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {[
              {
                num: "01",
                icon: "🖼️",
                title: "Upload Your Image",
                desc: "Select or drag any JPEG, PNG, or WebP image. Your file is sent securely over HTTPS to the analysis server. It is never stored to disk and exists only for the duration of the analysis.",
                detail: "Max file size: 10MB",
              },
              {
                num: "02",
                icon: "🔧",
                title: "Image Preprocessing",
                desc: "The image is resized to 224×224 pixels and normalized for the Vision Transformer input pipeline. Color channels are standardized using ImageNet mean and variance values.",
                detail: "224×224px — ImageNet normalization",
              },
              {
                num: "03",
                icon: "🧠",
                title: "Vision Transformer Analysis",
                desc: "The image is divided into 16×16 pixel patches and fed through a 12-layer Vision Transformer. The model attends to global spatial relationships across patches, detecting unnatural blending, GAN-generated textures, and manipulation artifacts.",
                detail: "12-layer ViT — 86M parameters",
              },
              {
                num: "04",
                icon: "📊",
                title: "Confidence Scoring",
                desc: "The model outputs a probability score between 0 and 100. Scores above 50% indicate a likely deepfake. The raw probability is displayed as a confidence percentage alongside the binary real/fake verdict.",
                detail: ">50% = Fake prediction",
              },
              {
                num: "05",
                icon: "✅",
                title: "Result Returned",
                desc: "Your result is returned instantly in the browser. The image is immediately discarded from memory. Nothing is logged or stored. You get a clear verdict with a confidence bar.",
                detail: "Response time: ~2–4 seconds",
              },
            ].map((step, i) => (
              <div
                key={step.num}
                className="card"
                style={{
                  display: "flex",
                  gap: "1.75rem",
                  alignItems: "flex-start",
                  padding: "1.75rem 2rem",
                }}
              >
                <div style={{ flexShrink: 0 }}>
                  <span
                    className="step-number"
                    style={{ display: "block", marginBottom: 0 }}
                  >
                    {step.num}
                  </span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: "1.2rem" }}>{step.icon}</span>
                    <h3 style={{ margin: 0 }}>{step.title}</h3>
                  </div>
                  <p style={{ margin: "0 0 0.75rem", color: "var(--text-muted)", lineHeight: 1.7, fontSize: "0.92rem" }}>
                    {step.desc}
                  </p>
                  <span
                    className="tech-badge"
                    style={{ fontSize: "0.75rem" }}
                  >
                    {step.detail}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Model Architecture */}
        <div className="animate-fade-up-3" style={{ marginBottom: "4rem" }}>
          <h2 style={{ marginBottom: "1.75rem" }}>Model Architecture</h2>
          <div className="card-grid">
            {[
              { icon: "🧩", label: "Architecture", value: "Vision Transformer (ViT-B/16)" },
              { icon: "🏋️", label: "Training Data", value: "FaceForensics++ + DFDC" },
              { icon: "📐", label: "Input Size", value: "224 × 224 pixels" },
              { icon: "🔬", label: "Patch Size", value: "16 × 16 pixels" },
              { icon: "🧬", label: "Parameters", value: "~86 million" },
              { icon: "🎯", label: "Accuracy", value: "99.2% on test set" },
            ].map((item) => (
              <div
                key={item.label}
                className="card"
                style={{ padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}
              >
                <span style={{ fontSize: "1.4rem", flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <p
                    style={{
                      margin: "0 0 0.15rem",
                      fontSize: "0.72rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "var(--text-muted)",
                      fontWeight: 600,
                    }}
                  >
                    {item.label}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontWeight: 600,
                      fontSize: "0.92rem",
                      color: "#e5e7eb",
                    }}
                  >
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div
          className="card animate-fade-up-4"
          style={{
            textAlign: "center",
            padding: "3rem 2rem",
            background: "linear-gradient(135deg, rgba(124,58,237,0.1), rgba(34,211,238,0.06))",
            border: "1px solid rgba(167,139,250,0.2)",
          }}
        >
          <h2 style={{ marginBottom: "0.75rem" }}>Try it yourself</h2>
          <p style={{ color: "var(--text-muted)", maxWidth: 400, margin: "0 auto 2rem" }}>
            See the model in action. Upload any image and get your result in seconds.
          </p>
          <Link href="/detect" className="btn-primary">
            ⚡ Start Detection
          </Link>
        </div>
      </div>
    </div>
  );
}
