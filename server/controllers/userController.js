import { User, Favorites } from '../dbmodels/User';

// This file contains verifyUser, createUser and favorite management controllers
const userController = {};

// Retrieve all users from database and store in res.locals
userController.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}, { password: 0 }); // Exclude password field
    res.locals.users = users;
    return next();
  } catch (err) {
    return next(`Error in userController.getAllUsers: ${err.message}`);
  }
};

// Create and save a new User into the database
userController.createUser = async (username, password) => {
  if (!username || !password) {
    throw new Error('Username and password are required');
  }
  
  try {
    // Check if the username exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      throw new Error('Username already exists');
    }
    
    // Create the new user
    const newUser = new User({ username, password });
    await newUser.save();
    
    return {
      id: newUser._id,
      username: newUser.username
    };
  } catch (error) {
    throw error;
  }
};

/**
 * verifyUser - Obtain username and password from the request body, locate
 * the appropriate user in the database, and then authenticate the submitted password
 * against the password stored in the database.
 */
userController.verifyUser = async (req, res, next) => {
  try {
    console.log('Login attempt for user:', req.body.username);
    
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    
    const user = await User.findOne({ username });
    
    if (!user) {
      console.log('User not found:', username);
      return res.status(400).json({ message: 'Username does not exist' });
    }
    
    console.log('Found user with ID:', user._id);
    
    const isMatch = await user.matchPassword(password);
    
    if (!isMatch) {
      console.log('Password mismatch for user:', username);
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    
    res.locals.user = user;
    return next();
  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ message: 'Server error during login', error: err.message });
  }
};

// Add artwork to user's favorites
userController.addToFav = async (req, res) => {
  const { artworkId, title, artist, imageUrl, department } = req.body;
  const userId = req.session?.userId;
  
  // Validation
  if (!artworkId) {
    return res.status(400).json({ message: 'Artwork ID is required' });
  }
  
  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }
  
  try {
    // Check if favorite already exists
    const existingFav = await Favorites.findOne({ user: userId, artworkId });
    
    if (existingFav) {
      return res.status(400).json({ message: 'Artwork already exists in favorites' });
    }
    
    // Save to favorites database with all metadata
    const favorite = new Favorites({ 
      user: userId, 
      artworkId,
      title: title || 'Untitled',
      artist: artist || 'Unknown Artist',
      imageUrl: imageUrl || '',
      department: department || 'Unknown',
      dateAdded: new Date()
    });
    
    await favorite.save();
    
    return res.status(201).json({ 
      message: 'Favorite added successfully', 
      favorite: {
        id: favorite._id,
        artworkId: favorite.artworkId,
        title: favorite.title,
        artist: favorite.artist
      }
    });
  } catch (err) {
    console.error('Error adding to favorites:', err);
    return res.status(500).json({ 
      message: 'Server error while adding to favorites', 
      error: err.message 
    });
  }
};

// Remove artwork from user's favorites
userController.removeFromFav = async (req, res) => {
  const { artworkId } = req.params;
  const userId = req.session?.userId;
  
  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }
  
  if (!artworkId) {
    return res.status(400).json({ message: 'Artwork ID is required' });
  }
  
  try {
    const result = await Favorites.deleteOne({ user: userId, artworkId });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Favorite not found' });
    }
    
    return res.status(200).json({ message: 'Favorite removed successfully' });
  } catch (err) {
    console.error('Error removing from favorites:', err);
    return res.status(500).json({ 
      message: 'Server error while removing from favorites', 
      error: err.message 
    });
  }
};

// Get all favorites for the current user
userController.getFavorites = async (req, res) => {
  const userId = req.session?.userId;
  
  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }
  
  try {
    const favorites = await Favorites.find({ user: userId })
      .sort({ dateAdded: -1 }) // Most recent first
      .select('-__v'); // Exclude version field
    
    return res.status(200).json({ 
      message: 'Favorites retrieved successfully',
      count: favorites.length,
      favorites
    });
  } catch (err) {
    console.error('Error getting favorites:', err);
    return res.status(500).json({ 
      message: 'Server error while retrieving favorites', 
      error: err.message 
    });
  }
};

export default userController;