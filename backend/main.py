from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import json
import redis

from database import get_db, create_tables, AirQualityForecast, HistoricalData
from ml_service import MLService
from data_collector import NASA_DataCollector

# Initialize FastAPI app
app = FastAPI(
    title="NASA Air Quality Forecasting API",
    description="Real-time air quality predictions using TEMPO satellite data and ML models",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
ml_service = MLService()
data_collector = NASA_DataCollector()

# Redis client with error handling
try:
    redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
    redis_client.ping()  # Test connection
    print("✅ Redis connected successfully")
except Exception as e:
    print(f"⚠️ Redis connection failed: {e}")
    redis_client = None

# Create database tables
create_tables()

# Location coordinates
LOCATIONS = {
    "Washington_DC": {"lat": 38.9072, "lon": -77.0369, "name": "Washington, DC"},
    "Los_Angeles": {"lat": 34.0522, "lon": -118.2437, "name": "Los Angeles, CA"},
    "New_York": {"lat": 40.7128, "lon": -74.0060, "name": "New York, NY"},
    "Chicago": {"lat": 41.8781, "lon": -87.6298, "name": "Chicago, IL"},
    "Houston": {"lat": 29.7604, "lon": -95.3698, "name": "Houston, TX"}
}

@app.get("/")
async def root():
    return {
        "message": "NASA Air Quality Forecasting API",
        "version": "1.0.0",
        "status": "active"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/forecast/{location}")
async def get_forecast(location: str, hours: int = 24, db: Session = Depends(get_db)):
    """Get air quality forecast for specific location"""
    
    if location not in LOCATIONS:
        raise HTTPException(status_code=404, detail="Location not found")
    
    # Check cache first (if Redis is available)
    cache_key = f"forecast:{location}:{hours}"
    cached_result = None
    if redis_client:
        try:
            cached_result = redis_client.get(cache_key)
        except Exception as e:
            print(f"⚠️ Redis cache error: {e}")
    
    if cached_result:
        return json.loads(cached_result)
    
    # Get location data
    loc_data = LOCATIONS[location]
    
    # Generate forecast
    forecast_data = await generate_forecast(loc_data, hours)
    
    # Cache result for 1 hour (if Redis is available)
    if redis_client:
        try:
            redis_client.setex(cache_key, 3600, json.dumps(forecast_data))
        except Exception as e:
            print(f"⚠️ Redis cache set error: {e}")
    
    return forecast_data


@app.get("/forecast")
async def get_forecast_by_coords(lat: float | None = None, lon: float | None = None, hours: int = 24):
    """Get air quality forecast for coordinates (query params) or return 400 if missing.

    Usage: /forecast?lat=38.9072&lon=-77.0369&hours=24
    This endpoint mirrors the path-based /forecast/{location} but accepts lat/lon so
    frontend apps that send coordinates will work without a 404.
    """
    if lat is None or lon is None:
        # Match the same error semantics as the path-based endpoint (404 when location missing)
        # but here a 400 makes more sense for missing query params.
        raise HTTPException(status_code=400, detail="Missing 'lat' or 'lon' query parameters")

    # Build a minimal location_data structure compatible with generate_forecast
    loc_data = {
        'lat': float(lat),
        'lon': float(lon),
        'name': f'Custom ({lat},{lon})'
    }

    forecast_data = await generate_forecast(loc_data, hours)
    return forecast_data

@app.get("/historical/{location}")
async def get_historical_data(location: str, days: int = 30, db: Session = Depends(get_db)):
    """Get historical air quality data"""
    
    if location not in LOCATIONS:
        raise HTTPException(status_code=404, detail="Location not found")
    
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    # Query historical data
    historical_records = db.query(HistoricalData).filter(
        HistoricalData.location_name == location,
        HistoricalData.datetime >= start_date,
        HistoricalData.datetime <= end_date
    ).order_by(HistoricalData.datetime.desc()).all()
    
    # Format data
    historical_data = []
    for record in historical_records:
        historical_data.append({
            "datetime": record.datetime.isoformat(),
            "no2_actual": record.no2_actual,
            "o3_actual": record.o3_actual,
            "hcho_actual": record.hcho_actual,
            "temperature": record.temperature,
            "humidity": record.humidity,
            "wind_speed": record.wind_speed,
            "pressure": record.pressure,
            "source": record.source
        })
    
    return {
        "location": location,
        "days": days,
        "data": historical_data
    }

@app.post("/forecast/batch")
async def batch_forecast(locations: list[str], background_tasks: BackgroundTasks):
    """Generate forecasts for multiple locations"""
    background_tasks.add_task(process_batch_forecasts, locations)
    return {"message": f"Processing forecasts for {len(locations)} locations"}

@app.get("/locations")
async def get_locations():
    """Get all supported locations"""
    return {"locations": list(LOCATIONS.keys())}

@app.get("/data/collect/{location}")
async def collect_data(location: str):
    """Manually trigger data collection for a location"""
    if location not in LOCATIONS:
        raise HTTPException(status_code=404, detail="Location not found")
    
    try:
        # Collect fresh data
        data = data_collector.collect_all_data(location)
        
        if data:
            return {
                "status": "success",
                "location": location,
                "timestamp": datetime.now().isoformat(),
                "data_sources": list(data.keys()),
                "message": f"Data collected successfully for {location}"
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to collect data")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error collecting data: {str(e)}")

@app.get("/data/status")
async def get_data_status():
    """Get data collection status"""
    try:
        status = data_collector.get_status()
        return status
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting status: {str(e)}")

@app.get("/data/features/{location}")
async def get_ml_features(location: str):
    """Get ML features for a location"""
    if location not in LOCATIONS:
        raise HTTPException(status_code=404, detail="Location not found")
    
    try:
        features = data_collector.get_ml_features(location)
        
        if features:
            return {
                "status": "success",
                "location": location,
                "features": features,
                "timestamp": datetime.now().isoformat()
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to extract features")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error extracting features: {str(e)}")

@app.get("/alerts/{location}")
async def get_alerts(location: str):
    """Get air quality alerts for a location"""
    if location not in LOCATIONS:
        raise HTTPException(status_code=404, detail="Location not found")
    
    try:
        # Get current forecast
        forecast_response = await get_forecast(location, 1)
        if not forecast_response.get('forecasts'):
            raise HTTPException(status_code=404, detail="No forecast data available")
        
        current_forecast = forecast_response['forecasts'][0]
        aqi = current_forecast['aqi_predicted']
        
        alerts = []
        
        # Generate alerts based on AQI
        if aqi > 300:
            alerts.append({
                "level": "hazardous",
                "title": "Hazardous Air Quality",
                "message": "Emergency conditions - everyone should avoid outdoor exposure",
                "recommendations": [
                    "Stay indoors",
                    "Use air purifiers",
                    "Avoid all physical activity"
                ]
            })
        elif aqi > 200:
            alerts.append({
                "level": "very_unhealthy",
                "title": "Very Unhealthy Air Quality",
                "message": "Everyone should avoid outdoor activities",
                "recommendations": [
                    "Stay indoors as much as possible",
                    "Use air purifiers",
                    "Wear N95 masks if going outside"
                ]
            })
        elif aqi > 150:
            alerts.append({
                "level": "unhealthy",
                "title": "Unhealthy Air Quality",
                "message": "Everyone should limit outdoor exertion",
                "recommendations": [
                    "Avoid outdoor activities",
                    "Keep windows and doors closed",
                    "Use air conditioning if available"
                ]
            })
        elif aqi > 100:
            alerts.append({
                "level": "unhealthy_sensitive",
                "title": "Unhealthy for Sensitive Groups",
                "message": "Sensitive groups should avoid outdoor activities",
                "recommendations": [
                    "Children and elderly should stay indoors",
                    "People with heart or lung disease should avoid outdoor activities"
                ]
            })
        
        return {
            "location": location,
            "aqi": aqi,
            "alerts": alerts,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating alerts: {str(e)}")

@app.get("/health-recommendations/{location}")
async def get_health_recommendations(location: str):
    """Get health recommendations for a location"""
    if location not in LOCATIONS:
        raise HTTPException(status_code=404, detail="Location not found")
    
    try:
        # Get current forecast
        forecast_response = await get_forecast(location, 1)
        if not forecast_response.get('forecasts'):
            raise HTTPException(status_code=404, detail="No forecast data available")
        
        current_forecast = forecast_response['forecasts'][0]
        aqi = current_forecast['aqi_predicted']
        
        # Get health recommendations from ML service
        recommendations = ml_service.get_health_recommendation(aqi)
        
        return {
            "location": location,
            "aqi": aqi,
            "recommendations": recommendations,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting health recommendations: {str(e)}")

@app.get("/validation/{location}")
async def get_validation_data(location: str):
    """Get ground truth validation data for a location"""
    if location not in LOCATIONS:
        raise HTTPException(status_code=404, detail="Location not found")
    
    try:
        # Simulate validation data (in real implementation, this would come from database)
        validation_data = {
            "pandora_accuracy": 97.6,
            "airnow_accuracy": 95.2,
            "model_confidence": 94.8,
            "last_validation": datetime.now().isoformat(),
            "validation_sources": ["Pandora", "AirNow", "TOLNet"]
        }
        
        return {
            "location": location,
            "validation": validation_data,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting validation data: {str(e)}")

async def generate_forecast(location_data, hours):
    """Generate forecast for location"""
    forecasts = []
    
    for i in range(hours):
        forecast_time = datetime.now() + timedelta(hours=i)
        
        # Prepare location data for prediction
        loc_input = {
            'latitude': location_data['lat'],
            'longitude': location_data['lon'],
            'temperature': 25.0 + (i * 0.1),  # Simulate temperature change
            'humidity': 60.0 + (i * 0.5),
            'pressure': 101325.0,
            'wind_speed': 5.0 + (i * 0.2),
            'wind_direction': 180.0,
            'airnow_no2': 0.0,
            'airnow_o3': 0.0,
            'airnow_pm25': 0.0
        }
        
        # Get predictions from ML models
        no2_pred = ml_service.predict('no2', loc_input)
        o3_pred = ml_service.predict('o3', loc_input)
        hcho_pred = ml_service.predict('hcho', loc_input)
        
        if no2_pred and o3_pred and hcho_pred:
            # Calculate AQI
            aqi = ml_service.calculate_aqi(
                no2_pred['predicted_value'],
                o3_pred['predicted_value'],
                hcho_pred['predicted_value']
            )
            
            forecasts.append({
                "datetime": forecast_time.isoformat(),
                "no2_predicted": no2_pred['predicted_value'],
                "o3_predicted": o3_pred['predicted_value'],
                "hcho_predicted": hcho_pred['predicted_value'],
                "aqi_predicted": aqi,
                "confidence_score": (no2_pred['confidence'] + o3_pred['confidence'] + hcho_pred['confidence']) / 3,
                "health_recommendation": ml_service.get_health_recommendation(aqi)
            })
    
    return {
        "location": location_data['name'],
        "latitude": location_data['lat'],
        "longitude": location_data['lon'],
        "forecasts": forecasts,
        "generated_at": datetime.now().isoformat()
    }

async def process_batch_forecasts(locations):
    """Process batch forecasts in background"""
    for location in locations:
        if location in LOCATIONS:
            try:
                # Generate forecast for each location
                loc_data = LOCATIONS[location]
                forecast_data = await generate_forecast(loc_data, 24)
                print(f"✅ Generated forecast for {location}")
            except Exception as e:
                print(f"❌ Error generating forecast for {location}: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
