import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  BACKEND_URL,
  GALLERY_IMAGES,
  HOME_CERTIFICATIONS,
  PROJECTS,
  SOCIAL_LINKS,
  TAGLINES,
  TECH_STACKS,
  TIMELINE
} from "../data";
import Seo from "../components/Seo";

const EMAIL_COOLDOWN_MS = 10 * 60 * 1000;
const EMAIL_COOLDOWN_STORAGE_KEY = "email_form_cooldown_until";

function CertificateModal({ imageSrc, onClose }) {
  useEffect(() => {
    if (!imageSrc) return undefined;

    function handleEscape(event) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [imageSrc, onClose]);

  return (
    <div className={`certificate-modal${imageSrc ? " show" : ""}`} id="certificateModal">
      <div className="certificate-modal-overlay" id="certificateModalOverlay" onClick={onClose}></div>
      <button className="certificate-modal-close" id="certificateModalClose" aria-label="Close modal" type="button" onClick={onClose}>
        &times;
      </button>
      <div className="certificate-modal-content">
        {imageSrc ? (
          <div className="certificate-modal-image-wrap">
            <img id="certificateModalImage" src={imageSrc} alt="Certificate Preview" decoding="async" />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function EmailModal({ isOpen, onClose }) {
  const formRef = useRef(null);
  const firstInputRef = useRef(null);
  const recaptchaRef = useRef(null);
  const recaptchaWidgetIdRef = useRef(null);
  const [statusText, setStatusText] = useState("");
  const [statusType, setStatusType] = useState("");
  const [showRecaptcha, setShowRecaptcha] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [showCooldownMessage, setShowCooldownMessage] = useState(false);
  const [isStatusFading, setIsStatusFading] = useState(false);
  const [statusCycle, setStatusCycle] = useState(0);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");

function getCooldownRemaining() {
  const storedValue = window.localStorage.getItem(EMAIL_COOLDOWN_STORAGE_KEY);
  if (!storedValue) return 0;

  const cooldownUntil = Number(storedValue);
  if (!Number.isFinite(cooldownUntil)) {
    window.localStorage.removeItem(EMAIL_COOLDOWN_STORAGE_KEY);
    return 0;
  }

  const remaining = cooldownUntil - Date.now();

  if (remaining <= 0) {
    window.localStorage.removeItem(EMAIL_COOLDOWN_STORAGE_KEY);
    return 0;
  }

  return remaining;
}

function formatCooldown(remainingMs) {
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
  
useEffect(() => {
  if (isOpen) return;

  const timeout = setTimeout(() => {
    resetForm();
    setStatusText("");
    setStatusType("");
  }, 250);

  return () => clearTimeout(timeout);
}, [isOpen]);

function handleNameChange(e) {
  const cleaned = e.target.value.replace(/[^A-Za-z\s]/g, "");
  setName(cleaned);
}

  useEffect(() => {
    document.body.classList.toggle("email-modal-open", isOpen);

    return () => {
      document.body.classList.remove("email-modal-open");
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    setCooldownRemaining(getCooldownRemaining());

    const interval = window.setInterval(() => {
      setCooldownRemaining(getCooldownRemaining());
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    if (!statusText.startsWith("Please wait ")) {
      setIsStatusFading(false);
      return undefined;
    }

    setIsStatusFading(false);

    const fadeTimeout = window.setTimeout(() => {
      setIsStatusFading(true);
    }, 2200);

    const clearTimeoutId = window.setTimeout(() => {
      setStatusText("");
      setStatusType("");
      setIsStatusFading(false);
    }, 2800);

    return () => {
      window.clearTimeout(fadeTimeout);
      window.clearTimeout(clearTimeoutId);
    };
  }, [statusText, statusCycle]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const timeout = window.setTimeout(() => {
      firstInputRef.current?.focus();
    }, 180);

    function handleEscape(event) {
      if (event.key === "Escape") handleClose();
    }

    document.addEventListener("keydown", handleEscape);
    return () => {
      window.clearTimeout(timeout);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    window.onCaptchaExpired = function onCaptchaExpired() {
      if (window.grecaptcha && recaptchaWidgetIdRef.current !== null) {
        try {
          window.grecaptcha.reset(recaptchaWidgetIdRef.current);
        } catch (error) {
          // noop
        }
      }

      setStatusText("Captcha expired. Please verify again.");
      setStatusType("error");
    };

    return () => {
      delete window.onCaptchaExpired;
    };
  }, []);

  useEffect(() => {
    if (!isOpen || !showRecaptcha) return undefined;

    let cancelled = false;
    let attempts = 0;

    function mountRecaptcha() {
      if (cancelled) return;

      if (!window.grecaptcha || !recaptchaRef.current) {
        attempts += 1;
        if (attempts < 30) {
          window.setTimeout(mountRecaptcha, 250);
        }
        return;
      }

      try {
        if (recaptchaWidgetIdRef.current === null) {
          recaptchaWidgetIdRef.current = window.grecaptcha.render(recaptchaRef.current, {
            sitekey: "6LfZW5ssAAAAAP3lTFeOynMuHmXaEiHilinp4R5J",
            "expired-callback": "onCaptchaExpired"
          });
        } else {
          window.grecaptcha.reset(recaptchaWidgetIdRef.current);
        }
      } catch (error) {
      }
    }

    mountRecaptcha();

    return () => {
      cancelled = true;
    };
  }, [isOpen, showRecaptcha]);

function resetForm(keepStatus = false) {
  formRef.current?.reset();
  setShowRecaptcha(true);
  setIsSubmitting(false);
  setShowCooldownMessage(false);
  setIsStatusFading(false);
  setName("");
  setMessage("");

  if (!keepStatus) {
    setStatusText("");
    setStatusType("");
  }

  if (window.grecaptcha && recaptchaWidgetIdRef.current !== null) {
    try {
      window.grecaptcha.reset(recaptchaWidgetIdRef.current);
    } catch (error) {}
  }
}

function handleClose() {
  onClose();
}

async function handleSubmit(event) {
  event.preventDefault();
  if (isSubmitting) return;

  const currentCooldown = getCooldownRemaining();

  if (currentCooldown > 0) {
    setCooldownRemaining(currentCooldown);
    setShowCooldownMessage(true);
    setIsStatusFading(false);
    setStatusCycle((current) => current + 1);
    setStatusText(`Please wait ${formatCooldown(currentCooldown)} before sending another message.`);
    setStatusType("error");
    return;
  }

  setStatusText("");
  setStatusType("");

  const captchaResponse =
    window.grecaptcha && recaptchaWidgetIdRef.current !== null
      ? window.grecaptcha.getResponse(recaptchaWidgetIdRef.current)
      : "";

  if (!captchaResponse) {
    setShowRecaptcha(true);
    setStatusText("Please complete the captcha first.");
    setStatusType("error");
    return;
  }

    const formData = new FormData(formRef.current);
    const payload = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      subject: String(formData.get("subject") || "").trim(),
      message: String(formData.get("message") || "").trim(),
      captchaResponse
    };

    setStatusText("Sending...");
    setStatusType("loading");
    setIsSubmitting(true);

    await new Promise(r => setTimeout(r, 800));

    try {
      const response = await fetch(`${BACKEND_URL}/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        const cooldownUntil = Date.now() + EMAIL_COOLDOWN_MS;
        window.localStorage.setItem(EMAIL_COOLDOWN_STORAGE_KEY, String(cooldownUntil));
        setCooldownRemaining(EMAIL_COOLDOWN_MS);
        setShowCooldownMessage(true);
        setStatusText(data.message || "Message sent successfully.");
        setStatusType("success");

        window.setTimeout(() => {
          handleClose();
        }, 1400);
      } else {
        setStatusText(data.message || "Failed to send message. Please try again.");
        setStatusType("error");
      }
    } catch (error) {
      setStatusText("Network error. Please try again.");
      setStatusType("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  const visibleStatusText = statusText;
  const visibleStatusType = statusType;
  const isSubmitDisabled = isSubmitting;
  const submitLabel = isSubmitting ? "Sending..." : "Send message";

  return (
    <div className={`email-modal${isOpen ? " show" : ""}`}>
      <div className="email-modal-card">
        <button className="email-modal-close" type="button" onClick={handleClose} aria-label="Close email form">
          &times;
        </button>
        <h2>Send a message</h2>
        <p className="email-modal-subtext">Feel free to reach out anytime.</p>

        <form id="emailForm" className="email-form" ref={formRef} onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="emailName">Name</label>
              <input ref={firstInputRef} type="text" name="name" placeholder="Your name" maxLength="40" id="emailName" required value={name} onChange={handleNameChange} />
            </div>
            <div className="form-field">
              <label htmlFor="emailAddress">Email</label>
              <input type="email" name="email" placeholder="you@example.com" maxLength="50" id="emailAddress" required />
            </div>
          </div>
          <div className="form-field">
            <label htmlFor="emailSubject">Subject</label>
            <input type="text" name="subject" placeholder="What's this about?" id="emailSubject" maxLength="100" required />
          </div>
          <div className="form-field">
            <label htmlFor="emailMessage">Message</label>
            <textarea name="message" placeholder="Write your message here..." id="emailMessage" rows="6" required maxLength="500" value={message} onChange={(e) => setMessage(e.target.value)}></textarea>
            <div className="char-counter">
              {message.length}/500
            </div>
          </div>
          <div id="recaptchaWrap" className={`recaptcha-wrap${showRecaptcha ? " show" : ""}`}>
            <div ref={recaptchaRef} className="g-recaptcha"></div>
          </div>
          <button type="submit" className="email-submit-btn" disabled={isSubmitDisabled}>{submitLabel}</button>
          <p id="emailFormStatus" className={`email-form-status${visibleStatusType ? ` ${visibleStatusType}` : ""}${isStatusFading ? " is-fading" : ""}`}>{visibleStatusText}</p>
        </form>
      </div>
    </div>
  );
}

function ChatWidget({ theme }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isBotReplying, setIsBotReplying] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Hi there! Thanks for visiting my website. Feel free to ask me anything about my portfolio, projects, or skills."
    }
  ]);
  const chatBodyRef = useRef(null);
  const inputRef = useRef(null);
  const avatarSrc = theme === "dark" ? "/Images/dark.png" : "/Images/light.png";

  useEffect(() => {
    if (!isOpen) return undefined;
    const timeout = window.setTimeout(() => inputRef.current?.focus(), 220);
    return () => window.clearTimeout(timeout);
  }, [isOpen]);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, isBotReplying]);

  async function sendMessage() {
    const message = input.trim();
    if (!message || isBotReplying) return;

    setMessages((current) => [...current, { role: "user", text: message }]);
    setInput("");
    setIsBotReplying(true);

    const history = messages.slice(-6).map((entry) => ({
      role: entry.role,
      text: entry.text
    }));

    try {
      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history })
      });
      const data = await response.json();
      setMessages((current) => [...current, { role: "bot", text: data.reply || "Sorry, no response generated." }]);
    } catch (error) {
      setMessages((current) => [...current, { role: "bot", text: "Server error. Please try again." }]);
    } finally {
      setIsBotReplying(false);
    }
  }

  return (
    <>
      <button className="chat-float" type="button" onClick={() => setIsOpen((current) => !current)}>
        <img src="/Logo/chat-logo.png" className="chat-float-icon" alt="Chat Logo" loading="lazy" decoding="async" />
        <span>Chat with Gab</span>
      </button>

      <div className={`chat-box${isOpen ? " show" : ""}`} id="chatBox">
        <div className="chat-header">
          <div className="chat-header-left">
            <img src={avatarSrc} alt="Gabriel" className="chat-header-avatar theme-avatar" loading="lazy" decoding="async" />
            <div className="chat-header-info">
              <h3>Chat with Gab</h3>
              <div className="chat-status">
                <span className="status-dot"></span>
                <span>Online</span>
              </div>
            </div>
          </div>
          <button className="close-chat" type="button" onClick={() => setIsOpen(false)}>&times;</button>
        </div>

        <div className="chat-body" id="chatBody" ref={chatBodyRef}>
          {messages.map((message, index) =>
            message.role === "user" ? (
              <div key={`user-${index}`} className="user-row">
                <div className="message-group">
                  <div className="message user-message">{message.text}</div>
                </div>
              </div>
            ) : (
              <div key={`bot-${index}`} className="bot-row">
                <img src={avatarSrc} alt="Gabriel" className="message-avatar theme-avatar" loading="lazy" decoding="async" />
                <div className="message-group">
                  <div className="sender-name">Gabriel Lazaro</div>
                  <div className="message bot-message">{message.text}</div>
                </div>
              </div>
            )
          )}

          {isBotReplying && (
            <div className="bot-row" id="typingMessage">
              <img src={avatarSrc} alt="Gabriel" className="message-avatar theme-avatar" loading="lazy" decoding="async" />
              <div className="message-group">
                <div className="sender-name">Gabriel Lazaro</div>
                <div className="message bot-message typing-bubble">
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="chat-footer-wrap">
          <div className="chat-footer">
            <input
              ref={inputRef}
              type="text"
              placeholder="Type a message..."
              id="chatInput"
              maxLength="1000"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  sendMessage();
                }
              }}
            />
            <button
              className={`send-btn${input.trim() && !isBotReplying ? " active" : ""}`}
              id="sendBtn"
              type="button"
              onClick={sendMessage}
              disabled={!input.trim() || isBotReplying}
            >
              &#10148;
            </button>
          </div>

          <div className="chat-footer-bottom">
            <span>Ask me about programming, web dev, or tech!</span>
            <span id="charCount">{input.length}/1000</span>
          </div>
        </div>
      </div>
    </>
  );
}

function Gallery() {
  const sliderRef = useRef(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);
  const selectedImage = selectedImageIndex === null
    ? null
    : {
        src: GALLERY_IMAGES[selectedImageIndex],
        alt: `Gallery Image ${selectedImageIndex + 1}`
      };

  useEffect(() => {
    document.body.classList.toggle("lightbox-open", Boolean(selectedImage));
  }, [selectedImage]);

  useEffect(() => {
    function updateNav() {
      const slider = sliderRef.current;
      if (!slider) return;

      const maxScrollLeft = slider.scrollWidth - slider.clientWidth;
      const currentScroll = slider.scrollLeft;
      const allowance = 4;

      setIsAtStart(currentScroll <= allowance);
      setIsAtEnd(currentScroll >= maxScrollLeft - allowance || maxScrollLeft <= 0);
    }

    const slider = sliderRef.current;
    if (!slider) return undefined;

    updateNav();
    slider.addEventListener("scroll", updateNav, { passive: true });
    window.addEventListener("resize", updateNav);

    return () => {
      slider.removeEventListener("scroll", updateNav);
      window.removeEventListener("resize", updateNav);
    };
  }, []);

  useEffect(() => {
    if (!selectedImage) return undefined;

    function handleEscape(event) {
      if (event.key === "Escape") {
        setSelectedImageIndex(null);
      }

      if (event.key === "ArrowLeft") {
        setSelectedImageIndex((current) => (current === null || current <= 0 ? current : current - 1));
      }

      if (event.key === "ArrowRight") {
        setSelectedImageIndex((current) =>
          current === null || current >= GALLERY_IMAGES.length - 1 ? current : current + 1
        );
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [selectedImage]);

  function showPreviousImage() {
    setSelectedImageIndex((current) => (current === null || current <= 0 ? current : current - 1));
  }

  function showNextImage() {
    setSelectedImageIndex((current) =>
      current === null || current >= GALLERY_IMAGES.length - 1 ? current : current + 1
    );
  }

  function getGalleryStep() {
    const slider = sliderRef.current;
    if (!slider) return 0;
    const firstImage = slider.querySelector(".gallery-img");
    if (!firstImage) return 0;
    const imageWidth = firstImage.offsetWidth;
    const gap = parseInt(window.getComputedStyle(slider).gap, 10) || 0;
    return imageWidth + gap;
  }

  function scrollGallery(direction) {
    const slider = sliderRef.current;
    if (!slider) return;
    const maxScrollLeft = slider.scrollWidth - slider.clientWidth;
    const step = getGalleryStep() || 336;
    let targetScroll = slider.scrollLeft + direction * step;
    if (targetScroll < 0) targetScroll = 0;
    if (targetScroll > maxScrollLeft) targetScroll = maxScrollLeft;
    slider.scrollTo({ left: targetScroll, behavior: "smooth" });
  }

  return (
    <>
      <div className="gallery-container">
        <h2>Gallery</h2>
        <div className="gallery-slider-wrap">
          <button className={`gallery-nav gallery-prev${isAtStart ? " is-disabled" : ""}`} type="button" onClick={() => scrollGallery(-1)} aria-label="Previous" disabled={isAtStart}>
            &#8249;
          </button>
          <div className="gallery-slider" id="gallerySlider" ref={sliderRef}>
            {GALLERY_IMAGES.map((image, index) => (
              <img
                key={image}
                src={image}
                alt={`Gallery Image ${index + 1}`}
                className="gallery-img"
                loading="lazy"
                decoding="async"
                onClick={() => setSelectedImageIndex(index)}
              />
            ))}
          </div>
          <button className={`gallery-nav gallery-next${isAtEnd ? " is-disabled" : ""}`} type="button" onClick={() => scrollGallery(1)} aria-label="Next" disabled={isAtEnd}>
            &#8250;
          </button>
        </div>
      </div>

      <div className={`gallery-lightbox${selectedImage ? " show" : ""}`} id="galleryLightbox" onClick={(e) => e.target.id === "galleryLightbox" && setSelectedImageIndex(null)}>
        <button className="lightbox-close" type="button" aria-label="Close preview" onClick={() => setSelectedImageIndex(null)}>
          &times;
        </button>
        <button
          className={`lightbox-nav lightbox-prev${selectedImageIndex === 0 ? " is-disabled" : ""}`}
          type="button"
          aria-label="Previous image"
          onClick={showPreviousImage}
          disabled={selectedImageIndex === 0}
        >
          &#8249;
        </button>
        <img className="lightbox-image" src={selectedImage?.src || ""} alt={selectedImage?.alt || ""} decoding="async" />
        <button
          className={`lightbox-nav lightbox-next${selectedImageIndex === GALLERY_IMAGES.length - 1 ? " is-disabled" : ""}`}
          type="button"
          aria-label="Next image"
          onClick={showNextImage}
          disabled={selectedImageIndex === GALLERY_IMAGES.length - 1}
        >
          &#8250;
        </button>
      </div>
    </>
  );
}

export default function HomePage({ theme, certificatePreview, onOpenCertificate, onCloseCertificate }) {
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [currentTagline, setCurrentTagline] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth);
  const isDark = theme === "dark";

  function getTechStackPreviewLimit(category) {
    if (viewportWidth <= 768) {
      const mobileLimits = {
        Frontend: 4,
        Backend: 4,
        "Programming Languages": 3,
        "AI / Tools": 4
      };

      return mobileLimits[category] ?? 4;
    }

    if (viewportWidth <= 1024) {
      const tabletLimits = {
        Frontend: 6,
        Backend: 6,
        "Programming Languages": 3,
        "AI / Tools": 6
      };

      return tabletLimits[category] ?? 6;
    }

    const desktopLimits = {
      Frontend: 6,
      Backend: 6,
      "Programming Languages": 3,
      "AI / Tools": 7
    };

    return desktopLimits[category] ?? 6;
  }

  useEffect(() => {
    document.body.classList.add("home-route");

    return () => {
      document.body.classList.remove("home-route");
    };
  }, []);

  useEffect(() => {
    function handleResize() {
      setViewportWidth(window.innerWidth);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentTagline((current) => (current + 1) % TAGLINES.length);
    }, 3500);

    return () => window.clearInterval(interval);
  }, []);

  async function downloadCV() {
    const cvUrl = `/Files/Gabriel-Lazaro-CV.pdf?v=${Date.now()}`;

    try {
      const response = await fetch(cvUrl, { cache: "no-store" });

      if (!response.ok) {
        throw new Error("Failed to fetch CV file.");
      }

      const blob = await response.blob();

      if (!blob.size) {
        throw new Error("Downloaded CV file is empty.");
      }

      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = "Gabriel-Lazaro-CV.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(objectUrl);
    } catch (error) {
      const fallbackLink = document.createElement("a");
      fallbackLink.href = "/Files/Gabriel-Lazaro-CV.pdf";
      fallbackLink.download = "Gabriel-Lazaro-CV.pdf";
      document.body.appendChild(fallbackLink);
      fallbackLink.click();
      document.body.removeChild(fallbackLink);
    }
  }

  return (
    <>
      <Seo
        description="Explore the portfolio of Gabriel Lazaro, an IT student from Metro Manila showcasing projects, certifications, tech stack, and contact information."
        path="/"
      />
      <div className="home-page">
        <div className="profile-header">
          <div className="avatar-stack">
            <img className={`avatar theme-img light-avatar${!isDark ? " active" : ""}`} src="/Images/light.png" alt="Profile Picture" fetchPriority="high" />
            <img className={`avatar theme-img dark-avatar${isDark ? " active" : ""}`} src="/Images/dark.png" alt="Profile Picture Dark" fetchPriority="high" />
          </div>

          <div className="info">
            <div className="name-row">
              <h1 className="name">Gabriel Lazaro</h1>
              <img src="/Logo/Blue_Check.png" className="badge-icon" alt="Verified" loading="lazy" decoding="async" />
            </div>

            <p className="location">
              <img src="/Logo/Location.png" className="loc-icon" alt="" loading="lazy" decoding="async" />
              Metro Manila, Philippines
            </p>

            <p className="role">Aspiring Software / AI Engineer</p>

            <div className="actions">
              <a href="https://calendly.com/gabriellazaro0808/30min" target="_blank" rel="noopener noreferrer" className="primary schedule-link schedule-cta">
                <img src="/Logo/Schedule_Call.png" className="btn-icon" alt="" loading="lazy" decoding="async" />
                Schedule a Call
              </a>

              <button type="button" className="ghost email-cta" onClick={() => setEmailModalOpen(true)}>
                <img src="/Logo/Send_Email.png" className="btn-icon" alt="" loading="lazy" decoding="async" />
                Send Email
              </button>

              <button type="button" className="ghost download-btn download-cta" onClick={downloadCV}>
                <img src="/Logo/Download.png" className="btn-icon" alt="" loading="lazy" decoding="async" />
                Download CV <span className="arrow">&rsaquo;</span>
              </button>
            </div>
          </div>
        </div>

        <EmailModal isOpen={emailModalOpen} onClose={() => setEmailModalOpen(false)} />

        <div className="about-id-section">
          <div className="left-column">
            <div className="about-container">
              <h2>About</h2>
              <p>I'm a Bachelor of Science in Information Technology student at PHINMA Saint Jude College - Manila. I enjoy learning new technologies and building web projects that strengthen my skills and support my academic growth.</p>
              <p>I have experience in web development and building web-based applications. I like creating simple, functional, and user-friendly systems while continuously improving my problem-solving and technical skills.</p>
              <p>I aspire to become a Software / AI Engineer who builds intelligent, user-friendly, and impactful systems that solve real-world problems. I am passionate about combining software development and artificial intelligence to create innovative solutions that improve efficiency, enhance user experience, and make everyday processes more effective.</p>
            </div>

<div className="tech-stack-container">
  <div className="tech-stack-header">
    <h2>Tech Stack</h2>
    <Link to="/tech-stack" className="view-all-btn-tech">View All</Link>
  </div>
  {TECH_STACKS.map((section) => (
      <div key={section.category} className="tech-stack-section">
      <h4>{section.category}</h4>
      <div className="tech-tags tech-tags-preview">
        {section.items.slice(0, getTechStackPreviewLimit(section.category)).map((item) => (
          <span key={`${section.category}-${item}`}>{item}</span>
        ))}
      </div>
    </div>
  ))}
</div>

<div className="recent-projects-container">
  <div className="recent-projects-header">
    <h2>Recent Projects</h2>
    <Link to="/projects" className="view-all-btn-proj">View All</Link>
  </div>

  <div className="projects-grid two-projects">
    {PROJECTS.map((project) => (
      <a
        key={project.title}
        href={project.href}
        target="_blank"
        rel="noopener noreferrer"
        className="project-card small-project-card"
      >
        <h3>{project.title}</h3>
        <p>{project.description}</p>
        <span className="project-domain">{project.domain}</span>
      </a>
    ))}
  </div>
</div>

            <div className="certificates-container">
              <div className="certificates-header">
                <h2>Certifications</h2>
                <Link to="/certifications" className="view-all-btn">View All</Link>
              </div>

              <div className="certificates-list">
                {HOME_CERTIFICATIONS.map((cert) => (
                  <button key={cert.title} type="button" className="certificate-item" onClick={() => onOpenCertificate(cert.image)}>
                    <div className="certificate-info">
                      <h4>{cert.title}</h4>
                      <p>{cert.issuer}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="right-column">
            <div className="id-wrapper">
              <img src="/Images/Student_ID.jpg" className="student-id" alt="Student ID" loading="lazy" decoding="async" />
            </div>

            <div className="experience-container">
              <h2>Experience</h2>
              <div className="timeline">
                {TIMELINE.map((item) => (
                  <div key={`${item.title}-${item.date}`} className={`timeline-item${item.active ? " active" : ""}`}>
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <div className="timeline-top">
                        <h4>{item.title}</h4>
                        <span>{item.date}</span>
                      </div>
                      <p>{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="social-links-container">
              <h2 className="side-card-title">Social Links</h2>
                <div className="social-links-list">
                  {SOCIAL_LINKS.map((item) => (
                    <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" className="social-link-item">
                      <img src={item.icon} alt={item.label} loading="lazy" decoding="async" />
                      <span>{item.label}</span>
                    </a>
                  ))}
                </div>
            </div>

            <div className="motto-container">
              <div className="tagline-section">
                <h2 className="side-card-title tagline-label">Motto</h2>
                <p className="tagline-text" id="taglineText">{TAGLINES[currentTagline]}</p>
                <div className="tagline-dots" id="taglineDots">
                  {TAGLINES.map((tagline, index) => (
                    <button key={tagline} className={`tagline-dot${currentTagline === index ? " active" : ""}`} type="button" onClick={() => setCurrentTagline(index)} aria-label={`Tagline ${index + 1}`}></button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Gallery />
        <footer className="site-footer home-footer">
          <p>&copy; 2026 Gabriel Lazaro. All Rights Reserved.</p>
        </footer>
      </div>

      <ChatWidget theme={theme} />
      <CertificateModal imageSrc={certificatePreview} onClose={onCloseCertificate} />
    </>
  );
}

