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
const PORT = process.env.PORT || 3001; // server will run on port 3001 or whatever port the hosting service specifies

//connect to MongoDB
connectDB();

//middleware

// Parse JSON bodies
/* This line adds middleware that automatically:
- Parses incoming JSON payloads in request bodies
- Makes the parsed data available in req.body */
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true, // For cookie-based sessions
}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

//session config
app.use(session({
    secret: process.env.SESSION_SECRET || 'development-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
}));

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
app.post('/signup',
    userController.createUser,
    cookieController.setSSIDCookie,
    sessionController.startSession,
    (req, res) => res.status(200).json({ message: 'Sign up successfully' })
);

app.post('/login',
    userController.verifyUser,
    cookieController.setSSIDCookie,
    sessionController.startSession,
    (req, res) => res.status(200).json({ message: 'Logged in successfully' })
);

app.post('/logout',
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

//error handling
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
});

app.listen(PORT, ()=> {
    console.log(`Server is running on PORT ${PORT}`);
});

module.exports = app;