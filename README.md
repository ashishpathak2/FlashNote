# 🧠 
FlashNote — Flashcards that stick

A smart flashcard app that turns any PDF into a practice-ready deck using AI, with spaced repetition (SM-2 algorithm) built in.

---

## ✨ Features

- **PDF → Flashcards**: Drop in any PDF. AI generates 15–30 high-quality cards covering concepts, definitions, examples, edge cases, formulas, and relationships.
- **SM-2 Spaced Repetition**: Cards you know well fade away. Difficult cards keep showing up until mastered.
- **4-Level Rating**: Again / Hard / Good / Easy — each adjusts the next review interval intelligently.
- **Mastery Tracking**: Visual progress bars and state badges (New → Learning → Review → Mastered).
- **Deck Management**: Search, browse, pick up where you left off.
- **Study Streaks**: Daily streak tracking to keep you motivated.
- **JWT Auth**: Full user accounts — your decks are private.

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+
- **MongoDB** running locally on `mongodb://localhost:27017`
- **OpenRouter API key** — get one free at [openrouter.ai](https://openrouter.ai)

---

### 1. Clone & Install

```bash
# Install root deps
npm install

# Install backend deps
cd backend && npm install && cd ..

# Install frontend deps
cd frontend && npm install && cd ..
```

### 2. Configure Environment

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mnemo
JWT_SECRET=your_long_random_secret_here
OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

> Get your OpenRouter key at https://openrouter.ai/keys

### 3. Start MongoDB

Make sure MongoDB is running locally:

```

### 4. Run the App - 

cd frontend
```bash
npm run dev
```

cd backend
```bash
npm run dev
```

This starts both:
- **Backend** → http://localhost:5000
- **Frontend** → http://localhost:5173

Open http://localhost:5173 in your browser.

---

## 📁 Project Structure

```

FlashNote/
├── backend/
│   ├── models/
│   │   ├── User.js          # User schema with streak tracking
│   │   ├── Deck.js          # Deck schema with mastery metrics
│   │   └── Card.js          # Card schema + SM-2 algorithm
│   ├── routes/
│   │   ├── auth.js          # Register / Login / Me
│   │   ├── decks.js         # CRUD + PDF upload + AI generation
│   │   ├── cards.js         # Card CRUD
│   │   └── study.js         # Session cards + review + stats
│   ├── middleware/
│   │   └── auth.js          # JWT protect middleware
│   ├── utils/
│   │   └── aiGenerator.js   # OpenRouter API call
│   ├── server.js
│   └── .env.example
│
└── frontend/
    └── src/
        ├── components/
        │   ├── ui/            # Button, Input, Modal, Skeleton, ProgressRing
        │   ├── layout/        # Sidebar layout
        │   ├── deck/          # DeckCard, UploadPDFModal, CreateDeckModal, AddCardModal
        │   └── study/         # FlashCard (flip), SessionComplete
        ├── pages/
        │   ├── LoginPage.jsx
        │   ├── RegisterPage.jsx
        │   ├── DashboardPage.jsx
        │   ├── DeckPage.jsx
        │   └── StudyPage.jsx
        ├── store/
        │   └── authStore.js   # Zustand auth state
        └── lib/
            ├── api.js         # Axios instance with auth headers
            └── utils.js       # cn() helper
```

---

## 🧠 How Spaced Repetition Works

Cards use the **SM-2 algorithm**:

| Rating | Quality | Effect |
|--------|---------|--------|
| Again  | 0       | Reset to day 1 |
| Hard   | 1       | Small interval increase |
| Good   | 3       | Normal SM-2 scheduling |
| Easy   | 5       | Accelerated scheduling |

Cards progress through states: `New → Learning → Review → Mastered`

A card is **mastered** when: interval ≥ 21 days AND accuracy ≥ 85%.

---

## 🤖 AI Card Generation

The app calls OpenRouter with `Your-model` and a carefully crafted prompt that instructs the model to create:

- **Concept** cards — key ideas
- **Definition** cards — precise terminology
- **Example** cards — worked applications
- **Relationship** cards — how ideas connect
- **Edge-case** cards — exceptions and gotchas
- **Formula** cards — rules and equations

Each card gets a type badge, optional hint, and tags for filtering.

---

## 🛠 Tech Stack

| Layer     | Technology |
|-----------|-----------|
| Frontend  | React 19, Tailwind CSS v4, Framer Motion, Zustand |
| Backend   | Node.js, Express, Mongoose |
| Database  | MongoDB |
| AI        | OpenRouter API (Your-model) |
| Auth      | JWT (30-day tokens) |
| PDF Parse | pdf-parse |

---

## 📝 Notes

- PDFs must contain **selectable text** (not scanned images). Scanned PDFs won't work without OCR.

