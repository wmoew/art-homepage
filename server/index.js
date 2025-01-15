const express = require('express'); 
const cookieParser = require('cookie-parser');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const cookieController = require('./controllers/cookieController');
const sessionController = require('./controllers/sessionController');
const userController = require('./controllers/userController');

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
        console.log('Received signup request with body:', req.body); // Add this debug log
        
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

// Protected routes (require authentication)
app.use('/api', sessionController.isLoggedIn);

//api routes
app.get('/api/users', userController.getAllUsers);
app.post('/api/favorites', userController.addToFav);

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

module.exports = app;