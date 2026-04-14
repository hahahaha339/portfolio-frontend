import { useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CertificationsPage from "./pages/CertificationsPage";
import ProjectsPage from "./pages/ProjectsPage";
import TechStackPage from "./pages/TechStackPage";
import NotFoundPage from "./pages/NotFoundPage";


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

export default function App() {
  const [theme, setTheme] = useState("light");
  const [certificatePreview, setCertificatePreview] = useState("");
  const location = useLocation();
  const showThemeToggle = ["/", "/certifications", "/projects", "/tech-stack"].includes(location.pathname);
  const certificatePreviewRoutes = ["/", "/certifications"];

  useEffect(() => {
    document.body.classList.toggle("dark-mode", theme === "dark");
  }, [theme]);

  useEffect(() => {
    document.body.classList.toggle("modal-open", Boolean(certificatePreview));
  }, [certificatePreview]);

  useEffect(() => {
    if (!certificatePreview) return;
    if (certificatePreviewRoutes.includes(location.pathname)) return;

    setCertificatePreview("");
  }, [certificatePreview, location.pathname]);

  return (
    <>
      <ScrollToTop />
      {showThemeToggle ? (
        <ThemeToggle
          theme={theme}
          onToggle={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
        />
      ) : null}

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
          element={<NotFoundPage />}
        />
      </Routes>
    </>
  );
}
