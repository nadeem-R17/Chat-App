const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
    },
    messageContent: {
        type: String,
        required: true,
    },
    messageType: {
        type: String,
        required: true,
    },
    sentAt: {
        type: Date,
        default: Date.now,
    },
    deleted: {
        type: Boolean,
        default: false,
    },
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;