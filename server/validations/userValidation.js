const Joi = require("joi");
const fs = require("fs");

const defaultProfilePicture = fs.readFileSync("./defaultProfilePicture.txt", "utf8");


const getUserProfileSchema = Joi.object({
  userId: Joi.string().length(24).required(),
});

const searchUserByEmailSchema = Joi.object({
  query: Joi.string().max(254).required(),
  userId: Joi.string().length(24).required(),
});

const updateUserProfileSchema = Joi.object({
  userId: Joi.string().length(24).required(),
  fullName: Joi.string().min(1).max(50).required(),
  status: Joi.string().max(100).required(),
  profilePicture: Joi.string().default(defaultProfilePicture),
});

const registerUserSchema = Joi.object({
  email: Joi.string().email().max(254).required(),
  password: Joi.string().min(6).required(),
  fullName: Joi.string().min(1).max(50).required(),
  profilePicture: Joi.string().default(defaultProfilePicture),
});

const loginUserSchema = Joi.object({
  email: Joi.string().email().max(254).required(),
  password: Joi.string().min(6).required(),
});

const logoutUserSchema = Joi.object({
  userId: Joi.string().length(24).required(),
});


module.exports = {
  getUserProfileSchema,
  searchUserByEmailSchema,
  updateUserProfileSchema,
  registerUserSchema,
  loginUserSchema,
  logoutUserSchema,
};
