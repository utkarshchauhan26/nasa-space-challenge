import os
from dotenv import load_dotenv

load_dotenv()

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://nasa_user:password@localhost:5432/nasa_air_quality")

# Redis configuration
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

# NASA Earthdata credentials
NASA_EARTHDATA_USERNAME = os.getenv("NASA_EARTHDATA_USERNAME", "")
NASA_EARTHDATA_PASSWORD = os.getenv("NASA_EARTHDATA_PASSWORD", "")

# API configuration
API_HOST = "0.0.0.0"
API_PORT = 8000

# Model configuration
MODEL_PATH = "../models/"
