from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
import warnings


# Helper: build an engine from DATABASE_URL, test a quick connection, and fall
# back to a local sqlite file if the configured DB is unreachable or auth fails.
def _make_engine_with_fallback():
    default_sqlite = "sqlite:///./nasa_air_quality.db"
    raw = os.getenv("DATABASE_URL")
    if not raw:
        warnings.warn("DATABASE_URL not set — using local SQLite for development.")
        return create_engine(default_sqlite)

    # Try the configured URL first
    try:
        eng = create_engine(raw)
        # attempt a short-lived connection to validate credentials/availability
        with eng.connect():
            pass
        return eng
    except Exception as exc:  # catch connection/auth errors
        warnings.warn(
            f"Failed to connect using DATABASE_URL={raw!r}: {exc!s}.\n"
            "Falling back to local SQLite (./nasa_air_quality.db) for development."
        )
        return create_engine(default_sqlite)


# Create engine (with automatic fallback)
engine = _make_engine_with_fallback()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database Models
class AirQualityForecast(Base):
    __tablename__ = "air_quality_forecasts"
    
    id = Column(Integer, primary_key=True, index=True)
    location_name = Column(String(100), index=True)
    latitude = Column(Float)
    longitude = Column(Float)
    forecast_datetime = Column(DateTime, index=True)
    no2_predicted = Column(Float)
    o3_predicted = Column(Float)
    hcho_predicted = Column(Float)
    aqi_predicted = Column(Integer)
    confidence_score = Column(Float)
    model_version = Column(String(50))
    created_at = Column(DateTime)

class HistoricalData(Base):
    __tablename__ = "historical_data"
    
    id = Column(Integer, primary_key=True, index=True)
    location_name = Column(String(100), index=True)
    datetime = Column(DateTime, index=True)
    no2_actual = Column(Float)
    o3_actual = Column(Float)
    hcho_actual = Column(Float)
    temperature = Column(Float)
    humidity = Column(Float)
    wind_speed = Column(Float)
    pressure = Column(Float)
    source = Column(String(50))

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Create tables
def create_tables():
    Base.metadata.create_all(bind=engine)
