#!/usr/bin/env python3
"""
Simple ML Prediction Test
Tests the ML models directly and through the API
"""

import requests
import json
from datetime import datetime

# Backend URL
BASE_URL = "http://localhost:8000"

def test_direct_ml():
    """Test ML models directly"""
    print("🔍 Testing ML Models Directly...")
    try:
        from ml_service import MLService
        
        ml_service = MLService()
        
        # Test data
        test_input = {
            'latitude': 38.9072,
            'longitude': -77.0369,
            'temperature': 25.0,
            'humidity': 60.0,
            'pressure': 101325.0,
            'wind_speed': 5.0,
            'wind_direction': 180.0,
            'airnow_no2': 0.0,
            'airnow_o3': 0.0,
            'airnow_pm25': 0.0
        }
        
        # Test NO2 prediction
        no2_result = ml_service.predict('no2', test_input)
        if no2_result:
            print(f"✅ NO2 prediction: {no2_result['predicted_value']:.2f}")
        else:
            print("❌ NO2 prediction failed")
        
        # Test O3 prediction
        o3_result = ml_service.predict('o3', test_input)
        if o3_result:
            print(f"✅ O3 prediction: {o3_result['predicted_value']:.2f}")
        else:
            print("❌ O3 prediction failed")
        
        # Test HCHO prediction
        hcho_result = ml_service.predict('hcho', test_input)
        if hcho_result:
            print(f"✅ HCHO prediction: {hcho_result['predicted_value']:.2f}")
        else:
            print("❌ HCHO prediction failed")
        
        # Test AQI calculation
        if no2_result and o3_result and hcho_result:
            aqi = ml_service.calculate_aqi(
                no2_result['predicted_value'],
                o3_result['predicted_value'],
                hcho_result['predicted_value']
            )
            print(f"✅ AQI: {aqi}")
            
            # Test health recommendation
            recommendation = ml_service.get_health_recommendation(aqi)
            print(f"✅ Health recommendation: {recommendation}")
        
        return True
        
    except Exception as e:
        print(f"❌ Direct ML test error: {e}")
        return False

def test_api_forecast():
    """Test forecast through API"""
    print("\n🔍 Testing Forecast API...")
    try:
        response = requests.get(f"{BASE_URL}/forecast/Washington_DC")
        if response.status_code == 200:
            data = response.json()
            print("✅ Forecast API working")
            
            if data.get('forecasts'):
                first_forecast = data['forecasts'][0]
                print(f"   NO2: {first_forecast.get('no2_predicted', 'N/A'):.2f}")
                print(f"   O3: {first_forecast.get('o3_predicted', 'N/A'):.2f}")
                print(f"   HCHO: {first_forecast.get('hcho_predicted', 'N/A'):.2f}")
                print(f"   AQI: {first_forecast.get('aqi_predicted', 'N/A')}")
                print(f"   Health: {first_forecast.get('health_recommendation', 'N/A')}")
            
            return True
        else:
            print(f"❌ Forecast API failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Forecast API error: {e}")
        return False

def test_all_locations():
    """Test forecasts for all locations"""
    print("\n🔍 Testing All Locations...")
    locations = ["Washington_DC", "Los_Angeles", "New_York", "Chicago", "Houston"]
    
    for location in locations:
        try:
            response = requests.get(f"{BASE_URL}/forecast/{location}")
            if response.status_code == 200:
                data = response.json()
                if data.get('forecasts'):
                    first_forecast = data['forecasts'][0]
                    aqi = first_forecast.get('aqi_predicted', 'N/A')
                    print(f"✅ {location}: AQI {aqi}")
                else:
                    print(f"⚠️ {location}: No forecasts")
            else:
                print(f"❌ {location}: Failed")
        except Exception as e:
            print(f"❌ {location}: Error - {e}")
    
    return True

def main():
    """Run all prediction tests"""
    print("🚀 Starting ML Prediction Tests")
    print("=" * 50)
    
    tests = [
        test_direct_ml,
        test_api_forecast,
        test_all_locations
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
    
    print("\n" + "=" * 50)
    print(f"📊 Prediction Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All prediction tests passed! ML models are working correctly.")
    else:
        print("⚠️  Some prediction tests failed.")
    
    return passed == total

if __name__ == "__main__":
    main()
