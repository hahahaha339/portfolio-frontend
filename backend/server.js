const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const {
  createActiveProjectContext,
  createConversationContext,
  createMatchedProjectContext,
  createPortfolioContext,
  createSystemInstruction,
  createUserMessagePrompt,
} = require("./chat-prompt");

dotenv.config({ path: path.join(__dirname, ".env") });

console.log("Gemini key loaded:", !!process.env.GEMINI_API_KEY);

const { GoogleGenAI } = require("@google/genai");

const app = express();
const PORT = process.env.PORT || 3000;
const CONTACT_SUBMISSION_LIMIT = 5;
const CONTACT_WINDOW_MS = 24 * 60 * 60 * 1000;
const contactSubmissionLog = new Map();
const FORMSPREE_ENDPOINT = "https://formspree.io/f/mvgrnjpd";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.set("trust proxy", true);
app.use(cors());
app.use(express.json());

const publicDirectoryPath = path.join(__dirname, "../public");
const publicIndexPath = path.join(publicDirectoryPath, "index.html");

if (fs.existsSync(publicDirectoryPath)) {
  app.use(express.static(publicDirectoryPath));
}

const portfolioDataPath = path.join(__dirname, "portfolio-data.json");
const portfolioData = JSON.parse(fs.readFileSync(portfolioDataPath, "utf8"));
const blockedTerms = [
  "bobo",
  "tanga",
  "gago",
  "gaga",
  "ulol",
  "tarantado",
  "tarantada",
  "puta",
  "putangina",
  "putang ina",
  "pakyu",
  "fuck",
  "fucking",
  "shit",
  "bitch",
  "asshole",
  "sex",
  "sexy",
  "porn",
  "nude",
  "nudes",
  "jakol",
  "kantot",
  "kantutan",
  "blowjob",
  "boobs",
  "dick",
  "pussy"
];

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getProjectAliases(project) {
  const baseAliases = [project.name];

  if (project.name === "Portfolio Website") {
    baseAliases.push("portfolio", "portfolio project", "portfolio website", "this portfolio", "this project");
  }

  if (project.name === "AI Chatbot Integration") {
    baseAliases.push("ai integration", "chatbot integration", "ai chatbot", "chatbot");
  }

  if (project.name === "StudyMate AI") {
    baseAliases.push("studymate", "study mate");
  }

  if (project.name === "Nocturne Wellness Studio") {
    baseAliases.push("nocturne", "wellness studio", "wellness");
  }

  return [...new Set(baseAliases.map(normalizeText).filter(Boolean))];
}

function findProjectsInText(text, projects) {
  const normalizedText = normalizeText(text);
  if (!normalizedText) return [];

  return projects.filter((project) => {
    const aliases = getProjectAliases(project);
    return aliases.some((alias) => normalizedText.includes(alias));
  });
}

function getActiveProject(userMessage, history, projects) {
  const currentMatches = findProjectsInText(userMessage, projects);
  if (currentMatches.length > 0) {
    return currentMatches[0];
  }

  for (let index = history.length - 1; index >= 0; index -= 1) {
    const entry = history[index];
    const matches = findProjectsInText(entry.text, projects);
    if (matches.length > 0) {
      return matches[0];
    }
  }

  return null;
}

function getMatchedProjects(userMessage, history, projects, activeProject) {
  if (activeProject) {
    return [activeProject];
  }

  const searchableText = [userMessage, ...(Array.isArray(history) ? history.map((item) => item.text) : [])]
    .map(normalizeText)
    .join(" ");

  return projects.filter((project) => {
    const aliases = getProjectAliases(project);
    return aliases.some((alias) => searchableText.includes(alias));
  });
}

function containsBlockedContent(text) {
  const normalizedText = normalizeText(text);
  return blockedTerms.some((term) => normalizedText.includes(normalizeText(term)));
}

function getClientIpAddress(req) {
  return (
    req.ip ||
    req.headers["x-forwarded-for"] ||
    req.connection?.remoteAddress ||
    "unknown"
  );
}

function pruneOldContactSubmissions(submissions, now) {
  return submissions.filter((timestamp) => now - timestamp < CONTACT_WINDOW_MS);
}

app.post("/contact", async (req, res) => {
  try {
    const { name, email, subject, message, captchaResponse } = req.body || {};
    const trimmedName = String(name || "").trim();
    const trimmedEmail = String(email || "").trim();
    const trimmedSubject = String(subject || "").trim();
    const trimmedMessage = String(message || "").trim();
    const trimmedCaptchaResponse = String(captchaResponse || "").trim();

    if (!trimmedName || !trimmedEmail || !trimmedSubject || !trimmedMessage || !trimmedCaptchaResponse) {
      return res.status(400).json({ message: "Please complete all required fields." });
    }

    const now = Date.now();
    const ipAddress = getClientIpAddress(req);
    const currentSubmissions = pruneOldContactSubmissions(contactSubmissionLog.get(ipAddress) || [], now);

    if (currentSubmissions.length >= CONTACT_SUBMISSION_LIMIT) {
      return res.status(429).json({
        message: "You've reached the daily message limit for this IP address. Please try again after 24 hours."
      });
    }

    const formBody = new FormData();
    formBody.append("name", trimmedName);
    formBody.append("email", trimmedEmail);
    formBody.append("_replyto", trimmedEmail);
    formBody.append("subject", trimmedSubject);
    formBody.append("message", trimmedMessage);
    formBody.append("g-recaptcha-response", trimmedCaptchaResponse);

    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      headers: {
        Accept: "application/json"
      },
      body: formBody
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error("Formspree error:", response.status, errorText);
      return res.status(502).json({ message: "Failed to send message. Please try again." });
    }

    currentSubmissions.push(now);
    contactSubmissionLog.set(ipAddress, currentSubmissions);

    return res.status(200).json({ message: "Message sent successfully." });
  } catch (error) {
    console.error("Contact form error:", error);
    return res.status(500).json({ message: "Network error. Please try again." });
  }
});

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;
    const history = Array.isArray(req.body.history) ? req.body.history.slice(-6) : [];

    if (!userMessage || !userMessage.trim()) {
      return res.status(400).json({ reply: "Please enter a message." });
    }

    if (containsBlockedContent(userMessage)) {
      return res.status(200).json({
        reply: "Sorry, I'm having trouble connecting right now. Please try again later."
      });
    }

    const systemInstruction = createSystemInstruction();
    const portfolioContext = createPortfolioContext(portfolioData);
    const conversationContext = createConversationContext(history);
    const activeProject = getActiveProject(userMessage, history, portfolioData.projects || []);
    const matchedProjects = getMatchedProjects(userMessage, history, portfolioData.projects || [], activeProject);
    const activeProjectContext = createActiveProjectContext(activeProject);
    const matchedProjectContext = createMatchedProjectContext(matchedProjects);
    const userPrompt = createUserMessagePrompt(userMessage);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: [
        {
          role: "user",
          parts: [
            { text: systemInstruction },
            { text: portfolioContext },
            { text: conversationContext },
            { text: activeProjectContext },
            { text: matchedProjectContext },
            { text: userPrompt }
          ]
        }
      ],
    });

    res.json({
      reply: response.text || "No response generated."
    });
  } catch (error) {
    console.error("Gemini error:", error);

    if (error?.status === 429 || String(error?.message || "").includes("RESOURCE_EXHAUSTED")) {
      return res.status(429).json({
        reply: "Sorry, I've reached my question limit. Many users have asked questions, so please try again later, or contact me on Facebook since I'm active there."
      });
    }

    res.status(500).json({ reply: "Sorry, I'm having trouble connecting right now. Please try again later." });
  }
});

app.get("/", (req, res) => {
  if (fs.existsSync(publicIndexPath)) {
    return res.sendFile(publicIndexPath);
  }

  return res.status(200).send("Portfolio backend is running.");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
