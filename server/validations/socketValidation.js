const Joi = require("joi");
const fs = require("fs");

const defaultProfilePicture = fs.readFileSync("./defaultProfilePicture.txt", "utf8");

// User ID validation schema (for ObjectId)
const userIdSchema = Joi.string().length(24).required();

// Message data validation schema
const messageDataSchema = Joi.object({
  senderId: userIdSchema,
  receiverId: Joi.alternatives().conditional('groupId', {
    is: Joi.exist(),
    then: Joi.allow(null),
    otherwise: userIdSchema.required()
  }),
  groupId: Joi.alternatives().conditional('receiverId', {
    is: Joi.exist(),
    then: Joi.allow(null),
    otherwise: userIdSchema.required()
  }),
  messageContent: Joi.string().required(),
  messageType: Joi.string().valid("text", "image", "video").required(), // Add all valid message types
});

const updateUserSchema = Joi.object({
  userId: userIdSchema,
  fullName: Joi.string().min(1).max(50).required(),
  profilePicture: Joi.string().default(defaultProfilePicture),
  status: Joi.string().max(100).required(),
});

const updateGroupSchema = Joi.object({
    groupId: userIdSchema,
    groupName: Joi.string().min(1).max(50).required(),
    groupDescription: Joi.string().max(200).optional().allow(""),
    groupAvatar: Joi.string().optional().allow(""),
    members: Joi.array().items(userIdSchema).required(),
});
    

const roomIdSchema = Joi.string().max(100).required();

module.exports = { userIdSchema, messageDataSchema, updateUserSchema, updateGroupSchema, roomIdSchema };
