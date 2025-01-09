const { User, Favorites } = require('../dbmodels/User');

// This file has verifyUser, CreateUser and AddToFavorite Controllers
const userController = {};
// retrieve all the users from database and store it into res.locals
userController.getAllUsers = (req, res, next) => {
    User.find({}, (err, users) => {
        // if a database error occurs, call next with the error message passed in
        // for the express global error handler to catch
        if (err) return next('Error in userController.getAllUsers' + JSON.stringify(err));
        res.locals.users = users;
        return next();
    });
};

//createUser - create and save a new User into the database.

userController.createUser = async (req, res, next) => {
    const {username, password} = req.body;
    if (!username || !password) {
        return res.status(400).json({message: 'Username and password are required'});
    }
    try {
        //check if the username exists
        const existingUser = await User.findOne({username});
        if(existingUser) {
            return res.status(400).json({message: 'Username already exists'});
        }
        //create the new user
        const newUser = new User({username, password});
        //insert new user document to database, also trigger pre-save hook (password hashing)
        await newUser.save();
        //res.locals.user = newUser; // Attach user to `res.locals` for the next middleware
        res.status(201).json({message: 'User created sucessfully', user: {id: newUser._id, username: newUser.username}});
    } catch (err) {
        res.status(500).json({message: 'Server error for creating new user', error: err.message});
        return;
    }
}
/**
* verifyUser - Obtain username and password from the request body, locate
* the appropriate user in the database, and then authenticate the submitted password
* against the password stored in the database.
*/

userController.verifyUser = async (req, res, next) => {
    try {
        const {username, password} = req.body;
        const user = await User.findOne({username});
        if (!user) return res.status(400).json({Error: 'Username does not exist.'});
        const isMatch = await user.matchPassword(password);
        if (!isMatch) return res.status(401).json({Error: 'Invalid username and password combination'});

        // Pass user data to sessionController and cookieController
        // Attach user data for the next middleware
        res.locals.user = user;
        return next();
    } catch (err) {
        res.status(500).json({message: 'Server error for login', error: err.message});
}
};

userController.addToFav = async (req, res, next) => {
    const { itemId } =  req.body; 
    //retrieve userId from session
    const userId = req.session?.userId;
    if(!userId) {
        return res.status(401).json({message: 'User not authenticated'});
    }
    try {
        //check if favorite already exists
        const existingFav = await Favorites.findOne({ user: userId, itemId });
        if(existingFav) return res.status(400).json({message: 'Item already exists in favorites'});

        //save to fav database
        const favorite = new Favorites({ user: userId, itemId });
        await favorite.save();

        // pass the favorite to subsequent middleware
        res.locals.favorite = favorite;

        res.status(201).json({ message: 'Favorite added successfully', favorite });
    } catch (err) {
        res.status(500).json({ message: 'Server error for adding to favorites', error: err.message})
    }
};

module.exports = userController;