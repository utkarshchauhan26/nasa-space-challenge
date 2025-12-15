import joblib
import pandas as pd
import numpy as np
from datetime import datetime
import os

class MLService:
    def __init__(self):
        self.models = {}
        self.features = {}
        self.load_models()
    
    def load_models(self):
        """Load all trained models"""
        from config import MODEL_PATH
        # Use configured MODEL_PATH and resolve it relative to this file for robust locating.
        # MODEL_PATH from config.py may be relative (default "../models/").
        package_dir = os.path.dirname(os.path.abspath(__file__))
        model_base = os.path.abspath(os.path.join(package_dir, MODEL_PATH))

        # Also prepare a couple of sensible fallbacks in case MODEL_PATH isn't set correctly.
        fallback_dirs = [
            os.path.abspath(os.path.join(package_dir, 'models')),
            os.path.abspath(os.path.join(package_dir, '..', 'models')),
            os.path.abspath(os.path.join(package_dir, '..', '..', 'models')),
        ]

        model_paths = {
            'no2': 'no2_xgboost_model.pkl',
            'o3': 'o3_xgboost_model.pkl',
            'hcho': 'hcho_random_forest_model.pkl'
        }

        feature_paths = {
            'no2': 'no2_features.pkl',
            'o3': 'o3_features.pkl',
            'hcho': 'hcho_features.pkl'
        }
        
        for pollutant, model_path in model_paths.items():
            print(f"Loading models from configured MODEL_PATH: {model_base}")

            # Resolve model and feature file paths with fallbacks
            tried_paths = []
            model_file_path = os.path.join(model_base, model_path)
            tried_paths.append(model_file_path)

            if not os.path.exists(model_file_path):
                # try fallbacks
                for d in fallback_dirs:
                    p = os.path.join(d, model_path)
                    tried_paths.append(p)
                    if os.path.exists(p):
                        model_file_path = p
                        break

            feature_file_path = os.path.join(model_base, feature_paths[pollutant])
            tried_paths.append(feature_file_path)
            if not os.path.exists(feature_file_path):
                for d in fallback_dirs:
                    p = os.path.join(d, feature_paths[pollutant])
                    tried_paths.append(p)
                    if os.path.exists(p):
                        feature_file_path = p
                        break

            try:
                if not os.path.exists(model_file_path):
                    raise FileNotFoundError(f"Model file not found. Tried: {tried_paths}")

                if not os.path.exists(feature_file_path):
                    raise FileNotFoundError(f"Feature file not found. Tried: {tried_paths}")

                self.models[pollutant] = joblib.load(model_file_path)
                self.features[pollutant] = joblib.load(feature_file_path)
                print(f"✅ Loaded {pollutant} model from: {model_file_path}")
            except Exception as e:
                print(f"❌ Error loading {pollutant} model: {e}")
    
    def prepare_features(self, pollutant, location_data):
        """Prepare features for prediction"""
        features = self.features[pollutant]
        
        # Create feature dictionary
        feature_dict = {}
        
        # Weather features
        feature_dict['T2M'] = location_data.get('temperature', 25.0)
        feature_dict['RH2M'] = location_data.get('humidity', 60.0)
        feature_dict['PS'] = location_data.get('pressure', 101325.0)
        feature_dict['WS10M'] = location_data.get('wind_speed', 5.0)
        feature_dict['WD10M'] = location_data.get('wind_direction', 180.0)
        feature_dict['WS50M'] = location_data.get('wind_speed_50m', 5.0)
        feature_dict['WD50M'] = location_data.get('wind_direction_50m', 180.0)
        feature_dict['RHOA'] = location_data.get('air_density', 1.2)
        feature_dict['QV10M'] = location_data.get('specific_humidity', 0.01)
        
        # Temporal features
        now = datetime.now()
        feature_dict['year'] = now.year
        feature_dict['month'] = now.month
        feature_dict['day'] = now.day
        feature_dict['hour'] = now.hour
        feature_dict['day_of_week'] = now.weekday()
        
        # Location features
        feature_dict['latitude'] = location_data.get('latitude', 38.9072)
        feature_dict['longitude'] = location_data.get('longitude', -77.0369)
        
        # Air quality features (if available)
        feature_dict['airnow_no2'] = location_data.get('airnow_no2', 0.0)
        feature_dict['airnow_o3'] = location_data.get('airnow_o3', 0.0)
        feature_dict['airnow_pm25'] = location_data.get('airnow_pm25', 0.0)
        
        # Uncertainty features
        if pollutant == 'no2':
            feature_dict['tempo_no2_uncertainty'] = location_data.get('no2_uncertainty', 1e15)
        elif pollutant == 'hcho':
            feature_dict['tempo_hcho_uncertainty'] = location_data.get('hcho_uncertainty', 1e15)
        
        # Create DataFrame with correct feature order
        feature_df = pd.DataFrame([feature_dict])
        
        # Ensure all required features are present
        for feature in features:
            if feature not in feature_df.columns:
                feature_df[feature] = 0.0
        
        return feature_df[features]
    
    def predict(self, pollutant, location_data):
        """Make prediction for specific pollutant"""
        if pollutant not in self.models:
            raise ValueError(f"Model for {pollutant} not found")
        
        try:
            # Prepare features
            features = self.prepare_features(pollutant, location_data)
            
            # Make prediction
            prediction = self.models[pollutant].predict(features)[0]
            
            return {
                'pollutant': pollutant,
                'predicted_value': float(prediction),
                'confidence': 0.95,  # Default confidence
                'model_version': 'v1.0',
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            print(f"❌ Prediction error for {pollutant}: {e}")
            return None
    
    def calculate_aqi(self, no2_value, o3_value, hcho_value=None):
        """Calculate Air Quality Index"""
        # Convert to AQI (simplified calculation)
        no2_aqi = min(500, max(0, (no2_value / 1e15) * 100))
        o3_aqi = min(500, max(0, (o3_value / 100) * 100))
        
        # Return the maximum AQI
        return int(max(no2_aqi, o3_aqi))
    
    def get_health_recommendation(self, aqi):
        """Get health recommendation based on AQI"""
        if aqi <= 50:
            return "Good - Air quality is satisfactory for most people."
        elif aqi <= 100:
            return "Moderate - Sensitive individuals should consider limiting outdoor exertion."
        elif aqi <= 150:
            return "Unhealthy for Sensitive Groups - Sensitive groups should avoid outdoor activities."
        elif aqi <= 200:
            return "Unhealthy - Everyone should limit outdoor exertion."
        elif aqi <= 300:
            return "Very Unhealthy - Everyone should avoid outdoor activities."
        else:
            return "Hazardous - Emergency conditions - everyone should avoid outdoor exposure."
