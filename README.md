# Met Art Explorer

A modern web application for discovering and saving your favorite artwork from the Metropolitan Museum of Art collection.

![Random Artwork Display](./images/sample.png)

## Features

- **Random Art Discovery**: Explore random artworks from the Metropolitan Museum of Art's extensive collection
- **User Authentication**: Secure login and registration system with persistent sessions
- **Favorites System**: Save your favorite pieces to your personal collection
- **Detailed Artwork Information**: View comprehensive details including artist, culture, medium, and more
- **Responsive Design**: Enjoyable experience on both desktop and mobile devices
- **Error Handling**: Graceful handling of API errors with automatic retries

## Tech Stack

- **Frontend**: React.js, React Router for navigation
- **Backend**: Node.js with Express
- **Authentication**: Session-based authentication with cookies and localStorage persistence
- **External API**: Integration with the Metropolitan Museum of Art API
- **Styling**: CSS with responsive design principles

## Architecture Overview

### Frontend
The React frontend provides a seamless user experience with:
- **Random artwork discovery** using the Metropolitan Museum's collection API
- **User authentication** with persistent sessions via cookies and localStorage
- **Personal favorites collection** for logged-in users

### Backend
The Node.js/Express backend handles:
- **User authentication** with session management
- **Database operations** for user accounts and favorites
- **API endpoints** for favorites management
- **Security** with CORS configuration and protected routes

## Key Features

### Random Artwork Discovery
The application fetches random artwork from the Metropolitan Museum of Art's collection:
- **Curated Selection**: Focuses on highlighted works with images
- **Rich Details**: Displays artist, culture, medium, historical context, etc.
- **Error Resilience**: Implements multi-attempt fetching with elegant fallbacks

```javascript
// Example of the artwork fetching logic
export const fetchRandomArtWork = async (signal) => {
    // First fetch highlighted artworks with images
    const res = await fetch(`${MET_API_BASE}/search?hasImages=true&isHighlight=true&q=*`, { signal });
    const data = await res.json();
    
    // Then select a random artwork and fetch its details
    const randomIndex = Math.floor(Math.random() * data.objectIDs.length);
    const objectId = data.objectIDs[randomIndex];
    const artworkRes = await fetch(`${MET_API_BASE}/objects/${objectId}`, { signal });
    const artworkData = await artworkRes.json();
    
    return artworkData;
};