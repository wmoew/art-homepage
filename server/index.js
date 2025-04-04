import express from 'express'; 
import cookieParser from 'cookie-parser';
import session from 'express-session';
import cors from 'cors';
import path from 'path';
import User from './dbmodels/User';
import 'dotenv/config';

import connectDB from './config/db';
import cookieController from './controllers/cookieController';
import sessionController from './controllers/sessionController';
import userController from './controllers/userController';

const app = express(); // creates a new Express application instance
const PORT = process.env.SERVER_PORT || 3001; // server will run on port 3001 or SERVER_PORT

//connect to MongoDB
connectDB();

//middleware

// In your server/index.js
app.use(cors({
    origin: 'http://localhost:3000', // Be specific about the origin in development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parse JSON bodies
/* This line adds middleware that automatically:
- Parses incoming JSON payloads in request bodies
- Makes the parsed data available in req.body */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//session config
app.use(session({
    secret: process.env.SESSION_SECRET || 'development-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false, // Set to false for development
        sameSite: 'lax',
        path: '/',
        maxAge: 24 * 60 * 60 * 1000
    }
}));

app.options('*', cors());

/**
* --- Express Routes ---
* Express will attempt to match these routes in the order they are declared here.
* If a route handler / middleware handles a request and sends a response without
* calling `next()`, then none of the route handlers after that route will run!
* This can be very useful for adding authorization to certain routes...
*/

// API Routes can be added here
app.get('/api/test',(req, res) => {
    res.status(200).json({message: 'API is working'});
});

//Auth routes
app.post('/auth/signup', async (req, res) => {
    try {
        console.log('Received signup request with body:', req.body);
        
        if (!req.body || !req.body.username || !req.body.password) {
            return res.status(400).json({ 
                message: 'Missing required fields',
                received: req.body 
            });
        }
        
        const result = await userController.createUser(req.body.username, req.body.password);
        res.status(201).json({ message: 'User created successfully', user: result });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: error.message });
    }
});

app.post('/auth/login',
    userController.verifyUser,
    cookieController.setSSIDCookie,
    sessionController.startSession,
    (req, res) => {
        res.header('Access-Control-Allow-Credentials', 'true');
        res.status(200).json({ message: 'Logged in successfully' });
    }
);

app.post('/auth/logout',
    sessionController.endSession,
    cookieController.clearCookies,
    (req, res) => res.status(200).json({ message: 'Logged out successfully' })
);

app.get('/auth/check', async (req, res) => {
    try {
        console.log('Auth check request received');
        console.log('Cookies received:', req.cookies);
        console.log('Session ID:', req.sessionID);
        console.log('Session data:', req.session);
        console.log('Session user ID:', req.session?.userId);
      
      // Explicitly set content type to JSON
      res.setHeader('Content-Type', 'application/json');
      
      // Check if session exists and has a userId
      if (req.session && req.session.userId) {
        try {
          // Get the user data to return the username
          const user = await User.findById(req.session.userId).select('username');
          console.log('User found:', user);
          
          return res.status(200).json({
            authenticated: true,
            userId: req.session.userId,
            username: user ? user.username : 'User' // Add fallback
          });
        } catch (dbError) {
          console.error('Database error:', dbError);
          return res.status(200).json({
            authenticated: true,
            userId: req.session.userId,
            username: 'User' // Fallback if database query fails
          });
        }
      } else {
        console.log('User is not authenticated');
        return res.status(401).json({
          authenticated: false,
          message: 'Not authenticated'
        });
      }
    } catch (error) {
      console.error('Auth check error:', error);
      return res.status(500).json({
        authenticated: false,
        message: 'Server error during authentication check'
      });
    }
  });

// Debug endpoint to check session and cookies
app.get('/debug/session', (req, res) => {
    try {
      console.log('Debug endpoint called');
      console.log('Headers:', req.headers);
      console.log('Cookies:', req.cookies);
      console.log('Session:', req.session);
      
      res.json({
        cookies: req.cookies,
        session: {
          id: req.sessionID,
          data: req.session,
          userId: req.session?.userId
        },
        headers: {
          cookie: req.headers.cookie,
          authorization: req.headers.authorization,
          origin: req.headers.origin
        }
      });
    } catch (error) {
      console.error('Error in debug endpoint:', error);
      res.status(500).json({ error: error.message });
    }
  });

// Protected routes (require authentication)
app.use('/api', sessionController.isLoggedIn);

//api routes
app.get('/api/users', userController.getAllUsers);
app.get('/api/favorites', userController.getFavorites);
app.post('/api/favorites', userController.addToFav);
app.delete('/api/favorites/:itemId', userController.removeFromFav);
// Serve static files from the React app
//__dirname is a Node.js global variable that represents the directory name of the current module.
app.use(express.static(path.resolve(__dirname,'../build')));
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../build', 'index.html'));
});

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

//error handling
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
});

app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
});

export default app;