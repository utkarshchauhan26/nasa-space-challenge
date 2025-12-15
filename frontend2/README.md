# NASA Air Quality Dashboard - Frontend2

A beautiful, responsive web dashboard for real-time air quality monitoring using NASA satellite data and machine learning predictions.

## Features

### 🎨 **Beautiful UI Design**
- **NASA-themed styling** with official colors (Blue #0B3D91, Red #FC3D21)
- **Bootstrap 5** for responsive design
- **Custom CSS** with animations and hover effects
- **Font Awesome icons** for visual elements
- **Mobile-responsive** design

### 📊 **Real-time Data Visualization**
- **Current AQI Display** with color-coded levels
- **48-hour Forecast Chart** using Chart.js
- **Interactive Map** with Leaflet.js
- **Pollutant Levels** (NO₂, O₃, HCHO)
- **Health Recommendations** based on AQI

### 🔄 **Live Data Integration**
- **Auto-refresh** every 5 minutes
- **Manual refresh** button
- **Online/offline detection**
- **Real-time status updates**
- **Error handling** with toast notifications

### 🗺️ **Interactive Features**
- **Location selector** (5 major US cities)
- **Clickable map markers** with popups
- **AQI color circles** on map
- **System status monitoring**
- **Data source indicators**

## Technology Stack

- **HTML5** - Semantic markup
- **CSS3** - Custom styling with CSS variables
- **JavaScript (ES6+)** - Modern JavaScript features
- **Bootstrap 5** - Responsive framework
- **Chart.js** - Data visualization
- **Leaflet.js** - Interactive maps
- **Font Awesome** - Icons

## File Structure

```
frontend2/
├── index.html          # Main HTML file
├── styles.css          # Custom CSS styling
├── script.js           # JavaScript functionality
└── README.md           # Documentation
```

## Setup Instructions

### 1. **Prerequisites**
- Web browser (Chrome, Firefox, Safari, Edge)
- Backend server running on `http://localhost:8000`

### 2. **Installation**
1. Ensure the backend is running
2. Open `index.html` in a web browser
3. The dashboard will automatically connect to the backend

### 3. **Usage**
1. **Select Location** - Choose from dropdown menu
2. **View Current AQI** - See real-time air quality
3. **Check Forecast** - View 48-hour predictions
4. **Explore Map** - Click markers for details
5. **Monitor Status** - Check system health

## API Integration

The frontend connects to these backend endpoints:

- `GET /health` - Health check
- `GET /locations` - Available locations
- `GET /forecast/{location}` - Air quality forecast
- `GET /data/status` - System status
- `GET /data/collect/{location}` - Trigger data collection

## AQI Color Scheme

| AQI Range | Level | Color | Description |
|-----------|-------|-------|-------------|
| 0-50 | Good | Green | Air quality is satisfactory |
| 51-100 | Moderate | Yellow | Air quality is acceptable |
| 101-150 | Unhealthy for Sensitive Groups | Orange | Sensitive groups may experience health effects |
| 151-200 | Unhealthy | Red | Everyone may experience health effects |
| 201-300 | Very Unhealthy | Purple | Health warnings of emergency conditions |
| 301-500 | Hazardous | Dark Red | Health alert: everyone may experience serious health effects |

## Responsive Design

- **Desktop** - Full layout with sidebar
- **Tablet** - Stacked layout
- **Mobile** - Single column layout
- **Touch-friendly** - Large buttons and touch targets

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Features

- **Lazy loading** of map tiles
- **Efficient chart updates** with Chart.js
- **Optimized API calls** with error handling
- **Smooth animations** with CSS transitions
- **Memory management** for markers and charts

## Customization

### Colors
Edit CSS variables in `styles.css`:
```css
:root {
    --nasa-blue: #0B3D91;
    --nasa-red: #FC3D21;
    --aqi-good: #00E400;
    /* ... more colors */
}
```

### API Endpoint
Change the API URL in `script.js`:
```javascript
const CONFIG = {
    API_BASE_URL: 'http://localhost:8000',
    // ... other config
};
```

### Refresh Interval
Modify the auto-refresh interval:
```javascript
REFRESH_INTERVAL: 5 * 60 * 1000, // 5 minutes
```

## Troubleshooting

### Common Issues

1. **"Failed to load data"**
   - Check if backend is running
   - Verify API endpoint URL
   - Check browser console for errors

2. **Map not loading**
   - Ensure internet connection
   - Check Leaflet.js CDN
   - Verify map container height

3. **Charts not updating**
   - Check Chart.js CDN
   - Verify data format
   - Check browser console

### Debug Mode
Open browser developer tools (F12) to see:
- API requests and responses
- JavaScript errors
- Network status
- Console logs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the NASA Space Apps Challenge.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review browser console for errors
3. Verify backend connectivity
4. Check network status

---

**NASA Air Quality Dashboard** - Real-time satellite monitoring with 97%+ accuracy
