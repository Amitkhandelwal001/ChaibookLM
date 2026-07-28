<div align="center">

# 📚 KitbookLM

### AI-Powered Learning Operating System

**Chat with AI · Upload Documents · Take Notes · Track Progress · Plan Your Study Schedule**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

</div>

---

## 🚀 What is KitbookLM?

KitbookLM is a full-stack AI-powered learning platform that brings together everything a student or self-learner needs — in one beautifully designed dark-mode interface.

Upload your study material, chat with an AI assistant, generate notes and flashcards, highlight key video moments, sketch ideas on a whiteboard, and track your study schedule — all in one place.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Chatbot** | Chat with GPT-4o mini. Conversations are saved and restored across sessions |
| 📄 **Document Uploads** | Upload PDFs, DOCX, TXT, and images. View or delete anytime |
| 📝 **Study Notes** | AI-generated summaries and flashcards from your uploaded documents |
| 🎬 **Video Highlights** | Extract and save key moments from educational videos |
| 🗺️ **Explore** | Discover curated learning resources |
| ✏️ **Whiteboard** | Free-form canvas for sketching diagrams and ideas |
| 📅 **Activity Calendar** | Track your study sessions by date with color-coded events |
| 🔐 **Auth System** | Secure JWT-based registration and login with bcrypt password hashing |

---

## 🛠️ Tech Stack

### Frontend
- **React 18** + **TypeScript** — component-based UI
- **Vite** — lightning-fast dev server
- **TanStack Query** — server state & caching
- **React Router v6** — client-side routing
- **Lucide React** — icon system
- **Vanilla CSS** — custom dark-mode design system

### Backend
- **Node.js** + **Express** — REST API server
- **TypeScript** + **tsx** — type-safe development
- **Prisma ORM** — type-safe database access
- **PostgreSQL (Neon)** — cloud-hosted relational database
- **Qdrant** — vector database for AI document search
- **Helmet + CORS** — security middleware

### AI & Cloud Services
- **OpenAI GPT-4o mini** — chat, summarization, flashcard generation
- **ElevenLabs** — text-to-speech for podcast generation
- **Cloudinary** — cloud file storage for uploaded documents
- **Google Gemini** — text embedding for semantic search

---

## 📂 Project Structure

```
kitbooklm/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Database models
│   └── src/
│       ├── controllers/           # Route handlers
│       ├── services/              # Business logic
│       ├── routes/                # Express routers
│       ├── middleware/            # Auth, error handling
│       ├── repositories/          # Database queries
│       └── utils/                 # JWT, Prisma client, helpers
│
└── frontend/
    └── src/
        ├── features/
        │   ├── chatbot/           # AI chat with history
        │   ├── uploads/           # File upload & management
        │   ├── study/             # Notes & flashcards
        │   ├── calendar/          # Activity tracker
        │   ├── video/             # Video highlights
        │   ├── whiteboard/        # Drawing canvas
        │   ├── explore/           # Resource discovery
        │   └── auth/              # Login & signup
        ├── layouts/               # Dashboard shell
        ├── store/                 # Auth state (Zustand)
        └── routes/                # Protected/public guards
```

---

## ⚡ Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (or [Neon](https://neon.tech) free tier)
- OpenAI API key

### 1. Clone the repo
```bash
git clone https://github.com/Amitkhandelwal001/ChaibookLM.git
cd ChaibookLM
```

### 2. Set up the Backend
```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```env
DATABASE_URL="your_postgres_connection_string"
JWT_SECRET="your_strong_random_secret"
OPENAI_API_KEY="your_openai_key"
CLOUDINARY_CLOUD_NAME="your_cloudinary_name"
CLOUDINARY_API_KEY="your_cloudinary_api_key"
CLOUDINARY_API_SECRET="your_cloudinary_api_secret"
QDRANT_URL="your_qdrant_url"
QDRANT_API_KEY="your_qdrant_api_key"
ELEVENLABS_API_KEY="your_elevenlabs_key"
GEMINI_API_KEY="your_gemini_key"
PORT=5001
```

Run database migrations:
```bash
npx prisma generate
npx prisma db push
```

Start the backend:
```bash
npm run dev
```

### 3. Set up the Frontend
```bash
cd ../frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🗄️ Database Models

```
User → Documents → (Podcasts, Notes, Flashcards)
User → Chats → Messages
User → CalendarEvents
User → Whiteboards
```

---

## 🔒 Security

- Passwords hashed with **bcrypt** (10 salt rounds)
- Routes protected with **JWT Bearer tokens**
- Input validated with **Zod** schemas
- Security headers via **Helmet.js**
- Files sanitized and size-limited on upload

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

Built with ❤️ by [Amit Khandelwal](https://github.com/Amitkhandelwal001)

⭐ Star this repo if you found it useful!

</div>