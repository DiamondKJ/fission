"""
Response caching for Fission API
File-based caching with TTL support
"""

import os
import json
import hashlib
import time
import logging
from pathlib import Path
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

CACHE_DIR = Path(__file__).parent / ".cache"
DEFAULT_TTL = 3600  # 1 hour


class ResponseCache:
    """File-based response cache with TTL"""

    def __init__(self, cache_dir: Path = CACHE_DIR, default_ttl: int = DEFAULT_TTL):
        self.cache_dir = cache_dir
        self.default_ttl = default_ttl
        self._ensure_cache_dir()

    def _ensure_cache_dir(self):
        """Create cache directory if it doesn't exist"""
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        # Add .gitignore to cache dir
        gitignore = self.cache_dir / ".gitignore"
        if not gitignore.exists():
            gitignore.write_text("*\n!.gitignore\n")

    def _get_cache_key(self, key_data: Dict[str, Any]) -> str:
        """Generate a cache key from request data"""
        key_str = json.dumps(key_data, sort_keys=True)
        return hashlib.md5(key_str.encode()).hexdigest()

    def _get_cache_path(self, cache_key: str) -> Path:
        """Get the file path for a cache key"""
        return self.cache_dir / f"{cache_key}.json"

    def get(self, key_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Get cached response if valid

        Args:
            key_data: Dict used to generate cache key

        Returns:
            Cached data or None if not found/expired
        """
        cache_key = self._get_cache_key(key_data)
        cache_path = self._get_cache_path(cache_key)

        if not cache_path.exists():
            return None

        try:
            with open(cache_path, 'r') as f:
                cached = json.load(f)

            # Check TTL
            if time.time() > cached.get('expires_at', 0):
                cache_path.unlink(missing_ok=True)
                logger.info(f"Cache expired for key {cache_key[:8]}...")
                return None

            logger.info(f"Cache hit for key {cache_key[:8]}...")
            return cached.get('data')

        except (json.JSONDecodeError, IOError) as e:
            logger.error(f"Cache read error: {e}")
            cache_path.unlink(missing_ok=True)
            return None

    def set(self, key_data: Dict[str, Any], data: Dict[str, Any], ttl: Optional[int] = None):
        """
        Cache a response

        Args:
            key_data: Dict used to generate cache key
            data: Data to cache
            ttl: Time to live in seconds (optional)
        """
        cache_key = self._get_cache_key(key_data)
        cache_path = self._get_cache_path(cache_key)

        ttl = ttl or self.default_ttl

        try:
            cached = {
                'data': data,
                'created_at': time.time(),
                'expires_at': time.time() + ttl,
                'key_data': key_data
            }

            with open(cache_path, 'w') as f:
                json.dump(cached, f)

            logger.info(f"Cached response for key {cache_key[:8]}... (TTL: {ttl}s)")

        except IOError as e:
            logger.error(f"Cache write error: {e}")

    def clear(self, key_data: Optional[Dict[str, Any]] = None) -> int:
        """
        Clear cache entries

        Args:
            key_data: Specific key to clear, or None for all

        Returns:
            Number of entries cleared
        """
        if key_data:
            cache_key = self._get_cache_key(key_data)
            cache_path = self._get_cache_path(cache_key)
            if cache_path.exists():
                cache_path.unlink()
                return 1
            return 0

        # Clear all
        count = 0
        for cache_file in self.cache_dir.glob("*.json"):
            cache_file.unlink()
            count += 1

        logger.info(f"Cleared {count} cache entries")
        return count

    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        cache_files = list(self.cache_dir.glob("*.json"))
        total_size = sum(f.stat().st_size for f in cache_files)

        valid_count = 0
        expired_count = 0

        for cache_file in cache_files:
            try:
                with open(cache_file, 'r') as f:
                    cached = json.load(f)
                if time.time() <= cached.get('expires_at', 0):
                    valid_count += 1
                else:
                    expired_count += 1
            except:
                expired_count += 1

        return {
            'total_entries': len(cache_files),
            'valid_entries': valid_count,
            'expired_entries': expired_count,
            'total_size_mb': round(total_size / (1024 * 1024), 2),
            'cache_dir': str(self.cache_dir)
        }


# Singleton instance
response_cache = ResponseCache()
