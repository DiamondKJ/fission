"""
Pydantic models for Fission API
"""

from pydantic import BaseModel
from typing import List, Optional, Dict, Any


class GenerateRequest(BaseModel):
    prompt: str
    num_results: int = 50
    categories: Optional[List[str]] = None
    style: str = "professional"


class NameResult(BaseModel):
    id: str
    name: str
    category: str
    origin: Optional[str] = None
    meaning: Optional[str] = None
    pronunciation: Optional[str] = None
    tags: Optional[List[str]] = None


class Thread(BaseModel):
    thread_id: int
    title: str
    description: Optional[str] = None
    name_ids: Optional[List[str]] = None
    names: Optional[List[NameResult]] = None


class GenerateResponse(BaseModel):
    query: str
    names: List[NameResult]
    threads: Optional[List[Thread]] = None
    total_results: int


class DeeperRequest(BaseModel):
    name: str
    context: str = ""
    dimensions: Optional[List[str]] = None


class DeeperName(BaseModel):
    id: str
    name: str
    meaning: Optional[str] = None
    origin: Optional[str] = None


class DeeperThread(BaseModel):
    dimension: str
    title: str
    description: Optional[str] = None
    names: List[DeeperName]


class DeeperResponse(BaseModel):
    source_name: str
    threads: List[DeeperThread]


class Category(BaseModel):
    id: str
    name: str
    description: str
    color: str


class CategoriesResponse(BaseModel):
    categories: List[Category]


class ExamplesResponse(BaseModel):
    examples: List[str]


class HealthResponse(BaseModel):
    status: str
    claude_available: bool
    version: str
