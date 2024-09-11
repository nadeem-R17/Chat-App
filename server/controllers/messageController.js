// controllers/messageController.js
const Message = require("../model/messageModel");
const { GroupMember, Group } = require("../model/groupModel");
const ReadReceipt = require("../model/readReceiptModel");
const User = require("../model/userModel");

const { getInitChatHistorySchema, getDirectMessagesSchema, getGroupChatSchema } = require("../validations/messageValidation");

const getInitChatHistory = async (req, res) => {
  // console.log("Getting initial chat history...");

  const { error } = getInitChatHistorySchema.validate(req.query);

  if (error) {
    return res.status(400).json({ message: error.message });
  }

  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: "Invalid request" });
  }

  try {
    const directMessages = await Message.find({
      groupId: { $exists: false },
      $or: [{ senderId: userId }, { receiverId: userId }],
    });

    const sortedDirectMessages = directMessages.sort((a, b) => b.sentAt - a.sentAt);

    const conversationMap = new Map();

    for (const message of sortedDirectMessages) {
      const otherUserId =
        message.senderId.toString() === userId.toString()
          ? message.receiverId.toString()
          : message.senderId.toString();

      const conversationKey = [userId.toString(), otherUserId].sort().join("_");

      if (!conversationMap.has(conversationKey)) {
        const receiver = await User.findById(otherUserId).select(
          "-password"
        );

        // console.log("Receiver", receiver);

        conversationMap.set(conversationKey, {
          senderId: message.senderId,
          receiverId: receiver._id,
          receiverName: receiver.fullName,
          receiverProfilePicture: receiver.profilePicture,
          lastMessage: message.messageContent,
          lastMessageType: message.messageType,
          lastMessageTime: message.sentAt,
        });
      }
    }

    const mappedDirectMessages = Array.from(conversationMap.values());

    const filteredMappedDirectMessages = mappedDirectMessages.filter(
      (message) => message !== null
    );

    const groupMembers = await GroupMember.find({
      userId,
    });

    const groupMemberIds = groupMembers.map((groupMember) => groupMember.groupId);

    const groupMessages = await Message.find({
      receiverID: { $exists: false },
      groupId: { $in: groupMemberIds },
    });
    const groupSet = new Set();

    const sortedGroupMessages = groupMessages.sort((a, b) => b.sentAt - a.sentAt);

    const mappedGroupMessages = await Promise.all(
      sortedGroupMessages.map(async (message) => {
        const groupIdString = message.groupId.toString();
        const groupMember = groupMembers.find(
          (groupMember) => groupMember.groupId.toString() === groupIdString
        );

        if (groupMember) {
          const userLeftAt = groupMember.status === "inactive" ? groupMember.leftAt : null;

          if (!userLeftAt || message.sentAt <= userLeftAt) {
            if (!groupSet.has(groupIdString)) {
              groupSet.add(groupIdString);
              const group = await Group.findById(message.groupId).select(
                "groupName groupAvatar"
              );
              return {
                groupId: message.groupId,
                groupName: group.groupName,
                groupAvatar: group.groupAvatar,
                lastMessage: message.messageContent,
                lastMessageType: message.messageType,
                lastMessageTime: message.sentAt,
              };
            }
          }
        }
        return null;
      })
    );

    const filteredMappedGroupMessages = mappedGroupMessages.filter(
      (message) => message !== null
    );

    // console.log("group messages mapped");

    res.status(200).json({
      directMessages: filteredMappedDirectMessages,
      groupMessages: filteredMappedGroupMessages,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getDirectMessages = async (req, res) => {
  // console.log("Getting direct messages...");

  const { error } = getDirectMessagesSchema.validate(req.query);

  if (error) {
    return res.status(400).json({ message: error.message });
  }

  const { userId, receiverId } = req.query;

  // console.log("userId query for direct messages fetch ", userId);
  // console.log("receiverId query for direct messages fetch ", receiverId);

  if (!userId || !receiverId) {
    return res.status(400).json({ message: "Invalid request" });
  }

  try {
    const chat = await Message.find({
      $or: [
        {
          $and: [{ senderId: userId }, { receiverId: receiverId }],
        },
        {
          $and: [{ senderId: receiverId }, { receiverId: userId }],
        },
      ],
    });

    const sortedChat = chat.sort((a, b) => a.sentAt - b.sentAt);

    const mappedChat = await Promise.all(
      sortedChat.map(async (message) => {
        const senderIdString = message.senderId.toString();
        const userIdString = userId.toString();

        const sender = await User.findById(message.senderId).select("profilePicture");

        return {
          content: message.messageContent,
          senderId: message.senderId,
          senderProfilePicture: sender.profilePicture,
          receiverId: message.receiverId,
          messageType: message.messageType,
          sentAt: message.sentAt,
          messageSentByUser: senderIdString === userIdString,
        };
      })
    );

    // console.log("direct messages fetched", mappedChat);

    res.status(200).json(mappedChat);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getGroupChat = async (req, res) => {
  // console.log("Getting group chat...");

  const { error } = getGroupChatSchema.validate(req.query);

  if (error) {
    return res.status(400).json({ message: error.message });
  }

  const { userId, groupId } = req.query;

  if (!userId || !groupId) {
    return res.status(400).json({ message: "Invalid request" });
  }

  try {
    const groupMembers = await GroupMember.find({ groupId });

    const groupMember = groupMembers.find(
      (member) => member.userId.toString() === userId.toString()
    );

    if (!groupMember) {
      return res.status(403).json({ message: "User not in group" });
    }

    const chat = await Message.find({ groupId });

    const filteredChat = chat.filter((message) => {
      if (groupMember.status === "inactive") {
        return message.sentAt <= groupMember.leftAt;
      }
      return true;
    });

    const sortedChat = filteredChat.sort((a, b) => a.sentAt - b.sentAt);

    const userIdString = userId.toString();

    const mappedChat = await Promise.all(
      sortedChat.map(async (message) => {
        const senderIdString = message.senderId.toString();
        const sender = await User.findById(message.senderId).select("profilePicture");
        return {
          content: message.messageContent,
          senderId: message.senderId,
          senderProfilePicture: sender.profilePicture,
          // receiverId: message.receiverId,
          messageType: message.messageType,
          groupId: message.groupId,
          sentAt: message.sentAt,
          messageSentByUser: senderIdString === userIdString,
        };
      })
    );

    res.status(200).json(mappedChat);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { getInitChatHistory, getDirectMessages, getGroupChat };
