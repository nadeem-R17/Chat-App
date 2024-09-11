// socket.js
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();

const User = require("./model/userModel");
const Message = require("./model/messageModel");
const ReadReceipt = require("./model/readReceiptModel");
const { Group, GroupMember } = require("./model/groupModel");
const OnlineStatus = require("./model/onlineStatusModel");

const { userIdSchema, messageDataSchema, updateUserSchema, updateGroupSchema, roomIdSchema } = require("./validations/socketValidation");

let io;

const socketIdMap = new Map();

function initSocket(server) {
  // console.log('Initializing socket...');
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST", "PUT"],
      credentials: true,
    },
    maxHttpBufferSize: 1e7 
  });

  io.on("connection", (socket) => {
    // console.log("New User connected", socket.id);

    socket.on("registerSocketId", async (userId) => {

      const { error } = userIdSchema.validate(userId);

      if (error) {
        // console.log("Invalid userId");
        return;
      }

      try {
        const user = await User.findById(userId);
        // console.log("User", user);
        if (!user) {
          return;
        }
        user.socketId = socket.id;
        await user.save();
        // console.log("Socket registered", user);

        const onlineStatus = await OnlineStatus.findOne({ userId });

        if (onlineStatus) {
          onlineStatus.isOnline = true;
          onlineStatus.lastSeen = null;
          await onlineStatus.save();

          io.emit("onlineStatus", { userId, isOnline: true, lastSeen: null });
        }


        socketIdMap.set(userId, socket.id);

        // console.log("SocketIdMap", socketIdMap);

        socket.emit("socketIdRegistered", socket.id);
      } catch (error) {
        console.log(error);
      }
    });

    socket.on("joinRoom", (roomId) => {

      const { error } = roomIdSchema.validate(roomId);

      if (error) {
        console.log("Invalid roomId");
        return;
      }

      socket.join(roomId);
      // console.log("User joined group", roomId);
    });

    socket.on("sendMessage", async (data) => {

      const { error } = messageDataSchema.validate(data.messageData);

      if (error) {
        console.error(error);
        console.log("Invalid message data");
        return
      }

      const { senderId, receiverId, groupId, messageContent, messageType } =
        data.messageData;
      if (!senderId || !messageContent || (!receiverId && !groupId) || !messageType) {
        console.log("Invalid message data");
        return;
      }

      try {
        const message = new Message({
          senderId,
          receiverId,
          groupId,
          messageContent,
          messageType,
        });
        await message.save();

        const sender = await User.findById(senderId).select(
          "fullName profilePicture socketId"
        );

        if (!sender) {
          console.log("Sender not found");
          return;
        }

        let messageToSend = {
          content: message.messageContent,
          senderId: message.senderId,
          messageType: message.messageType,
          sentAt: message.sentAt,
          senderProfilePicture: sender.profilePicture,
          messageSentByUser: true,
        };

        // console.log("receiverId", receiverId);

        if (receiverId) {
          messageToSend = {
            ...messageToSend,
            receiverId: message.receiverId,
          };
        } else if (groupId) {
          messageToSend = {
            ...messageToSend,
            groupId: message.groupId,
          };
        }

        io.to(data.roomId).emit("newMessage", messageToSend);

        if (receiverId) {
          const receiver = await User.findById(receiverId).select(
            "fullName profilePicture socketId"
          );

          const sidebarData = {
            senderId: message.senderId,
            senderName: sender.fullName,
            senderProfilePicture: sender.profilePicture,
            receiverId: message.receiverId,
            receiverName: receiver.fullName,
            receiverProfilePicture: receiver.profilePicture,
            messageContent: message.messageContent,
            messageType: message.messageType,
            sentAt: message.sentAt,
          };

          if (senderId) {
            io.to(sender.socketId).emit("newMessageSidebar", sidebarData);
          }
          if (socketIdMap.has(receiverId)) {
            // console.log(`Receiver is online with socketId ${receiver.socketId}`);
            io.to(receiver.socketId).emit("newMessageSidebar", sidebarData);
          }
        }

        if (groupId) {
          const group = await Group.findById(groupId);

          const sidebarGroupData = {
            groupId: message.groupId,
            // senderId: message.senderId,
            groupAvatar: group.groupAvatar,
            groupName: group.groupName,
            // senderProfilePicture: sender.profilePicture,
            messageContent: message.messageContent,
            messageType: message.messageType,
            sentAt: message.sentAt,
          };
          
          const groupMembers = await GroupMember.find({
            groupId: groupId,
            status: "active",
          }).select("userId");

          // console.log("Group members", groupMembers);

          for (const groupMember of groupMembers) {
            if (socketIdMap.has(groupMember.userId.toString())) {
              // console.log(
              //   `Group member is online with socketId ${socketIdMap.get(
              //     groupMember.userId.toString()
              //   )}`
              // );
              io.to(socketIdMap.get(groupMember.userId.toString())).emit(
                "newGroupMessageSidebar",
                sidebarGroupData
              );
            }
          }
          }

        
        if (receiverId) {
          const readReceipt = new ReadReceipt({
            userId: receiverId,
            messageId: message._id,
          });
          await readReceipt.save();
        }
      } catch (error) {
        console.log(error);
      }
    });

    socket.on("updateGroup", async (data) => {

      const { error } = updateGroupSchema.validate(data);

      if (error) {
        console.log("Invalid group data");
        return;
      }

      console.log("update group data: ", data);

      io.emit("groupUpdated", data);
    });

    socket.on("updateUser", async (data) => {

      const { error } = updateUserSchema.validate(data);

      if (error) {
        console.log("Invalid user data");
        return;
      }

      io.emit("userUpdated", data);
    });

    socket.on("typing", ({ roomId, userId }) => {
      io.to(roomId).emit("displayTyping", { userId, roomId });
    });

    socket.on("stoppedTyping", ({ roomId, userId }) => {
      io.to(roomId).emit("hideTyping", {userId, roomId});
    });

    socket.on("checkOnlineStatus", async (userId) => {
      const { error } = userIdSchema.validate(userId);

      if (error) {
        console.log("Invalid userId");
        return;
      }

      // console.log("got a request to check status for user: ", userId);

      const onlineStatus = await OnlineStatus.findOne({ userId });

      // console.log("online status: ", onlineStatus);

      if (onlineStatus) {
        io.emit("onlineStatus", { userId, isOnline: onlineStatus.isOnline, lastSeen: onlineStatus.lastSeen });
      }
    })

      

    socket.on("leaveRoom", (roomId) => {

      const { error } = roomIdSchema.validate(roomId);

      if (error) {
        console.log("Invalid roomId");
        return;
      }

      socket.leave(roomId);
      // console.log("User left group", roomId);
    });


    socket.on("disconnect", async () => {
      // console.log("User disconnected");
      try {
        const user = await User.findOne({ socketId: socket.id });
        if (!user) {
          console.log("No user found with socket ID:", socket.id);
          return;
        }
        user.socketId = null;
        await user.save();
  
        // console.log("User disconnected last: ", user);
  
        const onlineStatus = await OnlineStatus.findOne({ userId: user._id });
  
        // console.log("Online status at disconnect", onlineStatus);
  
        if (onlineStatus) {
          onlineStatus.isOnline = false;
          onlineStatus.lastSeen = Date.now();
          await onlineStatus.save();
  
          io.emit("onlineStatus", { userId: user._id, isOnline: false, lastSeen: onlineStatus.lastSeen });
        }
  
        for (const [userId, socketId] of socketIdMap.entries()) {
          if (socketId === socket.id) {
            socketIdMap.delete(userId);
            break;
          }
        }
        // console.log("Socket removed for user:", user._id);
      } catch (error) {
        console.error("Error during disconnect:", error);
      }
    });
  
    // Handle the logout event
    socket.on('logout', async () => {
      // console.log("User requested logout");
      try {
        const user = await User.findOne({ socketId: socket.id });
        if (!user) {
          // console.log("No user found with socket ID:", socket.id);
          return;
        }
        user.socketId = null;
        await user.save();
  
        // console.log("User logged out: ", user);
  
        const onlineStatus = await OnlineStatus.findOne({ userId: user._id });
  
        // console.log("Online status at logout", onlineStatus);
  
        if (onlineStatus) {
          onlineStatus.isOnline = false;
          onlineStatus.lastSeen = Date.now();
          await onlineStatus.save();
  
          io.emit("onlineStatus", { userId: user._id, isOnline: false, lastSeen: onlineStatus.lastSeen });
        }
  
        for (const [userId, socketId] of socketIdMap.entries()) {
          if (socketId === socket.id) {
            socketIdMap.delete(userId);
            break;
          }
        }
  
        // Disconnect the socket to trigger the disconnect event
        socket.disconnect();
      } catch (error) {
        console.error("Error during logout:", error);
      }
    });

  });

  return io;
}

function getIo() {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
}

module.exports = { initSocket, getIo };
