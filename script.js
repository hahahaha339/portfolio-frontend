const BACKEND_URL = "https://portfolio-backend-1-aupt.onrender.com";
let isBotReplying = false;

function downloadCV() {
  const link = document.createElement("a");
  link.href = "Gabriel-Lazaro-CV.pdf";
  link.download = "Gabriel-Lazaro-CV.pdf";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function toggleChat() {
  const chatBox = document.getElementById("chatBox");
  const input = document.getElementById("chatInput");

  if (!chatBox) return;

  const isOpen = chatBox.classList.contains("show");

  if (isOpen) {
    chatBox.classList.remove("show");
  } else {
    chatBox.classList.add("show");
    setTimeout(() => {
      if (input) input.focus();
    }, 220);
  }
}

function scrollChatToBottom() {
  const chatBody = document.getElementById("chatBody");
  if (!chatBody) return;
  chatBody.scrollTop = chatBody.scrollHeight;
}

function addUserMessage(message) {
  const chatBody = document.getElementById("chatBody");
  if (!chatBody) return;

  const userRow = document.createElement("div");
  userRow.className = "user-row";

  userRow.innerHTML = `
    <div class="message-group">
      <div class="message user-message">${message}</div>
    </div>
  `;

  chatBody.appendChild(userRow);
  scrollChatToBottom();
}

function addBotMessage(message) {
  const chatBody = document.getElementById("chatBody");
  if (!chatBody) return;

  const isDark = document.body.classList.contains("dark-mode");
  const avatarSrc = isDark ? "dark.png" : "light.png";

  const botRow = document.createElement("div");
  botRow.className = "bot-row";

  botRow.innerHTML = `
    <img src="${avatarSrc}" alt="Gabriel" class="message-avatar theme-avatar">
    <div class="message-group">
      <div class="sender-name">Gabriel Lazaro</div>
      <div class="message bot-message">${message}</div>
    </div>
  `;

  chatBody.appendChild(botRow);
  scrollChatToBottom();
}

function addTypingMessage() {
  const chatBody = document.getElementById("chatBody");
  if (!chatBody) return;

  const isDark = document.body.classList.contains("dark-mode");
  const avatarSrc = isDark ? "dark.png" : "light.png";

  const typingRow = document.createElement("div");
  typingRow.className = "bot-row";
  typingRow.id = "typingMessage";

  typingRow.innerHTML = `
    <img src="${avatarSrc}" alt="Gabriel" class="message-avatar theme-avatar">
    <div class="message-group">
      <div class="sender-name">Gabriel Lazaro</div>
      <div class="message bot-message typing-bubble">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
    </div>
  `;

  chatBody.appendChild(typingRow);
  scrollChatToBottom();
}

function removeTypingMessage() {
  const typing = document.getElementById("typingMessage");
  if (typing) typing.remove();
}

async function sendMessage() {
  const input = document.getElementById("chatInput");
  const sendBtn = document.getElementById("sendBtn");

  if (!input || isBotReplying) return;

  const message = input.value.trim();
  if (!message) return;

  isBotReplying = true;

  addUserMessage(message);
  input.value = "";
  updateCharCount();

  addTypingMessage();

  if (sendBtn) {
    sendBtn.disabled = true;
    sendBtn.classList.remove("active");
  }

  try {
    const response = await fetch(`${BACKEND_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message })
    });

    const data = await response.json();

    removeTypingMessage();
    addBotMessage(data.reply || "Sorry, no response generated.");
  } catch (error) {
    removeTypingMessage();
    addBotMessage("Server error. Please try again.");
  } finally {
    isBotReplying = false;
    updateCharCount();
  }
}

function updateCharCount() {
  const input = document.getElementById("chatInput");
  const charCount = document.getElementById("charCount");
  const sendBtn = document.getElementById("sendBtn");

  if (input && charCount) {
    const message = input.value.trim();
    const hasText = message !== "";

    charCount.textContent = `${input.value.length}/1000`;

    if (sendBtn) {
      const shouldEnable = hasText && !isBotReplying;
      sendBtn.disabled = !shouldEnable;
      sendBtn.classList.toggle("active", shouldEnable);
    }
  }
}

function applyTheme(theme) {
  const body = document.body;
  const themeText = document.querySelector(".theme-text");
  const themeIcon = document.querySelector(".theme-icon");

  const lightAvatar = document.querySelector(".light-avatar");
  const darkAvatar = document.querySelector(".dark-avatar");

  const themeAvatars = document.querySelectorAll(".theme-avatar");
  const chatAvatarSrc = theme === "dark" ? "dark.png" : "light.png";

  if (theme === "dark") {
    body.classList.add("dark-mode");
    if (themeText) themeText.textContent = "Light";
    if (themeIcon) themeIcon.textContent = "☀️";

    if (lightAvatar) lightAvatar.classList.remove("active");
    if (darkAvatar) darkAvatar.classList.add("active");
  } else {
    body.classList.remove("dark-mode");
    if (themeText) themeText.textContent = "Dark";
    if (themeIcon) themeIcon.textContent = "🌙";

    if (darkAvatar) darkAvatar.classList.remove("active");
    if (lightAvatar) lightAvatar.classList.add("active");
  }

  themeAvatars.forEach((img) => {
    img.src = chatAvatarSrc;
  });
}

function toggleTheme() {
  const isDark = document.body.classList.contains("dark-mode");
  const nextTheme = isDark ? "light" : "dark";

  localStorage.setItem("theme", nextTheme);
  applyTheme(nextTheme);
}

function getGalleryStep() {
  const slider = document.getElementById("gallerySlider");
  if (!slider) return 0;

  const firstImage = slider.querySelector(".gallery-img");
  if (!firstImage) return 0;

  const imageWidth = firstImage.offsetWidth;
  const gap = parseInt(window.getComputedStyle(slider).gap) || 0;

  return imageWidth + gap;
}

function updateGalleryNav() {
  const slider = document.getElementById("gallerySlider");
  const prevBtn = document.querySelector(".gallery-prev");
  const nextBtn = document.querySelector(".gallery-next");

  if (!slider || !prevBtn || !nextBtn) return;

  const maxScrollLeft = slider.scrollWidth - slider.clientWidth;
  const currentScroll = slider.scrollLeft;
  const allowance = 4;

  const isAtStart = currentScroll <= allowance;
  const isAtEnd = currentScroll >= maxScrollLeft - allowance || maxScrollLeft <= 0;

  prevBtn.disabled = isAtStart;
  nextBtn.disabled = isAtEnd;

  prevBtn.classList.toggle("is-disabled", isAtStart);
  nextBtn.classList.toggle("is-disabled", isAtEnd);
}

function scrollGallery(direction) {
  const slider = document.getElementById("gallerySlider");
  if (!slider) return;

  const maxScrollLeft = slider.scrollWidth - slider.clientWidth;
  const currentScroll = slider.scrollLeft;
  const step = getGalleryStep() || 336;
  const allowance = 4;

  let targetScroll = currentScroll + (direction * step);

  if (targetScroll < 0) targetScroll = 0;
  if (targetScroll > maxScrollLeft) targetScroll = maxScrollLeft;

  if (
    (direction > 0 && currentScroll >= maxScrollLeft - allowance) ||
    (direction < 0 && currentScroll <= allowance)
  ) {
    updateGalleryNav();
    return;
  }

  slider.scrollTo({
    left: targetScroll,
    behavior: "smooth"
  });

  setTimeout(updateGalleryNav, 250);
}

function createGalleryLightbox() {
  if (document.getElementById("galleryLightbox")) return;

  const lightbox = document.createElement("div");
  lightbox.id = "galleryLightbox";
  lightbox.className = "gallery-lightbox";
  lightbox.innerHTML = `
    <button class="lightbox-close" aria-label="Close preview">&times;</button>
    <img class="lightbox-image" src="" alt="Gallery preview">
  `;

  document.body.appendChild(lightbox);

  const closeBtn = lightbox.querySelector(".lightbox-close");

  function closeLightbox() {
    lightbox.classList.remove("show");
    document.body.classList.remove("lightbox-open");
  }

  closeBtn.addEventListener("click", closeLightbox);

  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && lightbox.classList.contains("show")) {
      closeLightbox();
    }
  });
}

function openGalleryLightbox(imageSrc, imageAlt = "Gallery preview") {
  const lightbox = document.getElementById("galleryLightbox");
  if (!lightbox) return;

  const lightboxImage = lightbox.querySelector(".lightbox-image");
  lightboxImage.src = imageSrc;
  lightboxImage.alt = imageAlt;

  lightbox.classList.add("show");
  document.body.classList.add("lightbox-open");
}

function initGalleryLightbox() {
  createGalleryLightbox();

  const galleryImages = document.querySelectorAll(".gallery-img");
  if (!galleryImages.length) return;

  galleryImages.forEach((img) => {
    img.style.cursor = "zoom-in";

    img.addEventListener("click", function () {
      openGalleryLightbox(this.src, this.alt || "Gallery preview");
    });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const input = document.getElementById("chatInput");
  const slider = document.getElementById("gallerySlider");
  const emailForm = document.getElementById("emailForm");
  const emailModal = document.getElementById("emailModal");
  const sendBtn = document.getElementById("sendBtn");

  const savedTheme = localStorage.getItem("theme") || "light";
  applyTheme(savedTheme);

  if (input) {
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        if (isBotReplying) return;
        sendMessage();
      }
    });

    input.addEventListener("input", updateCharCount);
    updateCharCount();
  }

  if (sendBtn) {
    sendBtn.addEventListener("click", function () {
      if (isBotReplying) return;
      sendMessage();
    });
  }

  if (slider) {
    slider.addEventListener("scroll", updateGalleryNav, { passive: true });
    window.addEventListener("resize", updateGalleryNav);
    updateGalleryNav();
  }

  if (emailForm) {
    emailForm.addEventListener("submit", submitEmailForm);
  }

  if (emailModal) {
    emailModal.addEventListener("click", function (e) {
      if (e.target === emailModal) {
        closeEmailModal();
      }
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeEmailModal();
    }
  });

  initGalleryLightbox();

const certificateItems = document.querySelectorAll(".certificate-item");
const certificateModal = document.getElementById("certificateModal");
const certificateModalOverlay = document.getElementById("certificateModalOverlay");
const certificateModalClose = document.getElementById("certificateModalClose");
const certificateModalImage = document.getElementById("certificateModalImage");

function openCertificateModal(imageSrc) {
  if (!certificateModal || !certificateModalImage) return;

  certificateModalImage.src = imageSrc;
  certificateModalImage.alt = "Certificate Preview";

  certificateModal.classList.add("show");
  document.body.classList.add("modal-open");
}

function closeCertificateModal() {
  if (!certificateModal || !certificateModalImage) return;

  certificateModal.classList.remove("show");
  document.body.classList.remove("modal-open");

  setTimeout(() => {
    if (!certificateModal.classList.contains("show")) {
      certificateModalImage.src = "";
    }
  }, 250);
}

if (
  certificateItems.length &&
  certificateModal &&
  certificateModalOverlay &&
  certificateModalClose &&
  certificateModalImage
) {
  certificateItems.forEach((item) => {
    item.addEventListener("click", function () {
      const imageSrc = this.getAttribute("data-cert");
      if (!imageSrc) return;
      openCertificateModal(imageSrc);
    });
  });

  certificateModalClose.addEventListener("click", closeCertificateModal);
  certificateModalOverlay.addEventListener("click", closeCertificateModal);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && certificateModal.classList.contains("show")) {
      closeCertificateModal();
    }
  });
}
});

function openEmailModal() {
  const modal = document.getElementById("emailModal");
  if (!modal) return;

  modal.classList.add("show");
  document.body.classList.add("email-modal-open");

  const firstInput = document.getElementById("emailName");
  if (firstInput) {
    setTimeout(() => firstInput.focus(), 180);
  }
}

function closeEmailModal() {
  const modal = document.getElementById("emailModal");
  const status = document.getElementById("emailFormStatus");
  const recaptchaWrap = document.getElementById("recaptchaWrap");
  const form = document.getElementById("emailForm");

  if (!modal) return;

  modal.classList.remove("show");
  document.body.classList.remove("email-modal-open");

  if (form) {
    form.reset();
  }

  if (status) {
    status.textContent = "";
    status.classList.remove("success", "error");
  }

  if (recaptchaWrap) {
    recaptchaWrap.classList.remove("show");
  }

  if (typeof grecaptcha !== "undefined") {
    try {
      grecaptcha.reset();
    } catch (e) {}
  }
}

async function submitEmailForm(event) {
  event.preventDefault();

  const form = document.getElementById("emailForm");
  const status = document.getElementById("emailFormStatus");
  const submitBtn = form ? form.querySelector(".email-submit-btn") : null;
  const recaptchaWrap = document.getElementById("recaptchaWrap");

  if (!form || !status || !submitBtn) return;

  status.classList.remove("success", "error");

  const captchaResponse =
    typeof grecaptcha !== "undefined" ? grecaptcha.getResponse() : "";

  if (!captchaResponse) {
    if (recaptchaWrap && !recaptchaWrap.classList.contains("show")) {
      recaptchaWrap.classList.add("show");
    }

    status.textContent = "Please complete the captcha first.";
    status.classList.add("error");
    return;
  }

  const formData = new FormData(form);

  status.textContent = "Sending...";
  submitBtn.disabled = true;

  try {
    const response = await fetch("https://formspree.io/f/mvgrnjpd", {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json"
      }
    });

    if (response.ok) {
      form.reset();

      if (typeof grecaptcha !== "undefined") {
        grecaptcha.reset();
      }

      if (recaptchaWrap) {
        recaptchaWrap.classList.remove("show");
      }

      status.textContent = "Message sent successfully.";
      status.classList.remove("error");
      status.classList.add("success");

      setTimeout(() => {
        closeEmailModal();
        status.textContent = "";
        status.classList.remove("success", "error");
      }, 1400);
} else {
  if (typeof grecaptcha !== "undefined") {
    grecaptcha.reset();
  }

  if (recaptchaWrap) {
    recaptchaWrap.classList.remove("show");
  }

  status.textContent = "Failed to send message. Please try again.";
  status.classList.remove("success");
  status.classList.add("error");
}
} catch (error) {
  if (typeof grecaptcha !== "undefined") {
    grecaptcha.reset();
  }

  if (recaptchaWrap) {
    recaptchaWrap.classList.remove("show");
  }

  status.textContent = "Network error. Please try again.";
  status.classList.remove("success");
  status.classList.add("error");
} finally {
    submitBtn.disabled = false;
  }
}

function onCaptchaExpired() {
  const status = document.getElementById("emailFormStatus");

  if (typeof grecaptcha !== "undefined") {
    grecaptcha.reset();
  }

if (status) {
  status.textContent = "Captcha expired. Please verify again.";
  status.classList.remove("success", "error");
  status.classList.add("error");
}
}

// TAGLINE SECTION
(function () {
  const taglines = [
    "Building one project at a time.",
    "Code. Learn. Repeat.",
    "Turning ideas into working software.",
    "Writing code, solving problems.",
    "Turning logic into experience.",
    "Where ideas meet execution.",
    "Functional. Simple. Effective."
  ];
  let currentTagline = 0;
  let taglineInterval = null;

  window.switchTagline = function (index) {
    const el = document.getElementById("taglineText");
    const dots = document.querySelectorAll(".tagline-dot");

    if (!el || !dots.length) return;

    el.style.opacity = "0";

    setTimeout(function () {
      currentTagline = index;
      el.textContent = taglines[index];
      el.style.opacity = "1";
    }, 200);

    dots.forEach(function (dot, i) {
      dot.classList.toggle("active", i === index);
    });

    clearInterval(taglineInterval);
    taglineInterval = setInterval(autoRotateTagline, 3500);
  };

  function autoRotateTagline() {
    switchTagline((currentTagline + 1) % taglines.length);
  }

  document.addEventListener("DOMContentLoaded", function () {
    taglineInterval = setInterval(autoRotateTagline, 3500);
  });
})();
