#!/usr/bin/env python3
"""
NASA Air Quality Backend Setup Script
"""

import subprocess
import sys
import os

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e}")
        print(f"Error output: {e.stderr}")
        return False

def main():
    print("🚀 NASA Air Quality Backend Setup")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists("requirements.txt"):
        print("❌ Please run this script from the backend directory")
        sys.exit(1)
    
    # Install Python dependencies
    if not run_command("pip install -r requirements.txt", "Installing Python dependencies"):
        print("❌ Failed to install dependencies. Please check your Python environment.")
        sys.exit(1)
    
    # Check if models exist
    if not os.path.exists("../models"):
        print("❌ Models directory not found. Please ensure models are copied to ../models/")
        sys.exit(1)
    
    # Check for required model files
    required_models = [
        "../models/no2_xgboost_model.pkl",
        "../models/o3_xgboost_model.pkl", 
        "../models/hcho_random_forest_model.pkl",
        "../models/no2_features.pkl",
        "../models/o3_features.pkl",
        "../models/hcho_features.pkl"
    ]
    
    missing_models = [model for model in required_models if not os.path.exists(model)]
    if missing_models:
        print(f"❌ Missing model files: {missing_models}")
        print("Please copy the trained models to the models directory")
        sys.exit(1)
    
    print("✅ All model files found")
    
    # Test model loading
    print("🔄 Testing model loading...")
    try:
        from ml_service import MLService
        ml_service = MLService()
        print("✅ Models loaded successfully")
    except Exception as e:
        print(f"❌ Model loading failed: {e}")
        sys.exit(1)
    
    print("\n🎉 Setup completed successfully!")
    print("\n📋 Next steps:")
    print("1. Start Redis: redis-server")
    print("2. Start PostgreSQL database")
    print("3. Run the backend: python start.py")
    print("4. Visit: http://localhost:8000/docs")

if __name__ == "__main__":
    main()
