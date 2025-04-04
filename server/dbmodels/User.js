import mongoose from 'mongoose';
import bcrypt from 'bcrypt';    

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
},{ timestamps: true });

// Hash password
userSchema.pre('save', async function(next) {
    if(!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

//check password
userSchema.methods.matchPassword = async function(enteredPassword) {
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
    artworkId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    artist: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    dateAdded: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true});

favScheme.index({ user: 1, artworkId: 1 }, { unique: true });

const Favorites = mongoose.model('Favorites', favScheme);


export { User, Favorites };