import mongoose from 'mongoose';

//After 90 seconds, the session will automatically be removed from the collection

const sessionSchema = new mongoose.Schema({
    cookieId: {
        type: String,
        require: true,
        unique: true
    },
    createdAt: {
        type: Date,
        expires: 90,
        default: Date.now
    }
});

export default mongoose.model('Session', sessionSchema);