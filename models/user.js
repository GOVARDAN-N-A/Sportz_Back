const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    profilePicture: {
        data: Buffer, // Storing image data as a Buffer
        contentType: String // Storing MIME type of the image
    },
    dateOfBirth: {
        type: Date
    },
    gender: {
        type: String
    },
    city: {
        type: String
    },
    state: {
        type: String
    },
    country: {
        type: String
    },
    sportsInterests: [String],
    skillLevel: String,
    preferredPlayingTimes: [String],
    contactNumber: String,
    socialMediaProfiles: String,
    bio: String,
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

const User = mongoose.model('User', userSchema);

module.exports = User;
