const Joi = require('joi');

// const messageValidationSchema = Joi.object({
//     senderId: Joi.string().required(),
//     receiverId: Joi.string().optional().allow(null),
//     groupId: Joi.string().optional().allow(null),
//     messageContent: Joi.string().required(),
//     messageType: Joi.string().valid('text', 'image', 'video').required(),
//     sentAt: Joi.date().default(Date.now),
//     deleted: Joi.boolean().default(false),
// });

const getInitChatHistorySchema = Joi.object({
    userId: Joi.string().length(24).required(),
});

const getDirectMessagesSchema = Joi.object({
    userId: Joi.string().length(24).required(),
    receiverId: Joi.string().length(24).required(),
});

const getGroupChatSchema = Joi.object({
    userId: Joi.string().length(24).required(),
    groupId: Joi.string().length(24).required(),
});




module.exports = { getInitChatHistorySchema, getDirectMessagesSchema, getGroupChatSchema};