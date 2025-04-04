import React, { useState, useEffect } from 'react';
import { fetchRandomArtWork } from '../utils/metapi.js';
import { Link } from 'react-router-dom';

const ArtDisplay = () => {
    const [artwork, setArtwork] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const [favStatus, setFavStatus] = useState('');
    const [isAddingToFav, setIsAddingToFav] = useState(false);

    // This useEffect runs first to check localStorage for username
    useEffect(() => {
        const savedUsername = localStorage.getItem('username');
        if (savedUsername) {
            setUsername(savedUsername);
            setIsLoggedIn(true); // Explicitly set isLoggedIn to true when username exists
            console.log("Set username from localStorage:", savedUsername);
        }
    }, []);

    useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    
        // Check authentication status
        const checkAuth = async () => {
            try {
                console.log('Checking authentication status...');
                const response = await fetch('http://localhost:3001/auth/check', {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    },
                    credentials: 'include',
                    signal: controller.signal
                });
                
                // Check content type before parsing
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    console.error('Non-JSON response received:', contentType);
                    // Don't set isLoggedIn to false if we already have a username from localStorage
                    if (!username) {
                        setIsLoggedIn(false);
                    }
                    return;
                }
                
                const data = await response.json();
                
                if (isMounted) {
                    if (data.authenticated) {
                        setIsLoggedIn(true);
                        // Check for username in different possible locations
                        if (data.username) {
                            setUsername(data.username);
                            // Save to localStorage for persistence
                            localStorage.setItem('username', data.username);
                        } else if (data.user && data.user.username) {
                            setUsername(data.user.username);
                            localStorage.setItem('username', data.user.username);
                        } else if (data.userId) {
                            // If only userId is available, we can set a generic username
                            setUsername("User");
                            localStorage.setItem('username', "User");
                        }
                        console.log('Received auth data:', data);
                    } else {
                        // Only set isLoggedIn to false if we don't have a username from localStorage
                        if (!username) {
                            setIsLoggedIn(false);
                        }
                    }
                    console.log('Authentication status:', data.authenticated ? `Logged in as ${data.username}` : 'Not logged in');
                }
            } catch (err) {
                console.error('Error checking authentication:', err);
                // Don't set isLoggedIn to false if we already have a username from localStorage
                if (isMounted && !username) {
                    setIsLoggedIn(false);
                }
            }
        };

        // Fetch artwork with retry logic
        const getArtwork = async (retries = 3) => {
            try {
                if (retries === 3) { // Only set loading on first attempt
                    setLoading(true);
                    setError(null);
                }
                
                console.log(`Fetching artwork, attempt ${4 - retries}`);
                const data = await fetchRandomArtWork(controller.signal);
                
                if (isMounted) {
                    if (data) {
                        setArtwork(data);
                        setError(null);
                        setLoading(false);
                        console.log('Artwork data loaded successfully');
                    } else if (retries > 0) {
                        // Try again with one fewer retry
                        console.log(`Retrying artwork fetch, ${retries} attempts left`);
                        setTimeout(() => getArtwork(retries - 1), 1000);
                    } else {
                        setLoading(false);
                        setError('Could not load artwork after multiple attempts. Please try again.');
                    }
                }
            } catch (err) {
                console.error('Artwork Loading Error:', err);
                if (isMounted) {
                    if (err.name !== 'AbortError' && retries > 0) {
                        // Retry on non-abort errors
                        console.log(`Error occurred, retrying. ${retries} attempts left`);
                        setTimeout(() => getArtwork(retries - 1), 1000);
                    } else if (err.name !== 'AbortError') {
                        setLoading(false);
                        setError('Failed to load artwork: ' + (err.message || 'Unknown error'));
                    }
                }
            }
        };
        
        // Run both functions
        checkAuth();
        getArtwork();
        
        // Cleanup function
        return () => {
            isMounted = false;
            controller.abort();
            console.log('ArtDisplay component unmounted, cleanup performed');
        };
    }, [username]); // Added username as dependency to avoid overwriting it

    const handleAddtoFav = async () => {
        if (!isLoggedIn) {
            setFavStatus('Please log in to add favorites');
            return;
        }
        
        if (!artwork || !artwork.objectID) {
            setFavStatus('No artwork data available');
            return;
        }
        
        try {
            setIsAddingToFav(true);
            setFavStatus('Adding to favorites...');
            
            const response = await fetch('http://localhost:3001/api/favorites', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ 
                    artworkId: artwork.objectID,
                    title: artwork.title || 'Untitled',
                    artist: artwork.artistDisplayName || 'Unknown',
                    imageUrl: artwork.primaryImage || '',
                    department: artwork.department || 'Unknown'
                }),
            });
            
            // Handle non-JSON responses
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();
                
                if (response.ok) {
                    setFavStatus('Added to favorites successfully');
                } else {
                    setFavStatus(data.message || 'Failed to add to favorites');
                }
            } else {
                // Non-JSON response handling
                setFavStatus(response.ok ? 'Added to favorites successfully' : 'Failed to add to favorites');
            }
        } catch (err) {
            console.error('Error adding to favorites:', err);
            setFavStatus('Server error: Could not add to favorites');
        } finally {
            setIsAddingToFav(false);
        }
    };

    const handleTryAgain = () => {
        setLoading(true);
        setError(null);
        setArtwork(null);
        
        // Create a new AbortController for the new request
        const controller = new AbortController();
        
        // Define a recursive function with retries
        const fetchWithRetry = async (retries = 3) => {
            try {
                const data = await fetchRandomArtWork(controller.signal);
                
                if (data) {
                    setArtwork(data);
                    setLoading(false);
                } else if (retries > 0) {
                    console.log(`Retrying, ${retries} attempts left`);
                    setTimeout(() => fetchWithRetry(retries - 1), 1000);
                } else {
                    setError('Could not load artwork after multiple attempts');
                    setLoading(false);
                }
            } catch (err) {
                console.error('Error in retry:', err);
                if (err.name !== 'AbortError' && retries > 0) {
                    console.log(`Error, retrying. ${retries} attempts left`);
                    setTimeout(() => fetchWithRetry(retries - 1), 1000);
                } else if (err.name !== 'AbortError') {
                    setError('Failed to load: ' + err.message);
                    setLoading(false);
                }
            }
        };
        
        fetchWithRetry();
        
        // Clean up if component unmounts during fetch
        return () => controller.abort();
    };

    // For debugging - add this to see current state values
    useEffect(() => {
        console.log('Current state - isLoggedIn:', isLoggedIn, 'username:', username);
    }, [isLoggedIn, username]);

    // Render loading state
    if (loading) {
        return (
            <div className="loading-container" style={{ textAlign: 'center', padding: '50px' }}>
                <h3>Loading artwork...</h3>
                <p>This may take a moment as we fetch a random artwork for you.</p>
            </div>
        );
    }

    // Render error state
    if (error) {
        return (
            <div className="error-container" style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
                <h3>Error</h3>
                <p>{error}</p>
                <button 
                    className="myButton" 
                    onClick={handleTryAgain}
                >
                    Try Again
                </button>
            </div>
        );
    }

    // Safeguard against null artwork
    if (!artwork) {
        return (
            <div className="no-artwork-container" style={{ textAlign: 'center', padding: '50px' }}>
                <h3>No artwork data available</h3>
                <button 
                    className="myButton" 
                    onClick={handleTryAgain}
                >
                    Try Again
                </button>
            </div>
        );
    }

    // Main render with artwork data
    return (
        <div className='artwork-page'>
            {/* Always show username if available, regardless of isLoggedIn state */}
            {username && (
                <div style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    padding: '8px 16px',
                    background: '#f5f5f5',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    zIndex: 1000 // Ensure it's on top
                }}>
                    Welcome, {username}!
                </div>
            )}
            
            <div className="frame-container">
                <div className='frame'>
                    {artwork.primaryImage ? (
                        <img 
                            src={artwork.primaryImage}
                            alt={artwork.title || 'Artwork'}
                            className="artwork-image"
                        />
                    ) : (
                        <div style={{ 
                            height: '300px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            border: '1px solid #ccc' 
                        }}>
                            No image available for this artwork
                        </div>
                    )}
                </div>
                <div className='artwork-info'>
                    <h3>{artwork.title || 'Untitled Artwork'}</h3>
                    <p>Department: {artwork.department || 'Unknown'}</p>
                    <p>Culture: {artwork.culture || 'Unknown'}</p>
                    <p>Artist: {artwork.artistDisplayName || 'Unknown'}</p>
                    <p>Artist Nationality: {artwork.artistNationality || 'Unknown'}</p>
                    <p>Time: {artwork.objectDate || 'Unknown'}</p>
                    <p>Credit: {artwork.creditLine || 'Unknown'}</p>
                    <p>Country: {artwork.country || 'Unknown'}</p>
                    <p>City: {artwork.city || 'Unknown'}</p>
                    <p>Medium: {artwork.medium || 'Unknown'}</p>
                    
                    <button 
                        className='myButton'
                        onClick={handleAddtoFav}
                        disabled={isAddingToFav}
                    >
                        {isAddingToFav ? 'Adding...' : 'Add to My Favorite'}
                    </button>
                    
                    {favStatus && (
                        <p className="fav-status" style={{ 
                            marginTop: '10px',
                            padding: '8px',
                            backgroundColor: favStatus.includes('success') ? '#e8f5e9' : '#ffebee',
                            borderRadius: '4px'
                        }}>
                            {favStatus}
                        </p>
                    )}
                    
                    <div style={{ marginTop: '20px' }}>
                        {isLoggedIn ? (
                            <Link to="/favorites" style={{ 
                                textDecoration: 'none', 
                                color: 'inherit',
                                padding: '8px 16px',
                                border: '1px solid #000',
                                display: 'inline-block'
                            }}>
                                View My Favorites
                            </Link>
                        ) : (
                            <Link to="/auth" style={{ 
                                textDecoration: 'none', 
                                color: 'inherit',
                                padding: '8px 16px',
                                border: '1px solid #000',
                                display: 'inline-block'
                            }}>
                                Log in/Sign up
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArtDisplay;