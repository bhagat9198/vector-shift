from pydantic import BaseSettings, Field
from functools import lru_cache
import os
import urllib.parse
from typing import Optional
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings(BaseSettings):
    # Redis
    redis_host: str = os.getenv("REDIS_HOST", "localhost")
    
    # Airtable
    airtable_client_id: str = os.getenv("AIRTABLE_CLIENT_ID", "")
    airtable_client_secret: str = os.getenv("AIRTABLE_CLIENT_SECRET", "")
    
    # Notion
    notion_client_id: str = os.getenv("NOTION_CLIENT_ID", "")
    notion_client_secret: str = os.getenv("NOTION_CLIENT_SECRET", "")
    
    # HubSpot
    hubspot_client_id: str = os.getenv("HUBSPOT_CLIENT_ID", "")
    hubspot_client_secret: str = os.getenv("HUBSPOT_CLIENT_SECRET", "")
    
    # Base URL
    base_url: str = os.getenv("BASE_URL", "http://localhost:8000")
    
    @property
    def encoded_base_url(self) -> str:
        """Return URL-encoded version of base_url"""
        return urllib.parse.quote_plus(self.base_url)
    
    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache()
def get_settings() -> Settings:
    return Settings()

# Create a settings instance to be imported by other modules
settings = get_settings()
