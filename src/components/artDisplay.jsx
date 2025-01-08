import React, { useState, useEffect } from 'react';
import { fetchRandomArtWork } from '../utils/metapi.js';

const ArtDisplay = () => {
  // Same as:
  // let artwork = null;
  // function setArtwork(newValue) { artwork = newValue; }
    const [artwork, setArtwork] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect (() => {
        console.log('Component mounted'); // Log when component mounts
        const getArtwork = async () => {
            console.log('Starting to fetch artwork...'); // Log start of fetch
            try {
                const testResponse = await fetch('https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&?isHighlight=true&q=*');
                console.log('Initial API response:', await testResponse.json());
                
                setLoading(true);
                const data = await fetchRandomArtWork();
                console.log('Artwork data received:', data);  // Add this line

                if (!data) {
                    throw new Error('No data received from API');
                }

                setArtwork(data); // artwork = data
                console.log('Artwork state set successfully'); // Log successful state update
            } catch (err) {

                console.error('Error details:', {
                    message: err.message,
                    stack: err.stack,
                    error: err
                });

                setError('Fail to load the artwork');
                console.error('Artwork Loading Error:', err);
            } finally {
                setLoading(false);
                console.log('Loading completed'); // Log end of loading
            }
        }
        getArtwork(); 

        // Cleanup function
        return () => {
            console.log('Component unmounting'); // Log cleanup
        };

    }, []);

    // Log every render
    console.log('Rendering with state:', {
        loading,
        error,
        hasArtwork: !!artwork,
        artworkData: artwork
    });

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (!artwork) return <div>No artwork found</div>;

    return (
        <div className='artwork-container'>
            <h3>{artwork.title}</h3>
            {artwork.primaryImage ? (
            <img 
            src={artwork.primaryImage}
            alt={artwork.title}
            className="artwork-image"
            onLoad={() => console.log('Image loaded successfully')}
                    onError={(e) => {
                        console.error('Image failed to load:', {
                            src: e.target.src,
                            error: e
                        });
                    }}
            />) : (<div>No image available</div>)}
            <div className='artwork-info'>
                <p>{artwork.artistRole}:{artwork.artistDisplayName || 'Unknown'}</p>
                <p>Time:{artwork.objectDate}</p>
                <p>Medium:{artwork.medium}</p>
            </div>
        </div>
    );
};

export default ArtDisplay;