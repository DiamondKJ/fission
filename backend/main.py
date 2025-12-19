"""
Fission - Business Name Ideation Engine
FastAPI Backend with Claude-based generation
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import logging

from models import (
    GenerateRequest, GenerateResponse, NameResult,
    DeeperRequest, DeeperResponse,
    CategoriesResponse, Category,
    ExamplesResponse, HealthResponse
)
from generator import name_generator
from prompts import CATEGORIES_LIST, EXAMPLE_PROMPTS

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI
app = FastAPI(
    title="Fission API",
    description="Business Name Ideation Engine powered by Claude",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "Fission - Business Name Ideation Engine",
        "version": "1.0.0",
        "status": "online"
    }


@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        claude_available=name_generator.is_available(),
        version="1.0.0"
    )


@app.post("/api/generate", response_model=GenerateResponse)
async def generate_names(request: GenerateRequest):
    """
    Generate business names from a prompt.

    The prompt can be:
    - A description: "A fintech startup for Gen Z"
    - A seed name: "Hyperion"
    - Keywords: "power technology innovation"
    """
    try:
        logger.info(f"Generate request: '{request.prompt}' (num_results={request.num_results})")

        result = await name_generator.generate(
            prompt=request.prompt,
            num_results=request.num_results,
            categories=request.categories,
            style=request.style
        )

        # Convert to response model
        names = [
            NameResult(
                id=n.get("id", f"name_{i}"),
                name=n.get("name", "Unknown"),
                category=n.get("category", "modern"),
                origin=n.get("origin"),
                meaning=n.get("meaning"),
                pronunciation=n.get("pronunciation"),
                tags=n.get("tags")
            )
            for i, n in enumerate(result.get("names", []))
        ]

        return GenerateResponse(
            query=request.prompt,
            names=names,
            threads=result.get("threads"),
            total_results=len(names)
        )

    except Exception as e:
        logger.error(f"Generate error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/deeper", response_model=DeeperResponse)
async def go_deeper(request: DeeperRequest):
    """
    Explore a name across multiple dimensions.

    Dimensions:
    - same_family: Related names from same origin
    - similar_meaning: Names with similar meanings
    - phonetic: Names that sound similar
    - syllable_remix: Creative variations
    - cross_cultural: Same archetype in other cultures
    """
    try:
        logger.info(f"Go Deeper request: '{request.name}'")

        result = await name_generator.go_deeper(
            name=request.name,
            context=request.context,
            dimensions=request.dimensions
        )

        return DeeperResponse(
            source_name=result.get("source_name", request.name),
            threads=result.get("threads", [])
        )

    except Exception as e:
        logger.error(f"Go Deeper error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/categories", response_model=CategoriesResponse)
async def get_categories():
    """Get available name categories"""
    categories = [
        Category(
            id=c["id"],
            name=c["name"],
            description=c["description"],
            color=c["color"]
        )
        for c in CATEGORIES_LIST
    ]
    return CategoriesResponse(categories=categories)


@app.get("/api/examples", response_model=ExamplesResponse)
async def get_examples():
    """Get example prompts"""
    return ExamplesResponse(examples=EXAMPLE_PROMPTS)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
