const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
    groupName: {
        type: String,
        required: true,
    },
    groupAdminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    groupDescription: {
        type: String,
    },
    groupAvatar: {
        type: String,
    },
});
    
const groupMemberSchema = new mongoose.Schema({
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    joinedAt: {
        type: Date,
        default: Date.now,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
    },
    leftAt: {
        type: Date,
    },
});

const Group = mongoose.model("Group", groupSchema);
const GroupMember = mongoose.model("GroupMember", groupMemberSchema);

module.exports = { Group, GroupMember };