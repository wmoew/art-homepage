import React, { useState, useEffect, useRef } from 'react';
import { fetchRandomArtWork } from '../utils/metapi.js';

const ArtDisplay = () => {
  // Same as:
  // let artwork = null;
  // function setArtwork(newValue) { artwork = newValue; }
    const [artwork, setArtwork] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [favStatus, setFavStatus] = useState('');

    useEffect (() => {
        let isMounted = true;
        const controller = new AbortController();
        console.log('Component mounted'); // Log when component mounts

        const getArtwork = async () => {
            console.log('Starting to fetch artwork...'); // Log start of fetch
            try {
                setLoading(true);
                const data = await fetchRandomArtWork(controller.signal);
                console.log('Artwork data received:', data);

                if (isMounted) {
                    setArtwork(data);
                    setError(null);
                } // artwork = data
                console.log('Artwork state set successfully'); // Log successful state update
            } catch (err) {
                // Ignore AbortError
                if (err.name !== 'AbortError') {
                setError(error.message);
            }
                setError('Fail to load the artwork');
                console.error('Artwork Loading Error:', err);
            } finally {
                setLoading(false);
                console.log('Loading completed'); // Log end of loading
            }
        }
        getArtwork(); 

        // Added cleanup function
        return () => {
            isMounted = false;
            controller.abort();
        };

    }, []);

    // useEffect(() => {
    //     // Fetch login status from backend
    //     const checkLoginStatus = async () => {
    //         const response = await fetch('http://localhost:5000/api/isLoggedIn', { credentials: 'include' });
    //         setIsLoggedIn(response.ok);
    //     };
    //     checkLoginStatus();
    // }, []);

    const handleAddtoFav = async () => {
        if (!isLoggedIn) {
            setFavStatus('Please log in to add favorites');
            return;
        }
        try {
            const response = await fetch('http://localhost:3000/api/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId: artwork.id }),
                credentials: 'include',
            });
            if (!response.ok) {
                const message = await response.json();
                setFavStatus(message.error || 'Failed to add to favorites');
                return;
            }
            setFavStatus('Added to favorites successfully');
        } catch (err) {
            setFavStatus('An unexpected error occurred');
            console.error('Error adding to favorites:', err);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className='artwork-page'>
            <div className="frame-container">
                <div className='frame'>
                {artwork.primaryImage ? (
                <img 
                src={artwork.primaryImage}
                alt={artwork.title}
                className="artwork-image"
                onLoad={() => console.log('Image loaded successfully')}
                />) : (<div>No image available</div>)}
                </div>
                <div className='artwork-info'>
                    <h3>{artwork.title}</h3>
                    <p>Department: {artwork.department}</p>
                    <p>Culture: {artwork.culture}</p>
                    <p>Artist: {artwork.artistDisplayName || 'Unknown'}</p>
                    <p>Artist Nationality: {artwork.artistNationality}</p>
                    <p>Time: {artwork.objectDate}</p>
                    <p>Credit: {artwork.creditLine}</p>
                    <p>Country: {artwork.country}</p>
                    <p>City: {artwork.city}</p>
                    <p>Medium: {artwork.medium}</p>
                    <button 
                    className='myButton'
                    onClick={handleAddtoFav}
                    >
                    Add to My Favorite
                    </button>
                    {favStatus && <p className="fav-status">{favStatus}</p>}
                </div>
            </div>
        </div>
    );
};

export default ArtDisplay;