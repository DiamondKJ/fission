# FISSION - Business Name Ideation Engine

## Vision
A powerful name discovery platform where you input keywords, concepts, or prompts and receive high-quality business name suggestions organized by category. The core feature is **"Go Deeper"** - click any name to explore similar names, variations, and related concepts infinitely.

---

## Architecture Decision: LLM-First Approach

### Why LLM over CLIP?
| Aspect | CLIP | LLM (Claude) |
|--------|------|--------------|
| Understanding names/words | Limited (trained on images) | Excellent (trained on text) |
| Mythology knowledge | None | Deep understanding |
| Etymology | None | Can explain word origins |
| Creative variations | Cannot generate | Excellent at generation |
| Category awareness | Visual only | Semantic + cultural |
| Syllable manipulation | None | Can analyze phonetics |

**Decision: Use Claude API as the primary intelligence layer**

### Hybrid Enhancement
- **Claude API**: Primary generation, categorization, and "Go Deeper" logic
- **Embeddings** (text-embedding-3-small): For clustering similar names in visualization
- **Local caching**: Pre-compute common queries for speed

---

## Core Features

### 1. Multi-Mode Input
```
[Search Bar]
├── Keywords: "power technology innovation"
├── Concept: "A fintech startup for Gen Z"
├── Inspiration: "Names like Stripe, Square, Plaid"
└── Single word: "Hyperion" → Go Deeper immediately
```

### 2. Category-Based Results
Results organized into semantic threads (like IVS Deep Mode):

```
Query: "power technology innovation"
         ↓
┌─────────────────────────────────────────────────────────┐
│ MYTHOLOGY & TITANS                                       │
│ Prometheus, Hyperion, Atlas, Vulcan, Athena, Hermes     │
├─────────────────────────────────────────────────────────┤
│ SCIENTIFIC/TECH ROOTS                                    │
│ Quantum, Nexus, Helix, Fusion, Axiom, Vector            │
├─────────────────────────────────────────────────────────┤
│ MODERN COINED                                            │
│ Powerix, Innovex, Techura, Dynova, Vortix               │
├─────────────────────────────────────────────────────────┤
│ NATURE/ELEMENTAL                                         │
│ Aurora, Zenith, Apex, Summit, Nova, Eclipse             │
├─────────────────────────────────────────────────────────┤
│ ABSTRACT CONCEPTS                                        │
│ Catalyst, Momentum, Clarity, Forge, Pulse, Surge        │
└─────────────────────────────────────────────────────────┘
```

### 3. Go Deeper (The Killer Feature)
Click any name → Explore in multiple dimensions:

```
Selected: "Hyperion"
         ↓
    [GO DEEPER]
         ↓
┌─────────────────────────────────────────────────────────┐
│ SAME FAMILY (Greek Titans)                               │
│ Kronos, Oceanus, Coeus, Crius, Iapetus, Rhea, Themis    │
├─────────────────────────────────────────────────────────┤
│ SIMILAR MEANING (Light/Celestial)                        │
│ Helios, Apollo, Phoebe, Eos, Selene, Aether, Phosphorus │
├─────────────────────────────────────────────────────────┤
│ PHONETIC SIBLINGS (Sound-alikes)                         │
│ Orion, Oberon, Acheron, Hyperius, Elysion               │
├─────────────────────────────────────────────────────────┤
│ SYLLABLE REMIXES                                         │
│ Hypernova, Hyperex, Ionyx, Hyperis, Perion, Hyprex      │
├─────────────────────────────────────────────────────────┤
│ CROSS-MYTHOLOGY (Same archetype elsewhere)               │
│ Surya (Hindu sun), Ra (Egyptian), Shamash (Mesopotamian) │
└─────────────────────────────────────────────────────────┘
```

### 4. Name Cards (Rich Information)
Each name displays:
- Name itself (prominent)
- Origin/category badge
- Brief meaning
- Phonetic pronunciation
- Domain availability indicator (future)

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│                   React + Zustand + CSS                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  SearchBar  │  │ NameGallery │  │  GoDeeperPanel      │  │
│  │  (prompt)   │  │  (spiral/   │  │  (exploration UI)   │  │
│  │             │  │   scattered)│  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                               │
│                   Python + FastAPI                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  /generate  │  │  /deeper    │  │  /categories        │  │
│  │  (initial   │  │  (explore   │  │  (list available    │  │
│  │   names)    │  │   a name)   │  │   categories)       │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    INTELLIGENCE LAYER                        │
│  ┌─────────────────────┐  ┌───────────────────────────────┐ │
│  │     Claude API      │  │    OpenAI Embeddings          │ │
│  │  - Name generation  │  │  - Similarity clustering      │ │
│  │  - Categorization   │  │  - Visualization positioning  │ │
│  │  - Go Deeper logic  │  │                               │ │
│  │  - Etymology        │  │                               │ │
│  └─────────────────────┘  └───────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       DATA LAYER                             │
│  ┌─────────────────────┐  ┌───────────────────────────────┐ │
│  │   Response Cache    │  │   Pre-built Datasets          │ │
│  │  (Redis/File-based) │  │  - Greek mythology            │ │
│  │  - Common queries   │  │  - Norse mythology            │ │
│  │  - Recent results   │  │  - Latin roots                │ │
│  │                     │  │  - Tech terminology           │ │
│  └─────────────────────┘  └───────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## API Design

### POST /api/generate
Generate initial names from a prompt.

**Request:**
```json
{
  "prompt": "A fintech startup for Gen Z",
  "num_results": 50,
  "categories": ["mythology", "modern", "scientific", "nature"],
  "style": "professional"  // or "playful", "bold", "minimal"
}
```

**Response:**
```json
{
  "query": "A fintech startup for Gen Z",
  "names": [
    {
      "id": "name_1",
      "name": "Denarii",
      "category": "historical",
      "origin": "Roman currency",
      "meaning": "Ancient Roman silver coin, symbolizes timeless value",
      "pronunciation": "deh-NAR-ee-eye",
      "tags": ["finance", "classical", "memorable"],
      "embedding": [0.1, 0.2, ...]
    },
    ...
  ],
  "threads": [
    {
      "thread_id": 0,
      "title": "Classical Finance",
      "names": ["Denarii", "Aureus", "Drachma", "Solidus"],
      "count": 4
    },
    ...
  ]
}
```

### POST /api/deeper
Explore a selected name in depth.

**Request:**
```json
{
  "name": "Hyperion",
  "context": "technology startup",
  "dimensions": ["same_family", "similar_meaning", "phonetic", "syllable_remix", "cross_cultural"]
}
```

**Response:**
```json
{
  "source_name": "Hyperion",
  "threads": [
    {
      "dimension": "same_family",
      "title": "Greek Titans",
      "description": "Other Titans from Greek mythology",
      "names": [
        {"name": "Kronos", "meaning": "Titan of time", ...},
        {"name": "Atlas", "meaning": "Titan who held up the sky", ...}
      ]
    },
    {
      "dimension": "syllable_remix",
      "title": "Creative Variations",
      "description": "Names derived from Hyperion's phonetics",
      "names": [
        {"name": "Hypernova", "meaning": "Combining hyper + nova (new star)", ...},
        {"name": "Perionix", "meaning": "Remix of syllables with tech suffix", ...}
      ]
    }
  ]
}
```

### GET /api/categories
List available name categories for filtering.

---

## Claude Prompting Strategy

### System Prompt (Name Generator)
```
You are Fission, an expert business name generator with deep knowledge of:
- Greek, Roman, Norse, Egyptian, Hindu, and other mythologies
- Etymology and word origins across languages
- Modern naming conventions (tech startups, brands)
- Phonetic analysis and memorable name construction
- Domain naming best practices

When generating names:
1. Provide diverse options across categories
2. Ensure names are pronounceable and memorable
3. Avoid names with negative connotations in major languages
4. Include brief, useful meanings for each name
5. Consider the business context provided

Output names in structured JSON format.
```

### Go Deeper Prompt Template
```
The user is exploring the name "{name}" for a business.
Context: {context}

Generate related names across these dimensions:

1. SAME FAMILY: If this is from mythology, find siblings/relatives.
   If modern coined, find similar construction patterns.

2. SIMILAR MEANING: Names that convey the same core concept
   (e.g., light, power, speed) from different origins.

3. PHONETIC SIBLINGS: Names that sound similar, share syllable patterns,
   or rhyme. Include names from different origins that sound alike.

4. SYLLABLE REMIXES: Creative new names formed by:
   - Combining syllables from the source with new elements
   - Reversing syllables
   - Adding common suffixes (-ex, -ix, -us, -ia, -ium)
   - Blending with relevant concepts

5. CROSS-CULTURAL: Same archetype/meaning from different mythologies
   and cultures worldwide.

Return 5-8 names per dimension with meanings.
```

---

## Frontend Components (Adapted from IVS)

### From IVS (Reuse 80%+)
- `SearchBar.jsx` → Minor text changes
- `ScatteredGallery.jsx` → Rename to `NameGallery.jsx`, swap image cards for name cards
- `Controls.jsx` → Add category filters
- `DarkModeToggle.jsx` → Keep as-is
- `LoadingScreen.jsx` → Update animation theme
- `App.jsx` → Restructure for name exploration flow
- `store.js` → Adapt state for names instead of images
- `api.js` → New endpoints

### New Components
- `NameCard.jsx` → Rich name display with meaning, origin badge
- `GoDeeperPanel.jsx` → Exploration interface when a name is selected
- `CategoryFilter.jsx` → Filter results by category
- `NameDetails.jsx` → Full details view for selected name
- `ExportPanel.jsx` → Save/export favorite names

---

## Implementation Phases

### Phase 1: Foundation (Days 1-2)
- [ ] Copy IVS structure to Fission
- [ ] Set up Claude API integration
- [ ] Create basic `/api/generate` endpoint
- [ ] Adapt frontend for name cards (basic)
- [ ] Get end-to-end flow working

### Phase 2: Go Deeper (Days 3-4)
- [ ] Implement `/api/deeper` endpoint
- [ ] Create Go Deeper UI panel
- [ ] Add dimension-based exploration
- [ ] Implement infinite exploration (deeper → deeper → ...)

### Phase 3: Polish (Days 5-6)
- [ ] Add category filtering
- [ ] Implement name favoriting/saving
- [ ] Add export functionality
- [ ] Response caching for speed
- [ ] UI polish and animations

### Phase 4: Enhancement (Future)
- [ ] Domain availability checking
- [ ] Trademark search integration
- [ ] Name pronunciation audio
- [ ] Collaborative sessions
- [ ] Pre-built themed collections

---

## File Structure

```
fission/
├── backend/
│   ├── main.py              # FastAPI app
│   ├── generator.py         # Claude-based name generation
│   ├── deeper.py            # Go Deeper logic
│   ├── embeddings.py        # OpenAI embeddings for clustering
│   ├── cache.py             # Response caching
│   ├── models.py            # Pydantic models
│   ├── prompts.py           # Claude prompt templates
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api.js
│   │   ├── store.js
│   │   ├── components/
│   │   │   ├── SearchBar.jsx
│   │   │   ├── NameGallery.jsx
│   │   │   ├── NameCard.jsx
│   │   │   ├── GoDeeperPanel.jsx
│   │   │   ├── CategoryFilter.jsx
│   │   │   ├── Controls.jsx
│   │   │   ├── DarkModeToggle.jsx
│   │   │   └── LoadingScreen.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── data/
│   ├── greek_mythology.json
│   ├── norse_mythology.json
│   ├── latin_roots.json
│   └── tech_terms.json
│
├── PLAN.md
└── README.md
```

---

## Environment Variables

```env
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...  # For embeddings only
CACHE_ENABLED=true
CACHE_TTL=3600
```

---

## Success Metrics

1. **Generation Quality**: Names feel professional, memorable, relevant
2. **Go Deeper Depth**: Users can explore 5+ levels deep without repetition
3. **Speed**: Initial results in <3 seconds
4. **Diversity**: Each query returns names across 5+ distinct categories
5. **Stickiness**: Users spend 10+ minutes exploring

---

## Next Action
Begin Phase 1: Copy IVS foundation and wire up Claude API.
