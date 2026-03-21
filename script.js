function downloadCV() {
  const link = document.createElement("a");
  link.href = "Gabriel-Lazaro-CV.pdf";
  link.download = "Gabriel-Lazaro-CV.pdf";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function updateThemeAvatars(theme) {
  const themeAvatars = document.querySelectorAll(".theme-avatar");
  const chatAvatarSrc = theme === "dark" ? "dark.png" : "light.png";

  themeAvatars.forEach(img => {
    img.src = chatAvatarSrc;
  });
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

    const currentTheme = document.body.classList.contains("dark-mode") ? "dark" : "light";
    updateThemeAvatars(currentTheme);

    setTimeout(() => {
      if (input) input.focus();
    }, 220);
  }
}

function scrollChatToBottom() {
  const chatBody = document.getElementById("chatBody");
  if (chatBody) {
    chatBody.scrollTop = chatBody.scrollHeight;
  }
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
      <div class="message bot-message">Typing...</div>
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
  if (!input) return;

  const message = input.value.trim();
  if (!message) return;

  addUserMessage(message);
  input.value = "";
  updateCharCount();

  addTypingMessage(); 

  try {
    const response = await fetch("https://portfolio-backend-1-aupt.onrender.com/chat", {
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
  }
}

function updateCharCount() {
  const input = document.getElementById("chatInput");
  const charCount = document.getElementById("charCount");
  const sendBtn = document.getElementById("sendBtn");

  if (input && charCount) {
    const message = input.value.trim();
    charCount.textContent = `${input.value.length}/1000`;

    if (sendBtn) {
      sendBtn.disabled = message === "";
    }
  }
}

function applyTheme(theme) {
  const body = document.body;
  const themeText = document.querySelector(".theme-text");
  const themeIcon = document.querySelector(".theme-icon");

  const lightAvatar = document.querySelector(".light-avatar");
  const darkAvatar = document.querySelector(".dark-avatar");

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

  updateThemeAvatars(theme);
}

function toggleTheme() {
  const isDark = document.body.classList.contains("dark-mode");
  const nextTheme = isDark ? "light" : "dark";

  localStorage.setItem("theme", nextTheme);
  applyTheme(nextTheme);
}

document.addEventListener("DOMContentLoaded", function () {
  const input = document.getElementById("chatInput");
  const savedTheme = localStorage.getItem("theme") || "light";

  applyTheme(savedTheme);
  updateThemeAvatars(savedTheme);

  if (input) {
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        sendMessage();
      }
    });

    input.addEventListener("input", updateCharCount);
    updateCharCount();
  }
});
