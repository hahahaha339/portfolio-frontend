import Seo from "../components/Seo";

export default function NotFoundPage() {
  return (
    <>
      <Seo
        title="404: Looks like you're lost"
        description="404: Looks like you're lost."
        path="/404"
      />
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "32px 20px"
        }}
      >
        <div
          style={{
            width: "min(520px, 100%)",
            border: "1px solid #e5e5e5",
            background: "#fff",
            padding: "32px 28px",
            color: "#111",
            boxSizing: "border-box",
            textAlign: "center"
          }}
        >
          <p style={{ margin: "0 0 10px", fontSize: "14px", fontWeight: 700, letterSpacing: "0.08em" }}>404</p>
          <h1 style={{ margin: "0 0 12px", fontSize: "32px", lineHeight: 1.1 }}>Page not found</h1>
          <p style={{ margin: 0, fontSize: "15px", lineHeight: 1.7 }}>
            The page you entered does not exist or may have been moved.
          </p>
        </div>
      </div>
    </>
  );
}
