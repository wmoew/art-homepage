const cookieController = {};

//setCookie
cookieController.setCookie = (req, res, next) => {
    const user = res.locals.user; // Retrieved from userController
    if (!user) {
        return res.status(400).json({ message: 'No user data provided for cookie' });
    }
    // Set a cookie (e.g., user ID or session token)
    res.cookie('userId', user._id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Secure only in production
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
    next();
};

//setSSIDCookie - store the user id in a cookie
cookieController.setSSIDCookie = (req, res, next) => {
    try {
      const userId = res.locals.user?._id || res.locals.newUser?._id;
      console.log('Setting SSID cookie with userId:', userId);
      
      res.cookie('ssid', userId.toString(), {
        httpOnly: true,
      });
      
      console.log('SSID cookie set');
      return next();
    } catch (err) {
      console.error('Error setting SSID cookie:', err);
      return next(err);
    }
  };

// Clear cookies
cookieController.clearCookies = (req, res) => {
    res.clearCookie('userId');
    res.status(200).json({ message: 'Cookies cleared' });
};

module.exports = cookieController;
  