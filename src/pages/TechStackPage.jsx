import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL, TECH_STACKS } from "../data";

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

    try {
      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
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
        <img src="/Logo/chat-logo.png" className="chat-float-icon" alt="Chat Logo" />
        <span>Chat with Gab</span>
      </button>

      <div className={`chat-box${isOpen ? " show" : ""}`} id="chatBox">
        <div className="chat-header">
          <div className="chat-header-left">
            <img src={avatarSrc} alt="Gabriel" className="chat-header-avatar theme-avatar" />
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
                <img src={avatarSrc} alt="Gabriel" className="message-avatar theme-avatar" />
                <div className="message-group">
                  <div className="sender-name">Gabriel Lazaro</div>
                  <div className="message bot-message">{message.text}</div>
                </div>
              </div>
            )
          )}

          {isBotReplying && (
            <div className="bot-row" id="typingMessage">
              <img src={avatarSrc} alt="Gabriel" className="message-avatar theme-avatar" />
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

export default function TechStackPage({ theme }) {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Gabriel Lazaro - IT Student";
  }, []);

  useEffect(() => {
    document.body.classList.add("cert-route");
    return () => document.body.classList.remove("cert-route");
  }, []);

  return (
    <>
      <div className="certifications-page tech-stack-page">
        <div className="container">
          <button className="back-btn" type="button" onClick={() => navigate("/")}>
            Back to Home
          </button>
          <h1 className="page-title">Tech Stack</h1>

          <div className="tech-stack-page-list">
            {TECH_STACKS.map((section) => (
              <section key={section.category} className="tech-stack-page-card">
                <h2 className="tech-stack-page-title">{section.category}</h2>
                <div className="tech-stack-page-tags">
                  {section.items.map((item) => (
                    <span key={`${section.category}-${item}`} className="tech-stack-page-tag">
                      {item}
                    </span>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>

        <footer className="site-footer home-footer cert-footer">
          <p>&copy; 2026 Gabriel Lazaro. All Rights Reserved.</p>
        </footer>
      </div>

      <ChatWidget theme={theme} />
    </>
  );
}
