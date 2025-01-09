const MET_API_BASE = "https://collectionapi.metmuseum.org/public/collection/v1";

export const fetchRandomArtWork = async (signal) => {
    try {
    // Fetch list of all object IDs
    console.log('Fetching object IDs...');
    const res = await fetch(`${MET_API_BASE}/search?hasImages=true&isHighlight=true&q=*`, { signal });
    // initial res check
    if (!res.ok) {
        throw new Error(`API request failed: ${res.status}`);
    }
    const data = await res.json();
    console.log('Total highlighted objects found:', data.total);
    
    // Try up to 5 times to get an artwork with a valid image
    // Get a random object ID
    for (let attempt = 0; attempt < 3; attempt++){
        try {
            const randomIndex = Math.floor(Math.random() * data.objectIDs.length);
            const objectId = data.objectIDs[randomIndex];
            console.log(`Attempt ${attempt + 1}: Fetching artwork ID ${objectId}`);

            // Fetch the details for this specific artwork
            const artworkRes = await fetch(`${MET_API_BASE}/objects/${objectId}`, { signal });
            const artworkData = await artworkRes.json();

            //see if the artwork meets the condition
            if (!artworkData.primaryImage) {
                throw new Error('Selected artwork has no primary image');
            }
            if (!artworkData.isHighlight) {
                throw new Error('Selected artwork is not highlighted');
            }
            console.log('Successfully found valid highlighted artwork');
            //return artwork
            return {
                ...artworkData,
                id: artworkData.objectID,
                imageUrl: artworkData.primaryImage,
                title: artworkData.title
            };
        } catch (err) {
            if (err.name === 'AbortError') {  // <-- New check
                throw err;
            }
            console.log(`Attempt ${attempt + 1} failed:`, err.message);
            if (attempt === 2) { // Last attempt
                throw new Error('Failed to find valid artwork after 3 attempts');
            }
        }
    }
    throw new Error('Failed to find valid highlighted artwork after multiple attempts');
} catch (error) {
    console.error('Error in fetchRandomArtWork:', error);
        throw error;
}
};



