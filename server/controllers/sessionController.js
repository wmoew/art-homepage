// Express-session version - NO mongoose Session model needed
const sessionController = {}; 

// Check if logged in using express-session only
sessionController.isLoggedIn = (req, res, next) => {
  try {
    // Check if the user has an active session with userId
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Valid session found, continue to next middleware
    return next();
  } catch (err) {
    console.error('Session check error:', err);
    return next(err);
  }
};

// Create a session
sessionController.startSession = (req, res, next) => {
  try {
    const user = res.locals.user; // Retrieved from userController
    if (!user) {
      return res.status(400).json({ message: 'No user data provided' });
    }
    
    // Store user info in express-session
    req.session.userId = user._id;
    req.session.username = user.username; 
    req.session.cookie.maxAge = 24 * 60 * 60 * 1000; // 1 day
    
    console.log('Session started for user:', user._id);
    return next();
  } catch (err) {
    console.error('Error starting session:', err);
    return next(err);
  }
};

// End session
sessionController.endSession = (req, res, next) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.error('Failed to destroy session:', err);
        return res.status(500).json({ message: 'Failed to destroy session', error: err.message });
      }
      return next();
    });
  } catch (err) {
    console.error('Error ending session:', err);
    return next(err);
  }
};

export default sessionController;