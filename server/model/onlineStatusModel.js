const mongoose = require("mongoose");

const onlineStatusSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    isOnline: {
        type: Boolean,
        default: false,
    },
    lastSeen: {
        type: Date,
        default: null,
    },
});

const OnlineStatus = mongoose.model("OnlineStatus", onlineStatusSchema);

module.exports = OnlineStatus;