import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  VStack,
  Text,
  Avatar,
  Input,
  useColorModeValue,
  Flex,
  Show,
  Fade,
  Heading,
  IconButton,
  useDisclosure,
  useBreakpoint,
  useBreakpointValue,
} from "@chakra-ui/react";
import { FaUser, FaUsers } from "react-icons/fa";

import { useRecoilValue, useSetRecoilState } from "recoil";
import { directMessageState, groupMessageState } from "../atoms/messageAtom";
import { userState } from "../atoms/userAtom";

import axios from "axios";
import { BASE_URL } from "../assets/BASE_URL";
import { socket } from "../socket";
import GroupProfile from "./GroupProfile";
import UserProfile from "./UserProfile";
import { MdOutlineRoundaboutLeft } from "react-icons/md";
import { RiArrowDownCircleFill, RiArrowRightUpLine } from "react-icons/ri";
import SearchBar from "./SearchBar";

const useToggle = () => {
  const [isOpen, setIsOpen] = useState(false);
  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);
  return { isOpen, onOpen, onClose };
};

const Sidebar = ({ onSelectUser, onSelectGroup, handleSelectUser, onCloseDrawer }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const sidebarBg = useColorModeValue("light.surface", "dark.surface");
  const sidebarTextColor = useColorModeValue("light.text", "dark.text");
  const borderInputColor = useColorModeValue("light.borderInput", "dark.borderInput");

  const directMessagesRecoil = useRecoilValue(directMessageState);
  const groupMessagesRecoil = useRecoilValue(groupMessageState);
  const setDirectMessagesRecoil = useSetRecoilState(directMessageState);
  const setGroupMessagesRecoil = useSetRecoilState(groupMessageState);
  const user = useRecoilValue(userState);

  const [directMessages, setDirectMessages] = useState(directMessagesRecoil);
  const [groupMessages, setGroupMessages] = useState(groupMessagesRecoil);

  const [hideSuggestions, setHideSuggestions] = useState(false);
  const searchBarRef = useRef(null);

  const toggleSearchBar = () => {
    setHideSuggestions(false);
  };

  const handleClickOutside = (event) => {
    if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
      setHideSuggestions(true);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const addUserToSidebar = (data) => {
    setDirectMessages((prevDirectMessages) => {
      const newDirectMessages = [...prevDirectMessages];
      const index = newDirectMessages.findIndex(
        (message) =>
          message.receiverId === data.receiverId || message.receiverId === data.senderId
      );

      if (index !== -1) {
        newDirectMessages.splice(index, 1);
      }

      const newMessage = {
        receiverId: data.senderId === user.id ? data.receiverId : data.senderId,
        receiverName: data.senderId === user.id ? data.receiverName : data.senderName,
        receiverProfilePicture:
          data.senderId === user.id
            ? data.receiverProfilePicture
            : data.senderProfilePicture,
        lastMessage: data.messageContent,
        lastMessageType: data.messageType,
      };

      return [newMessage, ...newDirectMessages];
    });

    // Update Recoil state to keep it in sync with the sidebar state
    setDirectMessagesRecoil((prevDirectMessages) => {
      const newDirectMessages = [...prevDirectMessages];
      const index = newDirectMessages.findIndex(
        (message) =>
          message.receiverId === data.receiverId || message.receiverId === data.senderId
      );

      if (index !== -1) {
        newDirectMessages.splice(index, 1);
      }

      const newMessage = {
        receiverId: data.senderId === user.id ? data.receiverId : data.senderId,
        receiverName: data.senderId === user.id ? data.receiverName : data.senderName,
        receiverProfilePicture:
          data.senderId === user.id
            ? data.receiverProfilePicture
            : data.senderProfilePicture,
        lastMessage: data.messageContent,
        lastMessageType: data.messageType,
      };

      return [newMessage, ...newDirectMessages];
    });
  };

  useEffect(() => {
    socket.on("userUpdated", (updatedUser) => {
      // console.log("Updated user in socket event in Sidebar:", updatedUser);

      setDirectMessages((prevDirectMessages) => {
        const updatedDirectMessages = prevDirectMessages.map((message) => {
          if (message.receiverId === updatedUser.userId) {
            return {
              ...message,
              receiverProfilePicture: updatedUser.profilePicture,
              receiverName: updatedUser.fullName,
            };
          }
          return message;
        });

        // console.log("Updated Direct Messages:", updatedDirectMessages);

        return updatedDirectMessages;
      });
    });

    return () => {
      socket.off("userUpdated");
    };
  }, [setDirectMessages]);

  useEffect(() => {
    socket.on("groupUpdated", (updatedGroup) => {
      // console.log("Updated group in socket event in Sidebar:", updatedGroup);

      setGroupMessages((prevGroupMessages) => {
        const updatedGroupMessages = prevGroupMessages.map((message) => {
          if (message.groupId === updatedGroup.groupId) {
            return {
              ...message,
              groupAvatar: updatedGroup.groupAvatar,
              groupName: updatedGroup.groupName,
            };
          }
          return message;
        });

        // console.log("Updated Group Messages:", updatedGroupMessages);

        return updatedGroupMessages;
      });
    });
    return () => {
      socket.off("groupUpdated");
    };
  }, [setGroupMessages]);

  const addGroupToSidebar = (group) => {
    setGroupMessages((prevGroupMessages) => {
      const newGroupMessages = [...prevGroupMessages];
      const index = newGroupMessages.findIndex(
        (message) => message.groupId === group.groupId
      );

      if (index !== -1) {
        newGroupMessages.splice(index, 1);
      }

      const newMessage = {
        groupId: group.groupId,
        groupName: group.groupName,
        groupAvatar: group.groupAvatar,
        lastMessage: group.messageContent,
        lastMessageType: group.messageType,
      };

      return [newMessage, ...newGroupMessages];
    });

    // Update Recoil state to keep it in sync with the sidebar state
    setGroupMessagesRecoil((prevGroupMessages) => {
      const newGroupMessages = [...prevGroupMessages];
      const index = newGroupMessages.findIndex(
        (message) => message.groupId === group.groupId
      );

      if (index !== -1) {
        newGroupMessages.splice(index, 1);
      }

      const newMessage = {
        groupId: group.groupId,
        groupName: group.groupName,
        groupAvatar: group.groupAvatar,
        lastMessage: group.messageContent,
        lastMessageType: group.messageType,
      };

      return [newMessage, ...newGroupMessages];
    });
  };

  useEffect(() => {
    // console.log("Direct Messages:", directMessages);
    // console.log("Group Messages:", groupMessages);
  }, [directMessages, groupMessages]);

  useEffect(() => {
    socket.on("newMessageSidebar", (data) => {
      // console.log("New message sidebar:", data);
      addUserToSidebar(data);
    });

    socket.on("newGroupMessageSidebar", (data) => {
      // console.log("New group message sidebar:", data);
      addGroupToSidebar(data);
    });
  }, []);

  const fetchUserById = async (userId) => {
    const user = await axios.get(`${BASE_URL}/api/user/?userId=${userId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    // setSelectedUser(user.data);
    onSelectUser(user.data);
  };

  const handleSelectedUser = (message) => async () => {
    await fetchUserById(message.receiverId);
  };

  const handleGroupChat = (message) => () => {
    const group = {
      groupId: message.groupId,
      groupName: message.groupName,
      groupAvatar: message.groupAvatar,
    };
    // setSelectedGroup(group);
    onSelectGroup(group);
  };

  const isVisibleBreakpoint = useBreakpointValue({ base: true, md: false, lg: true });

  const handleButtonCloseDrawer = () => {
    onCloseDrawer();
  };

  return (
    <Fade in={true}>
      {/* <Box
        maxWidth="350px"
        bg={sidebarBg}
        p={4}
        borderRightWidth={1}
        borderRightColor={useColorModeValue("light.border", "dark.border")}
        overflowY="auto"
        textAlign={{ md: "left", base: "center" }}
        height="100%"
        width="auto"
        minWidth={{ base: "15vw" }}
      > */}
      {isVisibleBreakpoint && (
        <div ref={searchBarRef} onClick={toggleSearchBar} mb={2}>
          <SearchBar onSelectUser={handleSelectUser} hideSuggestions={hideSuggestions} />
        </div>
      )}

      <VStack spacing={4} align="stretch">
        <VStack spacing={2} align="stretch" mt={4}>
          <Box>
            {isVisibleBreakpoint && (
              <Text fontWeight="bold" fontFamily="heading" fontSize={20}>
                Direct Messages
              </Text>
            )}
            {!isVisibleBreakpoint && (
              <Text fontSize={20} fontFamily="heading" fontWeight="bold">
                DM
              </Text>
            )}

            <DirectMessageList
              directMessages={directMessages}
              handleSelectedUser={handleSelectedUser}
              onCloseDrawer={onCloseDrawer}
            />
          </Box>
          <Text fontSize={20} fontWeight="bold" fontFamily="heading">
            Groups
          </Text>
          <GroupMessageList
            groupMessages={groupMessages}
            handleGroupChat={handleGroupChat}
            onCloseDrawer={onCloseDrawer}
          />
        </VStack>
      </VStack>
      {/* </Box> */}
    </Fade>
  );
};

const truncateText = (text, length) => {
  if (text.length > length) {
    return text.substring(0, length) + "...";
  }
  return text;
};

const GroupMessageList = ({ groupMessages, handleGroupChat, onCloseDrawer }) => {
  const isVisibleBreakpoint = useBreakpointValue({ base: true, md: false, lg: true });
  const toggles = groupMessages.map(() => useToggle());


  return (
    <>
      {groupMessages.map((message, index) => (
        <Box
          mt={2}
          p={1}
          sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
          key={index}
        >
          {isVisibleBreakpoint && (
            <Show>
              <Box onClick={toggles[index].onOpen} sx={{ display: "flex", gap: "1rem" }}>
                <Avatar name={message.groupName} size="md" src={message.groupAvatar} />
                <VStack align="start">
                  <Text fontSize="md" fontWeight="bold">
                    {truncateText(message.groupName, 13)}
                  </Text>
                  {message.lastMessageType === "text" && (
                    <Text fontSize="sm" isTruncated>
                      {truncateText(message.lastMessage, 10)}
                    </Text>
                  )}
                  {message.lastMessageType === "image" && (
                    <Text fontSize="sm">Image</Text>
                  )}
                  {message.lastMessageType === "video" && (
                    <Text fontSize="sm">Video</Text>
                  )}
                </VStack>
              </Box>
              <GroupProfile
                groupId={message.groupId}
                isOpen={toggles[index].isOpen}
                onClose={toggles[index].onClose}
              />
              <Show above="lg">
                <IconButton onClick={()=>handleGroupChat(message)()} icon={<FaUsers />} />
              </Show>
              <Show below="md">
                <IconButton
                  onClick={() => {
                    handleGroupChat(message)();
                    onCloseDrawer();
                  }}
                  icon={<FaUsers />}
                />
              </Show>
            </Show>
          )}
          {!isVisibleBreakpoint && (
            <Show>
              <Box onClick={handleGroupChat(message)}>
                <Avatar name={message.groupName} size="md" src={message.groupAvatar} />
              </Box>
            </Show>
          )}
        </Box>
      ))}
    </>
  );
};

const DirectMessageList = ({ directMessages, handleSelectedUser, onCloseDrawer }) => {
  const [onlineStatuses, setOnlineStatuses] = useState({});
  const toggles = directMessages.map(() => useToggle());
  const isVissibleBreakpoint = useBreakpointValue({ base: true, md: false, lg: true });
 

  useEffect(() => {
    directMessages.forEach((message) => {
      // console.log("Checking online status of:", message.receiverId);
      socket.emit("checkOnlineStatus", message.receiverId);
    });
    socket.on("onlineStatus", ({ userId, isOnline }) => {
      // console.log("Online Status: ", userId, " is ", isOnline);
      setOnlineStatuses((prevOnlineStatuses) => ({
        ...prevOnlineStatuses,
        [userId]: isOnline,
      }));
    });

    // console.log("Online Statuses at direct:", onlineStatuses);

    return () => {
      socket.off("onlineStatus");
    };
  }, [directMessages, socket]);

  return (
    <>
      {directMessages.map((message, index) => (
        <Box
          mt={2}
          p={1}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
          // onClick={handleSelectedUser(message)}
          key={index}
        >
          {isVissibleBreakpoint && (
            <Show>
              <Box onClick={toggles[index].onOpen} sx={{ display: "flex", gap: "1rem" }}>
                <Box position="relative">
                  <Avatar
                    name={message.receiverName}
                    size="md"
                    src={message.receiverProfilePicture}
                  />
                  <Box
                    position="absolute"
                    top={0}
                    right={-1}
                    width="10px"
                    height="10px"
                    borderRadius="50%"
                    bg={onlineStatuses[message.receiverId] ? "green.500" : "gray.500"}
                  />
                </Box>
                <VStack align="start">
                  <Text fontSize="md" fontWeight="bold">
                    {truncateText(message.receiverName, 13)}
                  </Text>
                  {message.lastMessageType === "text" && (
                    <Text fontSize="sm">{truncateText(message.lastMessage, 10)}</Text>
                  )}
                  {message.lastMessageType === "image" && (
                    <Text fontSize="sm">Image</Text>
                  )}
                  {message.lastMessageType === "video" && (
                    <Text fontSize="sm">Video</Text>
                  )}
                </VStack>
              </Box>
              <UserProfile
                userId={message.receiverId}
                isOpen={toggles[index].isOpen}
                onClose={toggles[index].onClose}
              />
              <Show above="lg">
                <IconButton
                  onClick={()=>handleSelectedUser(message)()}
                  icon={<RiArrowRightUpLine />}
                />
              </Show>
              <Show below="md">
                <IconButton
                  onClick={() => {
                     handleSelectedUser(message)();
                    onCloseDrawer();
                  }}
                  icon={<RiArrowRightUpLine />}
                />
              </Show>
            </Show>
          )}
          {!isVissibleBreakpoint && (
            <Show>
              <Box onClick={handleSelectedUser(message)} position="relative">
                <Avatar
                  name={message.receiverName}
                  size="md"
                  src={message.receiverProfilePicture}
                />
                <Box
                  position="absolute"
                  top={0}
                  right={-1}
                  width="10px"
                  height="10px"
                  borderRadius="50%"
                  bg={onlineStatuses[message.receiverId] ? "green.500" : "gray.500"}
                />
              </Box>
            </Show>
          )}
        </Box>
      ))}
    </>
  );
};

export default Sidebar;
