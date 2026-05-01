export default function AboutPage() {
  return (
    <div className="section">
      <div className="container">
        {/* Header */}
        <div className="animate-fade-up-1" style={{ marginBottom: "4rem", maxWidth: 680 }}>
          <span className="section-tag">About the Project</span>
          <h1 style={{ marginTop: "0.75rem", marginBottom: "1rem" }}>
            AI-powered deepfake detection for everyone
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1.05rem", lineHeight: 1.8 }}>
            This system uses a state-of-the-art Vision Transformer (ViT) model to identify
            AI-generated and manipulated images with high confidence — completely free and
            without storing your data.
          </p>
        </div>

        {/* Mission + Tech Grid */}
        <div className="about-grid animate-fade-up-2" style={{ marginBottom: "4rem" }}>
          <div>
            <h2 style={{ marginBottom: "1.25rem" }}>Why this matters</h2>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>
              Deepfake technology has advanced rapidly, making it increasingly difficult
              to distinguish real images from AI-generated ones. This poses serious risks —
              from misinformation and fraud to reputational damage.
            </p>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>
              Our tool gives individuals, journalists, and organizations a fast,
              accessible way to verify images before sharing or acting on them.
            </p>
            <div style={{ marginTop: "1.75rem", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {["Vision Transformer", "PyTorch", "Next.js", "Firebase", "Python", "FastAPI"].map((tech) => (
                <span key={tech} className="tech-badge">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: "2rem" }}>
            <h3 style={{ marginBottom: "1.5rem", color: "#e5e7eb" }}>How accurate is it?</h3>
            {[
              { label: "Overall Accuracy", value: 99.2, color: "#a78bfa" },
              { label: "True Positive Rate", value: 98.7, color: "#f87171" },
              { label: "True Negative Rate", value: 99.6, color: "#34d399" },
              { label: "False Positive Rate", value: 0.4, color: "#22d3ee" },
            ].map((stat) => (
              <div key={stat.label} style={{ marginBottom: "1.25rem" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.4rem",
                  }}
                >
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    {stat.label}
                  </span>
                  <span
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      color: stat.color,
                      fontFamily: "Syne, system-ui, sans-serif",
                    }}
                  >
                    {stat.value}%
                  </span>
                </div>
                <div
                  style={{
                    height: "5px",
                    background: "rgba(255,255,255,0.06)",
                    borderRadius: 999,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${stat.value}%`,
                      background: stat.color,
                      borderRadius: 999,
                    }}
                  />
                </div>
              </div>
            ))}
            <p
              style={{
                margin: 0,
                fontSize: "0.75rem",
                color: "var(--text-muted)",
                lineHeight: 1.5,
              }}
            >
              * Based on benchmark testing on FaceForensics++ and DFDC datasets.
            </p>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="animate-fade-up-3">
          <h2 style={{ marginBottom: "1.75rem" }}>What makes it different</h2>
          <div className="card-grid">
            {[
              {
                icon: "🛡️",
                title: "Privacy First",
                desc: "Images are processed in-memory. Nothing is saved to disk or logged. Your data stays yours.",
              },
              {
                icon: "🧠",
                title: "Vision Transformer",
                desc: "Unlike CNNs, ViT models capture global context — making them superior at detecting subtle deepfake artifacts.",
              },
              {
                icon: "📊",
                title: "Confidence Scoring",
                desc: "Every prediction comes with a confidence percentage so you can gauge how certain the model is.",
              },
            ].map((item) => (
              <div className="card" key={item.title}>
                <div className="card-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--text-muted)" }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Author */}
        <div
          className="card animate-fade-up-4"
          style={{
            marginTop: "3rem",
            padding: "2rem",
            display: "flex",
            alignItems: "center",
            gap: "1.5rem",
            flexWrap: "wrap",
            background: "linear-gradient(135deg, rgba(124,58,237,0.1), rgba(34,211,238,0.06))",
            border: "1px solid rgba(167,139,250,0.2)",
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #7c3aed, #22d3ee)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
              flexShrink: 0,
            }}
          >
            🧑‍💻
          </div>
          <div>
            <p
              style={{
                margin: "0 0 0.25rem",
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "var(--text-muted)",
                fontWeight: 600,
              }}
            >
              Built by
            </p>
            <h3 style={{ margin: "0 0 0.35rem" }}>Shashank Mishra</h3>
            <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--text-muted)" }}>
              AI/ML & Full-stack developer enthusiast passionate about making
              AI safety tools accessible to everyone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
