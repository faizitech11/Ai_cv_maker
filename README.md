# 🤖 AI CV Maker & ATS Resume Builder

<p align="center">
  <img src="public/globe.svg" alt="AI CV Maker Logo" width="80" height="80" />
</p>

<p align="center">
  A modern, high-performance, full-stack <strong>AI-Powered Resume & CV Builder</strong> built with <strong>Next.js 16 (App Router)</strong>, <strong>React 19</strong>, <strong>Tailwind CSS v4</strong>, and <strong>Prisma ORM</strong>. Includes multi-provider LLM support, intelligent ATS document parsing (PDF, Word, Images), 8 hand-crafted designer templates, real-time live preview, and vector-crisp PDF export.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.3.2-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19.2-blue?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat-square&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Prisma-6.4-121212?style=flat-square&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/NextAuth.js-v4-purple?style=flat-square&logo=auth0" alt="NextAuth" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License" />
</p>

---

## 🌟 Key Features

### 1. 🤖 Multi-Provider AI Engine (Cloud + 100% Offline Fallback)
- **Multi-LLM Support**: Seamlessly connects with Google Gemini, Groq Cloud (Llama 3.3 70B), OpenAI (GPT-4o), OpenRouter, or Hugging Face.
- **Zero-Config Smart Local ATS Engine**: Works straight out of the box **without any API keys required**! If no cloud API keys are provided, an intelligent built-in heuristic NLP engine generates quantified, action-verb driven content and ATS-optimized bullet points completely offline and 100% free.
- **✨ AI Content Enhancement**: One-click enhancement converts casual job notes into high-impact, quantified resume bullet points using standard STAR (Situation, Task, Action, Result) methodology.
- **🤖 Auto-Generate from Scratch**: Leaving experience or project descriptions blank? The AI automatically creates professional bullet points based on the position title, company, or project name.
- **💡 AI Smart Skill Suggester**: Suggests relevant hard and soft skills tailored directly to the candidate's target job title and background.

### 2. 📄 Multi-Format ATS Resume Parser
- **Universal Import**: Upload existing resumes in **PDF** (`.pdf`), **Microsoft Word** (`.docx`), or scanned **Images** (`.png`, `.jpg`, `.jpeg`).
- **Optical Character Recognition (OCR)**: Scanned image resumes and photos are parsed using client/server-side `tesseract.js`.
- **Heuristic ATS Extraction**: Automatically parses unstructured resume text into structured sections:
  - Personal details & contact info (Email, Phone, City, Country, LinkedIn, GitHub, Portfolio)
  - Professional summary
  - Work history & job experiences
  - Degrees, institutions, and dates
  - Skills categorized without duplicate tags
  - Projects with descriptions and technologies
  - Certifications & Languages
- **Instant Edit**: Immediately opens the parsed resume in the interactive editor with a detailed breakdown of all extracted sections.

### 3. 🎨 8 Hand-Crafted Designer CV Templates
Switch between 8 unique, professionally designed templates at any time with instantaneous live preview:
1. **Modern Accent** (`modern`): Clean contemporary style with indigo accent headers and clean divider lines.
2. **Classic Serif** (`classic`): Traditional corporate resume format with timeless serif typography; ideal for academia, law, and finance.
3. **Professional** (`professional`): Balanced business layout with prominent left border section accents.
4. **Minimal Clean** (`minimal`): High-whitespace, distraction-free minimalist presentation.
5. **Executive** (`executive`): Prestigious corporate leadership design featuring deep navy headers and warm amber accents.
6. **Tech / Developer** (`tech`): Tailored for software engineers, DevOps, and data specialists; featuring monospace headers and tech tag pills.
7. **Creative Split** (`creative`): Modern two-column split layout with a dark slate left sidebar and prominent initials avatar.
8. **Compact One-Page** (`compact`): Dense grid layout optimized to fit extensive career histories into a crisp single page.

### 4. 👁️ Real-Time Live Preview & Vector PDF Export
- Side-by-side editing with synchronized live preview.
- Full A4 page layout preview with zoom controls.
- Clean skill badges (clean display without redundant skill level labels).
- **Pixel-Perfect PDF Generation**: Client-side vector-crisp PDF export powered by `jsPDF` and `html-to-image` matching standard A4 dimensions (`210mm x 297mm`).

### 5. 🔐 User Dashboard & Authentication
- Secure authentication system powered by **NextAuth.js** with encrypted password hashing (`bcryptjs`).
- Complete user dashboard displaying all created and imported resumes.
- Resume management actions: Create New, Edit, Duplicate, Preview, and Delete with instant UI sync.
- Personalized welcome banner and summary stats.

---

## 🛠️ Tech Stack

| Layer | Technology | Description |
|---|---|---|
| **Framework** | [Next.js 16.3](https://nextjs.org/) | App Router, Server Components & Route Handlers |
| **UI Library** | [React 19.2](https://react.dev/) | Latest React concurrent features & hooks |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Modern utility-first CSS styling |
| **Database** | [SQLite](https://www.sqlite.org/) | Embedded zero-config database (`prisma/dev.db`) |
| **ORM** | [Prisma ORM 6.4](https://www.prisma.io/) | Type-safe database queries, schema migrations |
| **Authentication** | [NextAuth.js v4](https://next-auth.js.org/) | Credentials provider with JWT session management |
| **File Parsing** | `pdf-parse`, `mammoth`, `tesseract.js` | PDF, Word DOCX, and OCR image text extraction |
| **PDF Export** | `jspdf`, `html-to-image` | High-fidelity client-side PDF document generation |
| **Icons** | Modern SVG & Unicode Icons | Lightweight, zero-dependency visual iconography |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: v18.18.0 or later (Node.js 20+ recommended)
- **npm**, **pnpm**, or **yarn**

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/ai-cv-maker.git
cd ai-cv-maker
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Copy the example environment file:
```bash
# On Windows (PowerShell):
Copy-Item .env.example .env

# On macOS/Linux:
cp .env.example .env
```

Open `.env` in your editor and configure your secrets:
```env
# Database Configuration
DATABASE_URL="file:./dev.db"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="ai-cv-maker-super-secret-key-2026-xyz"

# (Optional) Cloud AI API Keys - The app works even if these are left blank!
GEMINI_API_KEY=""
GROQ_API_KEY=""
OPENAI_API_KEY=""
OPENROUTER_API_KEY=""
HUGGINGFACE_API_KEY=""
```

### 4. Initialize the Database
Generate the Prisma client and apply the SQLite database schema:
```bash
npx prisma db push
# or
npx prisma migrate dev --name init
```

### 5. Start the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to start building resumes!

---

## 🤖 AI Configuration Guide

The application implements an **autonomous multi-tier fallback architecture**:

```text
User Request (AI Enhance / Suggest / Summary)
                     │
     ┌───────────────┴───────────────┐
     ▼                               ▼
Cloud LLM Key Configured?     No Keys Configured?
     │                               │
     ├─► 1. Google Gemini            └─► Built-in Smart Local ATS
     ├─► 2. Groq (Llama 3.3 70B)         Rule-Based NLP Engine
     ├─► 3. OpenAI (GPT-4o)              (100% Free & Offline)
     ├─► 4. OpenRouter
     └─► 5. Hugging Face
```

### Free Cloud AI Options (Recommended)
1. **Google Gemini (Best & 100% Free)**:
   - Get a free API key at [Google AI Studio](https://aistudio.google.com/).
   - Set in `.env`: `GEMINI_API_KEY="AIzaSy..."`
2. **Groq (Blazing Fast Llama 3.3 70B)**:
   - Get a free API key at [Groq Console](https://console.groq.com/).
   - Set in `.env`: `GROQ_API_KEY="gsk_..."`

> [!NOTE]
> Even if you don't provide any API key or if external APIs experience network outages, the app **never fails**. The built-in **Smart Local ATS NLP Engine** intercepts the request and produces high quality, quantified resume bullet points locally.

---

## 📁 Project Structure

```text
Ai_cv_maker/
├── app/
│   ├── api/
│   │   ├── ai/
│   │   │   ├── enhance/       # AI resume bullet/description enhancement & generation
│   │   │   └── suggest-skills/# AI skill recommendation API
│   │   ├── auth/              # NextAuth route handler & user registration
│   │   └── cv/                # CV CRUD operations & file upload parser
│   ├── components/
│   │   ├── CVPreview.tsx      # Multi-template real-time CV renderer (A4 compliant)
│   │   ├── Navbar.tsx         # Responsive top navigation with auth state
│   │   └── SessionProvider.tsx# Client-side NextAuth session wrapper
│   ├── cv/
│   │   ├── edit/[id]/         # Full-featured CV builder & editor
│   │   ├── new/               # Quick template selector & resume initiator
│   │   ├── preview/[id]/      # Standalone printable preview & PDF exporter
│   │   └── upload/            # ATS resume upload & extraction interface
│   ├── dashboard/             # User dashboard with resume cards & statistics
│   ├── lib/
│   │   ├── ai.ts              # Multi-provider AI manager & Smart Local ATS engine
│   │   ├── auth.ts            # NextAuth options & credentials provider
│   │   ├── cv-structure.ts    # Heuristic ATS resume parser & OCR extractor
│   │   └── prisma.ts          # Singleton Prisma database client
│   ├── login/                 # User sign-in page
│   ├── register/              # New user registration page
│   ├── layout.tsx             # Root layout with fonts & providers
│   └── page.tsx               # High-converting landing page
├── prisma/
│   ├── schema.prisma          # Database schema (Users, CVs, Sections, AIContent)
│   └── dev.db                 # SQLite database file
├── public/                    # Static images & icons
├── .env.example               # Environment variables template
├── package.json               # Dependencies & build scripts
└── README.md                  # Project documentation
```

---

## 📊 Database Schema Summary

The application uses **Prisma ORM** with relational integrity:
- **`User`**: Manages credentials, names, and accounts.
- **`CV`**: Belongs to a user, stores resume title, selected template, and active status.
- **`PersonalInfo`**: Full name, contact channels, location, links, and executive summary.
- **`Experience`**: Position, company, dates, location, and bullet-point achievements.
- **`Education`**: Degree, institution, field of study, graduation dates.
- **`Skill`**: Skill names, categories, and proficiencies.
- **`Project`**: Name, description, tech stack tags, and repository/live URLs.
- **`Certification`**: Certificate name, issuing authority, dates, and verification IDs.
- **`Language`**: Language name and spoken/written fluency.
- **`AIContent`**: Audit log of generated AI prompts and enhancements.

To inspect or edit database records visually in your browser:
```bash
npx prisma studio
```

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the Next.js development server with Turbopack on `http://localhost:3000` |
| `npm run build` | Builds an optimized production bundle for deployment |
| `npm run start` | Runs the compiled Next.js production build |
| `npm run lint` | Checks the codebase for ESLint warnings and errors |
| `npx prisma db push` | Synchronizes the Prisma schema with your local SQLite database |
| `npx prisma studio` | Opens Prisma Studio GUI to view and manage database tables |

---

## 🚢 Deployment

### Deploying to Vercel
1. Push your repository to GitHub, GitLab, or Bitbucket.
2. Import the project into the [Vercel Dashboard](https://vercel.com).
3. Set your environment variables in Vercel Project Settings:
   - `NEXTAUTH_URL`: Your production domain (e.g. `https://your-resume-app.vercel.app`)
   - `NEXTAUTH_SECRET`: A strong random string
   - `DATABASE_URL`: A remote database connection string (e.g. PostgreSQL on Supabase, Neon, or Prisma Postgres; SQLite is file-based and ephemeral on serverless environments).
   - `GEMINI_API_KEY` or `GROQ_API_KEY` for AI features.
4. Click **Deploy**.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the **MIT License** — feel free to use it for personal or commercial projects.
