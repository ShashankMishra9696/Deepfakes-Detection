export default function Footer() {
  return (
    <footer>
      <p style={{ margin: 0, color: "inherit" }}>
        © {new Date().getFullYear()}{" "}
        <span style={{ color: "var(--acid)", fontWeight: 500 }}>Deepfake Detector</span>
        {" | "}Built by Shashank Mishra
      </p>
      <p style={{ margin: "0.35rem 0 0", fontSize: "0.72rem", opacity: 0.5 }}>
        Images processed in-memory — Never Stored — Zero Data Retention
      </p>
    </footer>
  );
}
