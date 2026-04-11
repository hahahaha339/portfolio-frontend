export const BACKEND_URL = "https://portfolio-backend-1-aupt.onrender.com";

export const TAGLINES = [
  "Building one project at a time.",
  "Code. Learn. Repeat.",
  "Turning ideas into software.",
  "Writing code, solving problems.",
  "Turning logic into experience.",
  "Where ideas meet execution.",
  "Functional. Simple. Effective."
];

export const HOME_CERTIFICATIONS = [
  { title: "AI for Oceans Hour of Code", issuer: "Code.org", image: "/Images/Oceans.jfif" },
  { title: "AI Ready ASEAN Hour of Code Session", issuer: "AI Ready ASEAN", image: "/Images/Hour-of-code.jfif" },
  {
    title: "APIs and Fetch: Connect Your Web App to Real Data",
    issuer: "Programming Computer Programming Services",
    image: "/Images/API.jpg"
  },
  {
    title: "Ethical Hacking and Responsible Disclosure",
    issuer: "West Visayas State University",
    image: "/Images/ethical-hacking.jfif"
  }
];

export const ALL_CERTIFICATIONS = [
  ...HOME_CERTIFICATIONS,
  { title: "AI for Brainstorming and Planning", issuer: "Google", image: "/Images/AIforBrainstormingandPlanning.jpg" },
  { title: "AI for Writing and Communicating", issuer: "Google", image: "/Images/AIforWritingandCommunicating.jpg" },
  { title: "AI for Research and Insights", issuer: "Google", href: "https://coursera.org/share/b0df79d57e1997e582408d7bcaed26d4" },
  { title: "AI for Content Creation", issuer: "Google", href: "https://coursera.org/share/55707127797278cc0bb1ed09713d64c6" },
  { title: "AI for Data Analysis", issuer: "Google", href: "https://coursera.org/share/77ef7bce26b7d72ce751034b6bc45707" },
  { title: "Google AI", issuer: "Google", href: "https://coursera.org/share/13c5176e7970fa45a13dfb04e0c50289" },
  { title: "AWS Generative AI for Developers", issuer: "AWS", href: "https://coursera.org/share/6844d065e3aa0d7bbaa2cebda69e3452" },
  {
    title: "Artificial Intelligence Fundamentals",
    issuer: "IBM SkillsBuild",
    href: "https://www.credly.com/badges/55165467-e3c9-4b0e-bb41-fa735fad21eb/public_url"
  },
  { title: "CSS Essentials", issuer: "Cisco", href: "https://www.credly.com/badges/bc20cc54-d79c-4979-ada1-74a209daee47/public_url" },
  {
    title: "IT Customer Support Basics",
    issuer: "Cisco",
    href: "https://www.credly.com/badges/4381c9d8-d337-47f8-991c-c6537b7633fd/public_url"
  },
  { title: "JavaScript Essentials 1", issuer: "Cisco", href: "https://www.credly.com/badges/23dadaf7-e18a-45cd-b472-73738fa6f81e/public_url" },
  { title: "JavaScript Essentials 2", issuer: "Cisco", href: "https://www.credly.com/badges/7709e733-dac0-4775-81a4-e3cbb41e3217/public_url" }
];

export const ALL_PROJECTS = [
  {
    title: "SchedulePro",
    description: "Smart scheduling and productivity web",
    domain: "schedulepro.github.io",
    href: "https://schedulepro.github.io/SCHEDULEPR0/index.html"
  },
  {
    title: "StudyMate AI",
    description: "AI-powered study assistant tool",
    domain: "github.io/StudyMate-AI/",
    href: "https://gabrielsantoslazaro.github.io/StudyMate-AI/"
  },
  {
    title: "Nocturne Wellness Studio",
    description: "Wellness and health-focused web application",
    domain: "nocturnewellnessstudio-create.github.io",
    href: "https://nocturnewellnessstudio-create.github.io/Studio/about.html"
  },
    {
    title: "Nocturne Wellness Studio",
    description: "Wellness and health-focused web application",
    domain: "nocturnewellnessstudio-create.github.io",
    href: "https://nocturnewellnessstudio-create.github.io/Studio/about.html"
  }
];

export const PROJECTS = ALL_PROJECTS.slice(0, 4);

export const TECH_STACKS = [
  {
    category: "Frontend",
    items: ["HTML", "CSS", "JavaScript", "Tailwind CSS", "React.js", "Prettier"]
  },
  {
    category: "Backend",
    items: ["Node.js", "Express.js", "PHP", "Python", "MySQL", "XAMPP"]
  },
  {
    category: "Programming Languages",
    items: ["Java", "C#", "C++"]
  },
  {
    category: "AI / Tools",
    items: ["Google GenAI", "dotenv", "CORS", "npm", "Vite", "Visual Studio Code", "Git", "GitHub", "OpenAI", "Codex"]
  }
];



export const GALLERY_IMAGES = [
  "/Images/1.jfif",
  "/Images/2.jfif",
  "/Images/3.jpg",
  "/Images/4.jfif",
  "/Images/5.jfif",
  "/Images/6.jfif",
  "/Images/7.jfif",
  "/Images/8.jfif",
  "/Images/9.jfif",
  "/Images/10.jfif"
];

export const SOCIAL_LINKS = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/gabrielsantoslazaro/", icon: "/Logo/linkedin-logo.png" },
  { label: "GitHub", href: "https://github.com/gabrielsantoslazaro", icon: "/Logo/github-logo.png" },
  { label: "Facebook", href: "https://www.facebook.com/xtm.gabriel09", icon: "/Logo/facebook-logo.png" }
];

export const TIMELINE = [
  { title: "BS Information Technology", date: "Present", description: "PHINMA Saint Jude College - Manila", active: true },
  { title: "Web Development Projects", date: "2026", description: "Built responsive websites and portfolio projects using HTML, CSS, and JavaScript." },
  {
    title: "AI Chatbot Integration",
    date: "2026",
    description: "Developed and integrated a chatbot into my portfolio using Node.js, Express.js, and Google GenAI."
  },
  {
    title: "Xurpas Enterprise Inc.",
    date: "2025",
    description: "Completed my internship as a Front-End Developer, where I gained experience in building and improving user interface components for web-based applications."
  },
  { title: "Academic System Projects", date: "2023", description: "Worked on school-related systems and programming projects involving web development and databases." }
];
