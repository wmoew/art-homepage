const mongoose = require('mongoose');
const { type } = require('os');


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

module.exports = mongoose.model('Session', sessionSchema);