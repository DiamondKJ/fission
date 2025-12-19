# Fission - Business Name Ideation Engine

A powerful name discovery platform where you input keywords, concepts, or prompts and receive high-quality business name suggestions organized by category. The core feature is **"Go Deeper"** - click any name to explore similar names, variations, and related concepts infinitely.

## Features

- **Multi-Mode Input**: Enter descriptions, seed names, or keywords
- **Category-Based Results**: Names organized into semantic threads (mythology, scientific, modern, nature, abstract, historical)
- **Go Deeper**: Click any name to explore across 5 dimensions:
  - Same Family (related names from same origin)
  - Similar Meaning (names conveying same concepts)
  - Phonetic Siblings (names that sound similar)
  - Syllable Remixes (creative variations)
  - Cross-Cultural (same archetype in other mythologies)
- **Beautiful UI**: Scattered galaxy visualization with zoom and pan
- **Favorites**: Save names you like
- **Dark Mode**: Easy on the eyes

## Tech Stack

**Frontend:**
- React 18
- Zustand (state management)
- Vite (build tool)
- CSS (Apple-inspired design)

**Backend:**
- Python FastAPI
- Claude API (Anthropic)
- Pydantic models

## Quick Start

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# Start the server
python main.py
```

The backend will run at `http://localhost:8000`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will run at `http://localhost:5173`

## Usage

1. Open `http://localhost:5173` in your browser
2. Enter a prompt:
   - Description: "A fintech startup for Gen Z"
   - Seed name: "Hyperion"
   - Keywords: "power technology innovation"
3. Browse the generated names in the galaxy view
4. Click any name to "Go Deeper" and explore related names
5. Click the heart icon to save favorites

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/generate` - Generate names from a prompt
- `POST /api/deeper` - Explore a name across dimensions
- `GET /api/categories` - List available categories
- `GET /api/examples` - Get example prompts

## Architecture

```
fission/
├── backend/
│   ├── main.py          # FastAPI app
│   ├── generator.py     # Claude-based generation
│   ├── models.py        # Pydantic models
│   ├── prompts.py       # Prompt templates
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api.js
│   │   ├── store.js
│   │   └── components/
│   │       ├── SearchBar.jsx
│   │       ├── NameGallery.jsx
│   │       ├── NameCard.jsx
│   │       ├── GoDeeperPanel.jsx
│   │       ├── Controls.jsx
│   │       └── DarkModeToggle.jsx
│   └── package.json
│
├── PLAN.md              # Implementation plan
└── README.md
```

## License

MIT
