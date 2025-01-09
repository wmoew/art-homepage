const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { type } = require('os');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        require: true,
        unique: true
    },
    password: {
        type: String,
        requried: true
    }
},{ timestamps: true });

// Hash password
userSchema.pre('save', async function(next) {
    if(this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

//check password
userSchema.method.matchPassword = async (enteredPassword) => {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

//favorite
const favScheme = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    itemId: {
        type: String,
        required: true
    }
}, { timestamps: true});

const Favorites = mongoose.model('Favorites', favScheme);


module.exports = { User, Favorites };