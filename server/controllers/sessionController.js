//this is to manage sessions

const sessionController = {};

//isLoggedIn

sessionController.isLoggedIn = async (req, res, next) => {
    // write code here
    try {
      // Get the ssid from cookies
      const ssid = req.cookies.ssid;
      
      // If no ssid cookie exists, redirect to signup
      if (!ssid) {
        return res.redirect('/login');
      }
      
      // Look for a session with matching cookieId
      const session = await Session.findOne({ cookieId: ssid });
      
      // If no session found, redirect to signup
      if (!session) {
        return res.redirect('/login');
      }
      
      // Valid session found, continue to next middleware
      return next();
    } catch (err) {
      return next(err);
    }
  };
// Create a session
sessionController.startSession = (req, res, next) => {
    const user = res.locals.user; //retrieved from userController
    if(!user)return res.status(400).json({message: 'No user data provided'});
    req.session.userId = user._id;
    req.session.cookie.maxAge = 24 * 60 * 60 * 1000; // 1 day
    next(); //move to cookieController or send a response
};

sessionController.endSession = (req, res) => {
    req.session.destroy((err) => {
        if(err) return res.status(500).json({messgae: 'Failed to destroy the session', error: err.message});
        res.clearCookie('connect.sid'); //clear the session cookie
        res.status(200).json({message: 'Session ended successfully'});
    });
};

module.exports = sessionController;