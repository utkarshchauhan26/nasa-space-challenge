#!/usr/bin/env python3
"""
NASA Air Quality Backend Startup Script
"""

import uvicorn
from main import app

if __name__ == "__main__":
    print("🚀 Starting NASA Air Quality Backend...")
    print("📍 API will be available at: http://localhost:8000")
    print("📚 API docs at: http://localhost:8000/docs")
    
    # Pass the application as an import string so uvicorn can enable reload/workers.
    # See: https://www.uvicorn.org/deployment/#running-programmatically
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
