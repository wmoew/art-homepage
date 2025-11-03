import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    // Fetch user's favorites
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3001/api/favorites', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'include', // Important for cookies/session
        });

        if (!response.ok) {
          if (response.status === 401) {
            // Not authenticated - redirect to login
            navigate('/auth');
            return;
          }
          throw new Error('Failed to fetch favorites');
        }

        const data = await response.json();
        setFavorites(data.favorites || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching favorites:', err);
        setError('Could not load your favorites. Please try again later.');
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [navigate]);

  const handleRemoveFavorite = async (artworkId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/favorites/${artworkId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to remove from favorites: ${response.status}`)
      }

      // Update the favorites list by removing the deleted item
      setFavorites(favorites.filter(art => art.artworkId !== artworkId));
    } catch (err) {
      console.error('Error removing favorite:', err);
      setError('Failed to remove from favorites. Please try again.');
    }
  };

  const handleViewArtwork = (artworkId) => {
    navigate(`/artwork/${artworkId}`);
  };

  if (loading) {
    return <div className="loading">Loading your favorites...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="favorites-container">
      <h2>Your Favorite Artwork</h2>
      
      {favorites.length === 0 ? (
        <div className="no-favorites">
          <p>You haven't added any artwork to your favorites yet.</p>
          <button className="myButton" onClick={() => navigate('/')}>
            Browse Gallery
          </button>
        </div>
      ) : (
        <div className="favorites-grid">
          {favorites.map(artwork => (
            <div key={artwork.artworkId} className="favorite-item">
              <img 
                src={artwork.imageUrl} 
                alt={artwork.title} 
                className="favorite-thumbnail"
                onClick={() => handleViewArtwork(artwork.artworkId)}
              />
              <div className="favorite-details">
                <h3>{artwork.title}</h3>
                <p>{artwork.artist}</p>
                <button 
                  className="myButton" 
                  onClick={() => handleRemoveFavorite(artwork.artworkId)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <button className="myButton" style={{ marginTop: '20px' }} onClick={() => navigate('/')}>
        Back to Gallery
      </button>
    </div>
  );
};

export default AuthFavorites;