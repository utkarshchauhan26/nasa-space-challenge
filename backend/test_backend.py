#!/usr/bin/env python3
"""
Backend Testing Script
Tests all backend functionality including health, predictions, and data collection
"""

import requests
import json
import time
from datetime import datetime, timedelta

# Backend URL
BASE_URL = "http://localhost:8000"

def test_health():
    """Test backend health endpoint"""
    print("🔍 Testing Health Endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("✅ Health check passed")
            print(f"   Response: {response.json()}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_forecast():
    """Test air quality forecast endpoint"""
    print("\n🔍 Testing Forecast Endpoint...")
    try:
        # Test with Washington DC location
        response = requests.get(f"{BASE_URL}/forecast/Washington_DC")
        if response.status_code == 200:
            data = response.json()
            print("✅ Forecast endpoint working")
            print(f"   Location: {data.get('location', 'N/A')}")
            print(f"   Forecast hours: {len(data.get('forecasts', []))}")
            if data.get('forecasts'):
                first_forecast = data['forecasts'][0]
                print(f"   First forecast AQI: {first_forecast.get('aqi_predicted', 'N/A')}")
            return True
        else:
            print(f"❌ Forecast failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Forecast error: {e}")
        return False

def test_historical_data():
    """Test historical data endpoint"""
    print("\n🔍 Testing Historical Data Endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/historical/Washington_DC?days=7")
        if response.status_code == 200:
            data = response.json()
            print("✅ Historical data endpoint working")
            print(f"   Data points: {len(data.get('data', []))}")
            return True
        else:
            print(f"❌ Historical data failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Historical data error: {e}")
        return False

def test_locations():
    """Test locations endpoint"""
    print("\n🔍 Testing Locations Endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/locations")
        if response.status_code == 200:
            data = response.json()
            print("✅ Locations endpoint working")
            print(f"   Available locations: {len(data.get('locations', []))}")
            return True
        else:
            print(f"❌ Locations failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Locations error: {e}")
        return False

def test_data_collection():
    """Test data collection endpoint"""
    print("\n🔍 Testing Data Collection...")
    try:
        response = requests.get(f"{BASE_URL}/data/collect/Washington_DC")
        if response.status_code == 200:
            data = response.json()
            print("✅ Data collection started")
            print(f"   Status: {data.get('status', 'N/A')}")
            return True
        else:
            print(f"❌ Data collection failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Data collection error: {e}")
        return False

def test_data_status():
    """Test data status endpoint"""
    print("\n🔍 Testing Data Status...")
    try:
        response = requests.get(f"{BASE_URL}/data/status")
        if response.status_code == 200:
            data = response.json()
            print("✅ Data status endpoint working")
            print(f"   Status: {data.get('status', 'N/A')}")
            return True
        else:
            print(f"❌ Data status failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Data status error: {e}")
        return False

def test_ml_prediction():
    """Test ML prediction with sample data"""
    print("\n🔍 Testing ML Prediction...")
    try:
        # Test ML features endpoint
        response = requests.get(f"{BASE_URL}/data/features/Washington_DC")
        if response.status_code == 200:
            data = response.json()
            print("✅ ML features endpoint working")
            print(f"   Features available: {len(data.get('features', {}))}")
            return True
        else:
            print(f"❌ ML features failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ ML features error: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Starting Backend Tests")
    print("=" * 50)
    
    tests = [
        test_health,
        test_forecast,
        test_historical_data,
        test_locations,
        test_data_collection,
        test_data_status,
        test_ml_prediction
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
        time.sleep(1)  # Small delay between tests
    
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Backend is working correctly.")
    else:
        print("⚠️  Some tests failed. Check the backend logs for details.")
    
    return passed == total

if __name__ == "__main__":
    main()
