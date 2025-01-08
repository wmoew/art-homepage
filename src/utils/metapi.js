const MET_API_BASE = "https://collectionapi.metmuseum.org/public/collection/v1";

export const fetchRandomArtWork = async () => {
    try {
    // Fetch list of all object IDs
    console.log('Fetching object IDs...');
    const res = await fetch(`${MET_API_BASE}/search?hasImages=true&isHighlight=true&q=*`);
    const data = await res.json();
    console.log('Total objects found:', data.total);


    if (!data.objectIDs || data.objectIDs.length === 0) {
        throw new Error('No objects found in the response');
    }

    // Get a random object ID
    const randomIndex = Math.floor(Math.random() * data.total);
    const objectId = data.objectIDs[randomIndex];
    console.log('Selected object ID:', objectId);
    
    // Fetch the details for this specific artwork
    const artworkRes = await fetch(`${MET_API_BASE}/objects/${objectId}`);
    const artworkData = await artworkRes.json();

    if (!artworkData.primaryImage) {
        throw new Error('Selected artwork has no image');
    }

    return artworkData;
} catch (error) {
    console.error('Error in fetchRandomArtWork:', error);
        throw error;
}
};



