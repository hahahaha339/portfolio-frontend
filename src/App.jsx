import { useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CertificationsPage from "./pages/CertificationsPage";
import ProjectsPage from "./pages/ProjectsPage";
import TechStackPage from "./pages/TechStackPage";
import Seo from "./components/Seo";


function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return null;
}

function ThemeToggle({ theme, onToggle }) {
  return (
    <div className="theme-toggle-wrap">
      <button
        id="themeToggle"
        className="theme-toggle"
        type="button"
        onClick={onToggle}
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      >
        <span className="theme-icon" aria-hidden="true"></span>
      </button>
    </div>
  );
}

function NotFoundFallback() {
  return (
    <>
      <Seo
        description="The page you are looking for could not be found on Gabriel Lazaro's portfolio website."
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

export default function App() {
  const [theme, setTheme] = useState("light");
  const [certificatePreview, setCertificatePreview] = useState("");

  useEffect(() => {
    document.body.classList.toggle("dark-mode", theme === "dark");
  }, [theme]);

  useEffect(() => {
    document.body.classList.toggle("modal-open", Boolean(certificatePreview));
  }, [certificatePreview]);

  return (
    <>
      <ScrollToTop />
      <ThemeToggle
        theme={theme}
        onToggle={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
      />

      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              theme={theme}
              certificatePreview={certificatePreview}
              onOpenCertificate={setCertificatePreview}
              onCloseCertificate={() => setCertificatePreview("")}
            />
          }
        />
        <Route
          path="/certifications"
          element={
            <CertificationsPage
              theme={theme}
              certificatePreview={certificatePreview}
              onOpenCertificate={setCertificatePreview}
              onCloseCertificate={() => setCertificatePreview("")}
            />
          }
        />
        <Route
          path="/projects"
          element={<ProjectsPage theme={theme} />}
        />
        <Route
          path="/tech-stack"
          element={<TechStackPage theme={theme} />}
        />
        <Route
          path="*"
          element={<NotFoundFallback />}
        />
      </Routes>
    </>
  );
}
