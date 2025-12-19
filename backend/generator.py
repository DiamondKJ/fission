"""
Claude-based name generation engine
"""

import os
import json
import logging
from typing import Dict, Any, List, Optional
from anthropic import Anthropic
from dotenv import load_dotenv

from prompts import SYSTEM_PROMPT, GENERATE_PROMPT, GO_DEEPER_PROMPT
from cache import response_cache

load_dotenv()
logger = logging.getLogger(__name__)


class NameGenerator:
    """Claude-powered business name generator"""

    def __init__(self):
        self.client = None
        self.model = "claude-sonnet-4-20250514"  # Fast and capable
        self._initialize_client()

    def _initialize_client(self):
        """Initialize the Anthropic client"""
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if api_key:
            self.client = Anthropic(api_key=api_key)
            logger.info("Anthropic client initialized successfully")
        else:
            logger.warning("ANTHROPIC_API_KEY not found - Claude features disabled")

    def is_available(self) -> bool:
        """Check if Claude is available"""
        return self.client is not None

    async def generate(
        self,
        prompt: str,
        num_results: int = 50,
        categories: Optional[List[str]] = None,
        style: str = "professional"
    ) -> Dict[str, Any]:
        """
        Generate business names from a prompt

        Args:
            prompt: The user's description or seed name
            num_results: Number of names to generate
            categories: Optional list of categories to focus on
            style: professional, playful, bold, minimal

        Returns:
            Dict with names and threads
        """
        # Check cache first
        cache_key = {
            "type": "generate",
            "prompt": prompt.lower().strip(),
            "num_results": num_results,
            "style": style
        }
        cached = response_cache.get(cache_key)
        if cached:
            logger.info(f"Returning cached result for: {prompt}")
            return cached

        if not self.client:
            return self._generate_fallback(prompt, num_results)

        try:
            user_prompt = GENERATE_PROMPT.format(
                prompt=prompt,
                num_results=num_results
            )

            response = self.client.messages.create(
                model=self.model,
                max_tokens=4096,
                system=SYSTEM_PROMPT,
                messages=[
                    {"role": "user", "content": user_prompt}
                ]
            )

            # Parse the response
            content = response.content[0].text
            result = self._parse_json_response(content)

            if result:
                # Cache the result
                response_cache.set(cache_key, result, ttl=7200)  # 2 hours
                return result
            else:
                logger.error("Failed to parse Claude response")
                return self._generate_fallback(prompt, num_results)

        except Exception as e:
            logger.error(f"Claude generation error: {e}")
            return self._generate_fallback(prompt, num_results)

    async def go_deeper(
        self,
        name: str,
        context: str = "",
        dimensions: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Explore a name across multiple dimensions

        Args:
            name: The name to explore
            context: Business context
            dimensions: Which dimensions to explore

        Returns:
            Dict with threads of related names
        """
        # Check cache first
        cache_key = {
            "type": "deeper",
            "name": name.lower().strip(),
            "context": context.lower().strip() if context else ""
        }
        cached = response_cache.get(cache_key)
        if cached:
            logger.info(f"Returning cached Go Deeper result for: {name}")
            return cached

        if not self.client:
            return self._deeper_fallback(name)

        try:
            user_prompt = GO_DEEPER_PROMPT.format(
                name=name,
                context=context or "general business"
            )

            response = self.client.messages.create(
                model=self.model,
                max_tokens=4096,
                system=SYSTEM_PROMPT,
                messages=[
                    {"role": "user", "content": user_prompt}
                ]
            )

            content = response.content[0].text
            result = self._parse_json_response(content)

            if result:
                # Cache the result
                response_cache.set(cache_key, result, ttl=7200)  # 2 hours
                return result
            else:
                logger.error("Failed to parse Claude Go Deeper response")
                return self._deeper_fallback(name)

        except Exception as e:
            logger.error(f"Claude Go Deeper error: {e}")
            return self._deeper_fallback(name)

    def _parse_json_response(self, content: str) -> Optional[Dict[str, Any]]:
        """Parse JSON from Claude's response"""
        try:
            # Try direct parse first
            return json.loads(content)
        except json.JSONDecodeError:
            # Try to extract JSON from the response
            try:
                start = content.find('{')
                end = content.rfind('}') + 1
                if start >= 0 and end > start:
                    json_str = content[start:end]
                    return json.loads(json_str)
            except json.JSONDecodeError:
                pass
        return None

    def _generate_fallback(self, prompt: str, num_results: int) -> Dict[str, Any]:
        """Fallback when Claude is unavailable"""
        logger.info("Using fallback generation")

        # Simple fallback names based on common patterns
        fallback_names = [
            {"id": "f1", "name": "Prometheus", "category": "mythology", "meaning": "Titan who brought fire to humanity", "origin": "Greek"},
            {"id": "f2", "name": "Nexus", "category": "modern", "meaning": "Connection point, central hub", "origin": "Latin"},
            {"id": "f3", "name": "Aurora", "category": "nature", "meaning": "Dawn, new beginnings", "origin": "Roman goddess"},
            {"id": "f4", "name": "Quantum", "category": "scientific", "meaning": "Discrete unit, fundamental", "origin": "Physics"},
            {"id": "f5", "name": "Catalyst", "category": "abstract", "meaning": "Agent of change", "origin": "Chemistry"},
            {"id": "f6", "name": "Atlas", "category": "mythology", "meaning": "Titan who held up the sky", "origin": "Greek"},
            {"id": "f7", "name": "Zenith", "category": "nature", "meaning": "Highest point", "origin": "Astronomy"},
            {"id": "f8", "name": "Helix", "category": "scientific", "meaning": "Spiral structure", "origin": "Biology"},
            {"id": "f9", "name": "Vanguard", "category": "historical", "meaning": "Leading position", "origin": "Military"},
            {"id": "f10", "name": "Flux", "category": "abstract", "meaning": "Continuous change", "origin": "Physics"},
        ]

        return {
            "names": fallback_names[:num_results],
            "threads": [
                {"thread_id": 0, "title": "Mythological", "description": "Names from mythology", "name_ids": ["f1", "f6"]},
                {"thread_id": 1, "title": "Scientific", "description": "Technical terms", "name_ids": ["f4", "f8"]},
            ]
        }

    def _deeper_fallback(self, name: str) -> Dict[str, Any]:
        """Fallback for Go Deeper when Claude is unavailable"""
        return {
            "source_name": name,
            "threads": [
                {
                    "dimension": "same_family",
                    "title": "Same Family",
                    "description": "Related names from the same origin",
                    "names": [
                        {"id": "d1", "name": "Helios", "meaning": "Greek god of the sun", "origin": "Greek"},
                        {"id": "d2", "name": "Selene", "meaning": "Greek goddess of the moon", "origin": "Greek"},
                    ]
                },
                {
                    "dimension": "similar_meaning",
                    "title": "Similar Meaning",
                    "description": "Names with related meanings",
                    "names": [
                        {"id": "d3", "name": "Lumina", "meaning": "Light, illumination", "origin": "Latin"},
                        {"id": "d4", "name": "Radiant", "meaning": "Emitting light or energy", "origin": "English"},
                    ]
                },
                {
                    "dimension": "syllable_remix",
                    "title": "Creative Variations",
                    "description": "Syllable combinations and remixes",
                    "names": [
                        {"id": "d5", "name": f"{name}ex", "meaning": f"Variation of {name}", "origin": "Coined"},
                        {"id": "d6", "name": f"{name}ia", "meaning": f"Variation of {name}", "origin": "Coined"},
                    ]
                }
            ]
        }


# Singleton instance
name_generator = NameGenerator()
