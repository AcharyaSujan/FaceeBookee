const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    imageName: String,
    profilePicture: { data: Buffer,imgName:String, contentType: String } // For storing Binary data directly
    // OR
    // profilePicturePath: String // For storing file path
});

const Profile = mongoose.model('Profile', profileSchema);
module.exports = Profile;