"""
Application configuration settings.

This module loads environment variables and provides
application-wide configuration values.
"""

import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Centralised application settings."""

    APP_ENV = os.getenv("APP_ENV", "development")
    DEBUG = os.getenv("DEBUG", "True").lower() == "true"

    API_HOST = os.getenv("API_HOST", "127.0.0.1")
    API_PORT = int(os.getenv("API_PORT", 5000))

    AWS_REGION = os.getenv("AWS_REGION", "eu-west-1")