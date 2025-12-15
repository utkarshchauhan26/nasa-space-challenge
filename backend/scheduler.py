#!/usr/bin/env python3
"""
⏰ NASA Air Quality Data Scheduler
Automated data collection and model prediction scheduling
"""

import asyncio
import schedule
import time
import logging
from datetime import datetime, timedelta
from typing import Dict, List
import json
import os

from data_collector import NASA_DataCollector
from ml_service import MLService
from database import get_db, AirQualityForecast, HistoricalData

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class DataScheduler:
    """
    Automated scheduler for data collection and predictions
    """
    
    def __init__(self):
        self.data_collector = NASA_DataCollector()
        self.ml_service = MLService()
        self.is_running = False
        self.locations = ['washington_dc', 'los_angeles', 'new_york']
        
    def collect_and_predict(self, location: str):
        """
        Collect data and generate predictions for a location
        """
        logger.info(f"🔄 Starting data collection and prediction for {location}")
        
        try:
            # 1. Collect fresh data
            data = self.data_collector.collect_all_data(location)
            if not data:
                logger.error(f"❌ Failed to collect data for {location}")
                return
            
            # 2. Extract ML features
            features = self.data_collector.get_ml_features(location)
            if not features:
                logger.error(f"❌ Failed to extract features for {location}")
                return
            
            # 3. Generate predictions
            predictions = self.ml_service.predict_all_pollutants(features)
            if not predictions:
                logger.error(f"❌ Failed to generate predictions for {location}")
                return
            
            # 4. Save to database
            self.save_predictions(location, predictions, features)
            
            logger.info(f"✅ Successfully processed {location}")
            
        except Exception as e:
            logger.error(f"❌ Error processing {location}: {e}")
    
    def save_predictions(self, location: str, predictions: Dict, features: Dict):
        """
        Save predictions to database
        """
        try:
            db = next(get_db())
            
            # Create forecast record
            forecast = AirQualityForecast(
                location_name=location,
                latitude=features['latitude'],
                longitude=features['longitude'],
                forecast_datetime=datetime.now(),
                no2_predicted=predictions.get('no2', 0.0),
                o3_predicted=predictions.get('o3', 0.0),
                hcho_predicted=predictions.get('hcho', 0.0),
                aqi_predicted=self.calculate_aqi(predictions),
                confidence_score=predictions.get('confidence', 0.95),
                model_version="1.0"
            )
            
            db.add(forecast)
            db.commit()
            
            logger.info(f"💾 Saved predictions for {location} to database")
            
        except Exception as e:
            logger.error(f"❌ Error saving predictions: {e}")
    
    def calculate_aqi(self, predictions: Dict) -> float:
        """
        Calculate AQI from predictions
        """
        try:
            # Simple AQI calculation based on NO2 and O3
            no2_aqi = min(500, max(0, (predictions.get('no2', 0) / 100) * 100))
            o3_aqi = min(500, max(0, (predictions.get('o3', 0) / 100) * 100))
            
            # Return the maximum AQI
            return max(no2_aqi, o3_aqi)
            
        except Exception as e:
            logger.error(f"❌ Error calculating AQI: {e}")
            return 50.0  # Default moderate AQI
    
    def run_hourly_collection(self):
        """
        Run hourly data collection for all locations
        """
        logger.info("⏰ Starting hourly data collection")
        
        for location in self.locations:
            try:
                self.collect_and_predict(location)
                time.sleep(5)  # Small delay between locations
            except Exception as e:
                logger.error(f"❌ Error in hourly collection for {location}: {e}")
        
        logger.info("✅ Hourly data collection completed")
    
    def run_daily_cleanup(self):
        """
        Run daily cleanup of old data
        """
        logger.info("🧹 Starting daily cleanup")
        
        try:
            db = next(get_db())
            
            # Delete forecasts older than 7 days
            cutoff_date = datetime.now() - timedelta(days=7)
            old_forecasts = db.query(AirQualityForecast).filter(
                AirQualityForecast.forecast_datetime < cutoff_date
            ).delete()
            
            db.commit()
            
            logger.info(f"🗑️ Deleted {old_forecasts} old forecasts")
            
        except Exception as e:
            logger.error(f"❌ Error in daily cleanup: {e}")
    
    def start_scheduler(self):
        """
        Start the automated scheduler
        """
        logger.info("🚀 Starting NASA Air Quality Data Scheduler")
        
        # Schedule hourly data collection
        schedule.every().hour.at(":00").do(self.run_hourly_collection)
        
        # Schedule daily cleanup at 2 AM
        schedule.every().day.at("02:00").do(self.run_daily_cleanup)
        
        self.is_running = True
        
        logger.info("✅ Scheduler started successfully")
        logger.info("   📅 Hourly data collection: Every hour at :00")
        logger.info("   🧹 Daily cleanup: Every day at 02:00")
        
        # Run initial collection
        self.run_hourly_collection()
        
        # Keep scheduler running
        while self.is_running:
            try:
                schedule.run_pending()
                time.sleep(60)  # Check every minute
            except KeyboardInterrupt:
                logger.info("🛑 Scheduler stopped by user")
                self.is_running = False
            except Exception as e:
                logger.error(f"❌ Scheduler error: {e}")
                time.sleep(60)
    
    def stop_scheduler(self):
        """
        Stop the scheduler
        """
        self.is_running = False
        logger.info("🛑 Scheduler stopped")

def main():
    """
    Main function to run the scheduler
    """
    print("⏰ NASA Air Quality Data Scheduler")
    print("=" * 50)
    
    scheduler = DataScheduler()
    
    try:
        scheduler.start_scheduler()
    except KeyboardInterrupt:
        print("\n🛑 Scheduler stopped by user")
        scheduler.stop_scheduler()
    except Exception as e:
        print(f"❌ Scheduler error: {e}")
        scheduler.stop_scheduler()

if __name__ == "__main__":
    main()
