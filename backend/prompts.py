"""
Prompt templates for Claude-based name generation
"""

SYSTEM_PROMPT = """You are Fission, an expert business name generator with deep knowledge of:
- Greek, Roman, Norse, Egyptian, Hindu, Celtic, and other mythologies
- Etymology and word origins across languages (Latin, Greek, Sanskrit, Old English, etc.)
- Modern naming conventions for tech startups, brands, and companies
- Phonetic analysis and memorable name construction
- Domain naming best practices
- Syllable patterns and linguistic aesthetics

When generating names:
1. Provide diverse options across multiple categories
2. Ensure names are pronounceable and memorable
3. Avoid names with negative connotations in major languages
4. Include brief, useful meanings for each name
5. Consider the business context provided
6. Balance creativity with professionalism

You must output valid JSON only. No markdown, no explanations outside the JSON."""

GENERATE_PROMPT = """Generate {num_results} unique business name suggestions based on this prompt:

"{prompt}"

Categories to include:
- mythology: Names from Greek, Roman, Norse, or other mythologies
- scientific: Technical/scientific terms that sound professional
- modern: Contemporary coined names (tech-style, portmanteaus)
- nature: Names inspired by natural phenomena, elements, celestial bodies
- abstract: Conceptual names (qualities, actions, states)
- historical: Names from history, ancient civilizations, classical references

Output ONLY valid JSON in this exact format:
{{
  "names": [
    {{
      "id": "name_1",
      "name": "ExampleName",
      "category": "mythology",
      "origin": "Greek - Titan of light",
      "meaning": "Brief explanation of the name's meaning and why it fits",
      "pronunciation": "ex-AM-pull",
      "tags": ["power", "light", "technology"]
    }}
  ],
  "threads": [
    {{
      "thread_id": 0,
      "title": "Mythological Power",
      "description": "Names from mythology conveying strength",
      "name_ids": ["name_1", "name_2"]
    }}
  ]
}}

Generate exactly {num_results} names with good variety across categories. Group them into 4-6 thematic threads."""

GO_DEEPER_PROMPT = """The user is exploring the name "{name}" for a business.
Context: {context}

Generate related names across these 5 dimensions:

1. SAME FAMILY: If this is from mythology, find siblings/relatives/same pantheon.
   If it's a modern coined name, find similar construction patterns.
   If it's from nature, find related natural phenomena.

2. SIMILAR MEANING: Names that convey the same core concept (e.g., if the name means "light", find other names meaning light, brilliance, radiance from different origins).

3. PHONETIC SIBLINGS: Names that sound similar - share syllable patterns, similar rhythm, rhyme, or alliteration. Include names from completely different origins that happen to sound alike.

4. SYLLABLE REMIXES: Creative NEW names formed by:
   - Combining syllables from "{name}" with new elements
   - Adding common suffixes (-ex, -ix, -us, -ia, -ium, -io, -on)
   - Blending with related concepts
   - Reversing or reordering syllables
   These should feel like natural, pronounceable words.

5. CROSS-CULTURAL: Same archetype/meaning from different mythologies and cultures worldwide. If "{name}" is a Greek god, find the equivalent in Norse, Egyptian, Hindu, Celtic, etc.

Output ONLY valid JSON in this exact format:
{{
  "source_name": "{name}",
  "threads": [
    {{
      "dimension": "same_family",
      "title": "Same Family",
      "description": "Brief description of this category",
      "names": [
        {{
          "id": "deeper_1",
          "name": "RelatedName",
          "meaning": "Brief explanation",
          "origin": "Origin info"
        }}
      ]
    }}
  ]
}}

Generate 5-8 names per dimension (25-40 total names). Make them diverse and interesting."""

CATEGORIES_LIST = [
    {
        "id": "mythology",
        "name": "Mythology",
        "description": "Names from Greek, Roman, Norse, and other mythologies",
        "color": "#8b5cf6"
    },
    {
        "id": "scientific",
        "name": "Scientific",
        "description": "Technical and scientific terms",
        "color": "#06b6d4"
    },
    {
        "id": "modern",
        "name": "Modern",
        "description": "Contemporary coined names and portmanteaus",
        "color": "#f59e0b"
    },
    {
        "id": "nature",
        "name": "Nature",
        "description": "Natural phenomena, elements, celestial bodies",
        "color": "#10b981"
    },
    {
        "id": "abstract",
        "name": "Abstract",
        "description": "Conceptual names representing qualities and ideas",
        "color": "#ec4899"
    },
    {
        "id": "historical",
        "name": "Historical",
        "description": "Names from history and ancient civilizations",
        "color": "#6366f1"
    }
]

EXAMPLE_PROMPTS = [
    "Hyperion",
    "AI startup for creators",
    "Premium sustainable fashion brand",
    "Fintech app for Gen Z",
    "Cybersecurity company",
    "Health and wellness platform",
    "Space exploration company",
    "Luxury electric vehicles"
]
