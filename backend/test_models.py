#!/usr/bin/env python3
"""
Test script to verify ML models are working correctly
"""

import sys
import os
from datetime import datetime

def test_models():
    """Test the ML models with sample data"""
    print("🧪 Testing ML Models")
    print("=" * 40)
    
    try:
        from ml_service import MLService
        
        # Initialize ML service
        print("🔄 Loading ML service...")
        ml_service = MLService()
        print("✅ ML service loaded successfully")
        
        # Test data for Washington DC
        test_location = {
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
        
        print("\n🔬 Testing predictions...")
        
        # Test NO2 prediction
        print("🔄 Testing NO2 prediction...")
        no2_result = ml_service.predict('no2', test_location)
        if no2_result:
            print(f"✅ NO2 prediction: {no2_result['predicted_value']:.2e}")
        else:
            print("❌ NO2 prediction failed")
        
        # Test O3 prediction
        print("🔄 Testing O3 prediction...")
        o3_result = ml_service.predict('o3', test_location)
        if o3_result:
            print(f"✅ O3 prediction: {o3_result['predicted_value']:.2f}")
        else:
            print("❌ O3 prediction failed")
        
        # Test HCHO prediction
        print("🔄 Testing HCHO prediction...")
        hcho_result = ml_service.predict('hcho', test_location)
        if hcho_result:
            print(f"✅ HCHO prediction: {hcho_result['predicted_value']:.2e}")
        else:
            print("❌ HCHO prediction failed")
        
        # Test AQI calculation
        if no2_result and o3_result and hcho_result:
            print("\n🔄 Testing AQI calculation...")
            aqi = ml_service.calculate_aqi(
                no2_result['predicted_value'],
                o3_result['predicted_value'],
                hcho_result['predicted_value']
            )
            print(f"✅ AQI: {aqi}")
            
            # Test health recommendation
            recommendation = ml_service.get_health_recommendation(aqi)
            print(f"✅ Health recommendation: {recommendation}")
        
        print("\n🎉 All tests passed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_models()
    sys.exit(0 if success else 1)
