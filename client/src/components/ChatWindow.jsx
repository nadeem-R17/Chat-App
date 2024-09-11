import React, { useEffect, useState } from "react";
import {
  Box,
  VStack,
  Text,
  Input,
  Button,
  useColorModeValue,
  Avatar,
  Flex,
  IconButton,
  Image,
  keyframes,
  useToast,
  useColorMode,
} from "@chakra-ui/react";
import { FaPlus, FaTimes } from "react-icons/fa";
import { useRecoilValue } from "recoil";
import { userState } from "../atoms/userAtom";
import { socket } from "../socket";
import axios from "axios";
import { BASE_URL } from "../assets/BASE_URL";
import chatWindowDark from "../assets/chatWindowDark.jpg";
import GroupProfile from "./GroupProfile";
import UserProfile from "./UserProfile";
import { GrAttachment } from "react-icons/gr";
import { BsSend } from "react-icons/bs";
import OpeningChatWindow from "./OpeningChatWindow";

const ChatWindow = ({ receiver, group }) => {
  const chatBg = useColorModeValue("light.background", "dark.background");
  const chatBorderInputColor = useColorModeValue("light.borderInput", "dark.borderInput");
  const toast = useToast();
  const { colorMode } = useColorMode();

  const user = useRecoilValue(userState);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("text");
  const [previosDirectMessages, setPreviousDirectMessages] = useState([]);
  const [previosGroupMessages, setPreviousGroupMessages] = useState([]);
  const [isGroupMember, setIsGroupMember] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState(false);
  const [lastSeen, setLastSeen] = useState(null);

  useEffect(() => {
    if (user) {
      setUserId(user.id);
    }
  }, [user]);

  useEffect(() => {
    const fetchGroupMemberStatus = async () => {
      if (!group || !user) {
        return;
      }
      try {
        const response = await axios.get(
          `${BASE_URL}/api/groups/memberstatus/?groupId=${group.groupId}&userId=${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        // console.log("Group member status response:", response.data);

        setIsGroupMember(response.data);
      } catch (error) {
        // console.error("Error fetching group member status:", error);
      }
    };
    fetchGroupMemberStatus();
  }, [group, user]);

  useEffect(() => {
    if (group && isGroupMember) {
      socket.emit("joinRoom", group.groupId);
      setRoomId(group.groupId);
    } else if (group && !isGroupMember) {
      socket.emit("leaveRoom", group.groupId);
    }
  }, [isGroupMember, group]);

  useEffect(() => {
    if (receiver) {
      const roomId = [user.id.toString(), receiver._id.toString()].sort().join("-");
      socket.emit("joinRoom", roomId);
      setRoomId(roomId);
    }
  }, [receiver, user]);

  useEffect(() => {
    socket.on("groupUpdated", (newMessage) => {
      const members = newMessage.members;

      if (group) {
        if (!members.includes(user.id)) {
          setIsGroupMember(false);
        } else {
          setIsGroupMember(true);
        }
      }
    });

    return () => {
      socket.off("groupUpdated");
    };
  }, [group, user]);

  useEffect(() => {
    const fetchPreviousMessages = async () => {
      if (!receiver) {
        // console.log("Receiver is missing");
        return;
      }
      if (!user) {
        // console.log("User is missing");
        return;
      }
      const receiverId = receiver._id;
      const senderId = user.id;
      const token = localStorage.getItem("token");

      try {
        const response = await axios.get(
          `${BASE_URL}/api/message/directchat/?receiverId=${receiverId}&userId=${senderId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setPreviousDirectMessages(response.data);
      } catch (error) {
        // console.error("Error fetching previous messages:", error);
      }
    };
    fetchPreviousMessages();
  }, [receiver, user]);

  useEffect(() => {
    const fetchPreviousGroupMessages = async () => {
      if (!group) {
        // console.log("Group id is missing");
        return;
      }
      if (!user) {
        // console.log("User is missing");
        return;
      }

      const groupId = group.groupId;
      const token = localStorage.getItem("token");

      try {
        const response = await axios.get(
          `${BASE_URL}/api/message/groupchat/?groupId=${groupId}&userId=${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setPreviousGroupMessages(response.data);
      } catch (error) {
        // console.error("Error fetching previous group messages:", error);
      }
    };
    fetchPreviousGroupMessages();
  }, [group, user]);

  useEffect(() => {
    socket.on("newMessage", (newMessage) => {
      // console.log("new message received", newMessage);
      if (newMessage.senderId.toString() !== user.id.toString()) {
        newMessage.messageSentByUser = false;
      }
      if (receiver) {
        setPreviousDirectMessages((prevMessages) =>
          [...prevMessages, newMessage].sort(
            (a, b) => new Date(a.sentAt) - new Date(b.sentAt)
          )
        );

        // console.log("Previous direct messages after listening:", previosDirectMessages);
      } else if (group) {
        setPreviousGroupMessages((prevMessages) =>
          [...prevMessages, newMessage].sort(
            (a, b) => new Date(a.sentAt) - new Date(b.sentAt)
          )
        );
      }
    });

    return () => {
      socket.off("newMessage");
    };
  }, [receiver, group, user]);

  useEffect(() => {
    const handleDisplayTyping = (data) => {
      const { userId: typingUserId, roomId: typingRoomId } = data;
      if (receiver && typingUserId === receiver._id && typingRoomId === roomId) {
        setIsTyping(true);
      } else if (group && typingRoomId === group.groupId) {
        setIsTyping(true);
      }
    };

    const handleHideTyping = (data) => {
      const { userId: typingUserId, roomId: typingRoomId } = data;
      if (receiver && typingUserId === receiver._id && typingRoomId === roomId) {
        setIsTyping(false);
      } else if (group && typingRoomId === group.groupId) {
        setIsTyping(false);
      }
    };

    socket.on("displayTyping", handleDisplayTyping);
    socket.on("hideTyping", handleHideTyping);

    return () => {
      socket.off("displayTyping", handleDisplayTyping);
      socket.off("hideTyping", handleHideTyping);
    };
  }, [receiver, group, roomId]);

  useEffect(() => {
    const handleOnlineStatus = (data) => {
      const { userId, isOnline, lastSeen } = data;
      // console.log("Online status data:", data);
      if (userId === receiver._id) {
        setOnlineStatus(isOnline);
        setLastSeen(lastSeen);
      }
    };

    if (receiver) {
      socket.emit("checkOnlineStatus", receiver._id);
      socket.on("onlineStatus", handleOnlineStatus);
    }

    return () => {
      socket.off("onlineStatus", handleOnlineStatus);
    };
  }, [receiver]);

  useEffect(() => {
    return () => {
      if (receiver) {
        socket.emit("stoppedTyping", { roomId, userId });
      }
      setMessage("");
      setMessageType("text");
    };
  }, [receiver, group, roomId, userId, isTyping]);

  const handleTyping = () => {
    socket.emit("joinRoom", roomId);
    socket.emit("typing", { roomId, userId });
  };

  const handleSend = () => {
    socket.emit("joinRoom", roomId);
    if (messageType === "text" && message.trim() === "") {
      toast({
        title: "Cannot send empty message",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
      // console.log("Cannot send empty message");
      return;
    }

    if (messageType !== "text" && !message) {
      toast({
        title: "No image or video selected",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
      // console.log("No image or video selected");
      return;
    }

    if (!receiver && !group) {
      // console.log("Receiver and group are missing");
      return;
    }

    if (group && !isGroupMember) {
      console.log("User is not a member of the group");
      return;
    }

    const messageData = {
      senderId: user.id,
      ...(receiver ? { receiverId: receiver._id } : { groupId: group.groupId }),
      messageContent: message,
      messageType,
    };

    // console.log("User id in sending message:", user.id);

    // console.log("send message data:", messageData);
    socket.emit("sendMessage", { messageData, roomId });

    if (receiver) {
      socket.emit("stoppedTyping", { roomId, userId });
    }

    socket.on("newMessage", (data) => {
      setMessage("");
      setMessageType("text");
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!isValidFile(file)) {
      toast({
        title: "Invalid File",
        description: "Please select a valid file (png, jpg, jpeg, mp4)",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      // console.log("Please select a valid file (png, jpg, jpeg, mp4)");
      return;
    }
    if (file.size > 1024 * 1024 * 3) {
      toast({
        title: "File Size Exceeded",
        description: "The file size should not exceed 3 MB",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      // console.log("The file size should not exceed 3 MB");
      return;
    }

    convertImageToBase64(file).then((data) => {
      setMessage(data);
      setMessageType(file.type.includes("image") ? "image" : "video");
    });
  };

  const isValidFile = (file) => {
    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
      "video/mp4",
    ];
    return allowedTypes.includes(file.type);
  };


  const convertImageToBase64 = (image) => {
    return new Promise((resolve, reject) => {
      if (image.type.includes("image")) {
        compressImage(image).then((compressedBase64) => {
          resolve(compressedBase64);
        }).catch((error) => {
          reject(error);
        });
      } else {
        const fileReader = new FileReader();
        fileReader.readAsDataURL(image);
        fileReader.onload = () => {
          resolve(fileReader.result);
        };
        fileReader.onerror = (error) => {
          reject(error);
        };
      }
    });
  };
  
  // Compress image using canvas
  const compressImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.7) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.readAsDataURL(file); // Convert image to base64 first
      
      reader.onload = (event) => {
        const img = document.createElement("img");
        img.src = event.target.result;
        
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          
          let width = img.width;
          let height = img.height;
  
          // Resize keeping aspect ratio
          if (width > height) {
            if (width > maxWidth) {
              height = Math.floor((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.floor((width * maxHeight) / height);
              height = maxHeight;
            }
          }
  
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
  
          const compressedBase64 = canvas.toDataURL(file.type, quality);
          resolve(compressedBase64);
        };
        
        img.onerror = (err) => reject(err);
      };
      
      reader.onerror = (err) => reject(err);
    });
  };
  

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      // if (e.shiftKey) return;
      if (messageType === "text" && message.trim() === "") {
        // console.log("Cannot send empty message");
        return;
      }
      handleSend();
    }
  };

  const handleClearFile = () => {
    setMessage("");
    setMessageType("text");
  };

  return !receiver && !group ? (
    <Box
      flex="1"
      bg={chatBg}
      p={4}
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
    >
      <OpeningChatWindow/>
    </Box>
  ) : (
    <Box width="100%" minHeight="100%">
      <ChatHeader
        receiver={receiver}
        group={group}
        isTyping={isTyping}
        onlineStatus={onlineStatus}
        lastSeen={lastSeen}
      />

      <Box
        flex="1"
        bgImage={chatBg === "light.background" ? "white" : chatWindowDark}
        {...(colorMode === "dark" && {
          bgSize: "cover",
          bgPosition: "center",
        })}
        p={4}
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        height="93%"
        overflowY="auto"
      >
        {/* display chat receiver name and status and profile picture */}
        <Box flex="1" overflowY="auto" mb={4}>
          {receiver && previosDirectMessages && previosDirectMessages.length > 0 && (
            // console.log("Messages in chat window:", previosDirectMessages),
            <ChatDisplay message={previosDirectMessages} />
          )}
          {group && previosGroupMessages && previosGroupMessages.length > 0 && (
            <ChatDisplay message={previosGroupMessages} />
          )}
        </Box>

        {(messageType === "image" || messageType === "video") && (
          <Box mb={4} position="relative">
            <Box position="relative" display="inline-block">
              {messageType === "image" ? (
                <Image src={message} alt="" maxW="100%" />
              ) : (
                <video src={message} controls style={{ maxWidth: "100%" }} />
              )}
              <IconButton
                icon={<FaTimes />}
                position="absolute"
                top="8px" // Adjust the offset from the top
                right="8px" // Adjust the offset from the right
                onClick={handleClearFile}
                aria-label="Clear file"
                bg="red.500"
                color="white"
                border="2px solid black"
                _hover={{ bg: "red.600" }}
                _active={{ bg: "red.700" }}
                zIndex={2} // Ensure it's above the image/video
              />
            </Box>
          </Box>
        )}

        <Flex>
          <label htmlFor="file-input">
            <IconButton
              aria-label="Add attachment"
              icon={<GrAttachment />}
              mr={2}
              as="span"
              cursor="pointer"
              isDisabled={receiver ? false : isGroupMember ? false : true}
            />
          </label>
          <Input
            id="file-input"
            type="file"
            display="none"
            onChange={(e) => {
              handleFileChange(e);
              handleKeyPress({ key: "Enter" });
            }}
            isDisabled={receiver ? false : isGroupMember ? false : true}
          />
          <Input
            flex="1"
            placeholder="Type a message..."
            value={messageType === "text" ? message : ""}
            onChange={(e) => {
              setMessage(e.target.value);
              setMessageType("text");

              if (receiver) {
                if (e.target.value.trim() !== "") {
                  handleTyping();
                } else {
                  socket.emit("stoppedTyping", { roomId, userId });
                }
              }
            }}
            sx={{ borderRadius: "full", borderColor: chatBorderInputColor, background: colorMode === "light"? "#FFFFFF" : "inherit" }}
            isDisabled={
              messageType !== "text" || (receiver ? false : isGroupMember ? false : true)
            }
            onKeyPress={handleKeyPress}
          />
            <IconButton
              icon={<BsSend />}
            ml={2}
            onClick={handleSend}
            isDisabled={receiver ? false : isGroupMember ? false : true}
          >
            Send
          </IconButton>
        </Flex>
      </Box>
    </Box>
  );
};

function ChatHeader({ receiver, group, isTyping, onlineStatus, lastSeen }) {
  const { colorMode } = useColorMode();
  const toggles = () => {
    const [isOpen, setIsOpen] = useState(false);
    const onOpen = () => setIsOpen(true);
    const onClose = () => setIsOpen(false);
    return { isOpen, onOpen, onClose };
  };

  const { isOpen, onOpen, onClose } = toggles();

  const handleClick = () => {
    if (isOpen) {
      onClose();
    } else {
      onOpen();
    }
  };

  return (
    <Box bg={colorMode === "dark" ?"#003135":"#CFCFCF"} minHeight="7%" alignContent="center">
      <Flex align="center" pl={4}>
        <Avatar
          name={receiver ? receiver.fullName : group.groupName}
          size="md"
          src={receiver ? receiver.profilePicture : group.groupAvatar}
          onClick={handleClick}
          sx={{ _hover: { cursor: "pointer" } }}
        />
        <Box ml={2} onClick={handleClick} sx={{ _hover: { cursor: "pointer" } }}>
          <Text fontWeight="bold">{receiver ? receiver.fullName : group.groupName}</Text>
          {receiver && (
            <>
              <TypingIndicator
                isTyping={isTyping}
                onlineStatus={onlineStatus}
                lastSeen={lastSeen}
                receiver={receiver}
              />
              <UserProfile userId={receiver._id} isOpen={isOpen} onClose={onClose} />
            </>
          )}
          {group && (
            <>
              <Text fontsize="sm">tap for group info</Text>
              <GroupProfile groupId={group.groupId} isOpen={isOpen} onClose={onClose} />
            </>
          )}
        </Box>
      </Flex>
    </Box>
  );
}

const dotAnimation = keyframes`
  0% { content: ''; }
  33% { content: '.'; }
  66% { content: '..'; }
  100% { content: '...'; }
`;

function TypingIndicator({ isTyping, onlineStatus, lastSeen, receiver }) {
  let lastSeenDate;

  if (lastSeen) {
    lastSeenDate = new Date(lastSeen);
  }

  return (
    <Box>
      {isTyping ? (
        <Text>
          Typing
          <Box as="span" animation={`${dotAnimation} 1s steps(3, end) infinite`}>
            ...
          </Box>
        </Text>
      ) : receiver ? (
        onlineStatus ? (
          <Text>Online</Text>
        ) : lastSeen ? (
          <Text>
            Last seen{" "}
            {lastSeenDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </Text>
        ) : (
          <Box />
        )
      ) : (
        <Box />
      )}
    </Box>
  );
}

function ChatDisplay({ message }) {
  // console.log("Messages in chat display down:", message);
  const { colorMode } = useColorMode();

  return (
    <>
      {message.map((msg, index) => (
        <VStack
          spacing={2}
          align={msg.messageSentByUser ? "end" : "start"}
          w="100%"
          key={index}
          mb={4} // Add margin between messages
        >
          <Flex
            align="center"
            justify={msg.messageSentByUser ? "flex-end" : "flex-start"}
            w="100%"
          >
            {/* Receiver's avatar on the left */}
            {!msg.messageSentByUser && (
              <Avatar
                name="User"
                size="sm"
                src={msg.senderProfilePicture}
                mr={2}
                mb={2}
              />
            )}

            <Box
              bg={
                colorMode === "dark"
                  ? msg.messageSentByUser
                    ? "#DCF8C6"
                    : "#E3F2FD"
                  : msg.messageSentByUser
                  ? "#DCF8C6"
                  : "#CFCFCF"
              } // Sender: Light green; Receiver: Light blue
              color="#000"
              px={4}
              py={2}
              borderRadius="lg"
              maxW="75%"
              boxShadow="md"
              position="relative"
              mr={2}
            >
              {/* Flex container to align content and time in one row */}
              <Flex align="center" justify="space-between" w="100%">
                {/* Message content */}
                {msg.messageType === "text" && (
                  <Text flex="1" mr={2}>
                    {msg.content}
                  </Text>
                )}
                {msg.messageType === "image" && (
                  <Image src={msg.content} alt="image" maxW="100%" borderRadius="lg" />
                )}
                {msg.messageType === "video" && (
                  <Box>
                    <video src={msg.content} controls style={{ maxWidth: "100%" }} />
                  </Box>
                )}

                {/* Message sent time next to content */}
                <Text
                  fontSize={11}
                  color={ colorMode === "dark"? "gray.500": "#075E"}
                  position="absolute"
                  bottom="-16px" // Position the time below the box
                  right="0px"
                  whiteSpace="nowrap"
                  bg={colorMode === "light" ? "#FFFFFF" : "transparent"}
                  px={-1}
                >
                  {new Date(msg.sentAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </Flex>
            </Box>
          </Flex>
        </VStack>
      ))}
    </>
  );
}

export default ChatWindow;
