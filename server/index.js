const express = require('express'); 
const path = require('path');

const app = express(); // creates a new Express application instance
const PORT = process.env.PORT || 3001; // server will run on port 3001 or whatever port the hosting service specifies

// Serve static files from the React app
//__dirname is a Node.js global variable that represents the directory name of the current module.
//app.use(express.static(path.resolve(__dirname,'../client')));

// Parse JSON bodies
/* This line adds middleware that automatically:
- Parses incoming JSON payloads in request bodies
- Makes the parsed data available in req.body */
app.use(express.json());

// API Routes can be added here
app.get('/api/test',(req, res) => {
    res.status(200).json({message: 'API is working'});
});

// Handle React routing, return all requests to React app
app.listen(PORT, ()=> {
    console.log(`Server is running on PORT ${PORT}`);
});