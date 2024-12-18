Weather App
This weather app provides an interactive experience where users can view weather conditions, and background videos dynamically change based on the weather description when hovering over forecast items.

Features:
* Displays weather forecast items with dynamic descriptions.
* Plays corresponding background videos (e.g., clear sky, overcast, rain, scattered clouds) when hovering over forecast items.
* Modular and scalable JavaScript logic for hover-based video playback.

  
Structure

weather-app-main/
├── index.html               # Main webpage for the weather app
├── popup.html               # Additional HTML file (context not specified)
├── script.js                # JavaScript file for hover logic and app functionality
├── style.css                # Stylesheet for the app
├── assets/
│   └── videos/
│       ├── clearsky.mp4     # Video for "clear sky"
│       ├── overcast.mp4     # Video for "overcast"
│       ├── rain.mp4         # Video for "rain"
│       └── scatteredclouds.mp4 # Video for "scattered clouds"

----------------------

How It Works
* Dynamic Videos: Each forecast item is associated with a weather description. When you hover over a forecast item, the corresponding video plays in the background.
* Hover Logic: JavaScript handles video playback dynamically, ensuring only one video plays at a time.
* Responsive Design: The app is styled using style.css for a user-friendly interface.
