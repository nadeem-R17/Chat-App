// controllers/userController.js
const User = require("../model/userModel");
const { getUserProfileSchema, searchUserByEmailSchema, updateUserProfileSchema } = require("../validations/userValidation");

const getUserProfile = async (req, res) => {
  // console.log("Getting user profile...");

  const { error } = getUserProfileSchema.validate(req.query);
  if (error) {
    return res.status(400).json({ message: error.message });
  }

  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: "Invalid request" });
  }

  try {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const searchUserByEmail = async (req, res) => {
  // console.log("Searching users by email...");

  const { error } = searchUserByEmailSchema.validate(req.query);

  if (error) {
    return res.status(400).json({ message: error.message });
  }

  const { query, userId } = req.query;


  if (!query) {
    return res.status(400).json({ message: "Invalid request" });
  }

  if (!userId) {
    console.log("User Id not provided");
    return res.status(400).json({ message: "Invalid request" });
  }

  try {
    // find user excluding userId
    const users = await User.find({
      $and: [
        { email: { $regex: query, $options: "i" } },
        { _id: { $ne: userId } }
      ],
    }).select("-password");

    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};


const updateUserProfile = async (req, res) => {

  const { error } = updateUserProfileSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.message });
  }

  const { userId, fullName, profilePicture, status } = req.body;

  if (!userId || !fullName || !profilePicture) {
    return res.status(400).json({ message: "Invalid request" });
  }

  if (fullName === "") {
    return res.status(400).json({ message: "Full name cannot be empty" });
  }

  try {
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.fullName !== fullName) {
      user.fullName = fullName;
    }

    if (user.profilePicture !== profilePicture) {
      user.profilePicture = profilePicture;
    }

    if(user.status !== status) {
      user.status = status;
    }

    await user.save();

    res.status(200).json(user);
  }
  catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { getUserProfile, searchUserByEmail, updateUserProfile };
