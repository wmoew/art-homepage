const MET_API_BASE = "https://collectionapi.metmuseum.org/public/collection/v1";

export const fetchRandomArtWork = async (signal) => {
    try {
        // Fetch list of all object IDs
        console.log('Fetching object IDs...');
        const res = await fetch(`${MET_API_BASE}/search?hasImages=true&isHighlight=true&q=*`, { signal });
        
        // Initial res check
        if (!res.ok) {
            throw new Error(`API request failed: ${res.status}`);
        }
        
        const data = await res.json();
        console.log('Total highlighted objects found:', data.total);
        
        if (!data.objectIDs || data.objectIDs.length === 0) {
            throw new Error('No artwork IDs returned from API');
        }
        
        // Try up to 3 times to get an artwork with a valid image
        for (let attempt = 0; attempt < 3; attempt++) {
            try {
                const randomIndex = Math.floor(Math.random() * data.objectIDs.length);
                const objectId = data.objectIDs[randomIndex];
                console.log(`Attempt ${attempt + 1}: Fetching artwork ID ${objectId}`);

                // Fetch the details for this specific artwork
                const artworkRes = await fetch(`${MET_API_BASE}/objects/${objectId}`, { signal });
                
                if (!artworkRes.ok) {
                    throw new Error(`Artwork API request failed: ${artworkRes.status}`);
                }
                
                const artworkData = await artworkRes.json();

                // Check if the artwork meets the conditions
                if (!artworkData.primaryImage) {
                    throw new Error('Selected artwork has no primary image');
                }
                
                console.log('Successfully found valid highlighted artwork');
                // Return artwork
                return {
                    ...artworkData,
                    id: artworkData.objectID,
                    imageUrl: artworkData.primaryImage,
                    title: artworkData.title
                };
            } catch (err) {
                if (err.name === 'AbortError') {
                    console.log('Fetch operation was aborted');
                    throw err; // Re-throw abort errors
                }
                
                console.log(`Attempt ${attempt + 1} failed:`, err.message);
                
                // Only throw on the last attempt
                if (attempt === 2) {
                    throw new Error('Failed to find valid artwork after 3 attempts');
                }
                
                // Add a small delay between attempts
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
        
        throw new Error('Failed to find valid highlighted artwork after multiple attempts');
    } catch (error) {
        // Don't log AbortError as errors - they're expected when component unmounts
        if (error.name !== 'AbortError') {
            console.error('Error in fetchRandomArtWork:', error);
        } else {
            console.log('Fetch operation was aborted');
        }
        
        throw error;
    }
};