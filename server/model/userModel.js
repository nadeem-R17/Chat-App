const mongoose = require("mongoose");
const fs = require("fs");

const defaultProfilePicture = fs.readFileSync(
    "./defaultProfilePicture.txt",
    "utf8"
);

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    fullName: {
        type: String,
        required: true,
    },
    profilePicture: {
        type: String,
        default: defaultProfilePicture,
    },
    status: {
        type: String,
        default: 'Hey there! I am using this app',
    },
    socketId: {
        type: String,
        default: null,
    },
});

const User = mongoose.model("User", userSchema);

module.exports = User;