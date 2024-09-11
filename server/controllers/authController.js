// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../model/userModel');
const fs = require('fs');
require('dotenv').config();
const { GroupMember } = require('../model/groupModel');
const { registerUserSchema, loginUserSchema, logoutUserSchema } = require('../validations/userValidation');
const OnlineStatus = require('../model/onlineStatusModel');

const defaultProfilePicture = fs.readFileSync(
    './defaultProfilePicture.txt',
    'utf8'
);

const SECRET_KEY = process.env.SECRET_KEY;

const registerUser = async (req, res) => {

    const { error } = registerUserSchema.validate(req.body);

    if (error) {
        return res.status(400).json({ message: error.message });
    }

    const { email, password, fullName, profilePicture } = req.body;
    
    if (!email || !password || !fullName) {
        return res.status(400).json({ message: "Please fill in all fields" });
    }

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            email,
            password: hashedPassword,
            fullName,
            profilePicture: profilePicture || defaultProfilePicture,
        });

        await user.save();

        const onlineStatus = new OnlineStatus({
            userId: user._id,
        });

        await onlineStatus.save();

        const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: '2h' });
        // send user details and token excluding password
        res.status(201).json({
            user: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                profilePicture: user.profilePicture,
                socketId: user.socketId,
            },
            token,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

const loginUser = async (req, res) => {

    const { error } = loginUserSchema.validate(req.body);

    if (error) {
        return res.status(400).json({ message: error.message });
    }

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Please fill in all fields" });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // console.log("User found");

        const groupIds =await GroupMember.find({ userId: user._id }).select('groupId');
        // console.log("Group Ids found", groupIds);

        const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: '2h' });
        // send user details and token excluding password
        res.status(200).json({
            user: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                profilePicture: user.profilePicture,
                socketId: user.socketId,
            },
            token,
            groupIds,
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const logoutUser = async (req, res) => {

    const { error } = logoutUserSchema.validate(req.body);

    if (error) {
        return res.status(400).json({ message: error.message });
    }

    const { userId } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // update user's socketId to null
        user.socketId = null;
        await user.save();

        res.status(200).json({ message: "User logged out successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { registerUser, loginUser, logoutUser };