const Joi = require('joi');

const createGroupSchema = Joi.object({
  groupName: Joi.string().min(1).max(50).required(),
  userId: Joi.string().length(24).required(),
  groupDescription: Joi.string().max(200).optional().allow(''),
  groupAvatar: Joi.string().optional().allow(''),
  members: Joi.array().items(Joi.string().length(24)).required(),
});

const groupDetailsSchema = Joi.object({
  groupId: Joi.string().length(24).required(),
});

const updateGroupSchema = Joi.object({
  groupId: Joi.string().length(24).required(),
  groupName: Joi.string().min(1).max(50).required(),
  groupDescription: Joi.string().max(200).optional().allow(''),
  groupAvatar: Joi.string().optional().allow(''),
  members: Joi.array().items(Joi.string().length(24)).required(),
});

const memberStatusSchema = Joi.object({
  groupId: Joi.string().length(24).required(),
  userId: Joi.string().length(24).required(),
});

module.exports = { createGroupSchema, groupDetailsSchema, updateGroupSchema, memberStatusSchema };
