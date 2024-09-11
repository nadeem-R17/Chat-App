import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Flex,
  useColorMode,
  IconButton,
  useDisclosure,
  HStack,
  Text,
  Avatar,
  useColorModeValue,
  Fade,
  Spinner,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Switch,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Show,
  Input,
} from "@chakra-ui/react";

import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import CreateGroup from "../components/CreateGroup";
import SearchBar from "../components/SearchBar";

import axios from "axios";
import { BASE_URL } from "../assets/BASE_URL";

import { useSetRecoilState, useRecoilValue, useResetRecoilState } from "recoil";
import { newUserState, userState } from "../atoms/userAtom";
import { directMessageState, groupMessageState } from "../atoms/messageAtom";
import UserProfile from "../components/UserProfile";
import { IoSearchOutline } from "react-icons/io5";
import { socket } from "../socket";
import { FaBars } from "react-icons/fa";

const MainLayout = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const {
    isOpen: isDrawerOpen,
    onOpen: onDrawerOpen,
    onClose: onDrawerClose,
  } = useDisclosure(); 
  const {
    isOpen: isProfileOpen,
    onOpen: onProfileOpen,
    onClose: onProfileClose,
  } = useDisclosure(); 
  const {
    isOpen: isCreateGroupOpen,
    onOpen: onCreateGroupOpen,
    onClose: onCreateGroupClose,
  } = useDisclosure(); 

  const [isSearchVisible, setSearchVisible] = useState(false);
  const [hideSuggestions, setHideSuggestions] = useState(false);
  const searchBarRef = useRef(null);

  const surfaceColor = useColorModeValue("light.surface", "dark.surface");
  const headerBg = useColorModeValue("light.background", "dark.background");
  const headerTextColor = useColorModeValue("light.text", "dark.text");
  const borderInputColor = useColorModeValue("light.borderInput", "dark.borderInput");

  const sidebarBg = useColorModeValue("light.surface", "dark.surface");

  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const setDirectMessagesState = useSetRecoilState(directMessageState);
  const setGroupMessagesState = useSetRecoilState(groupMessageState);
  
  const newUser = useRecoilValue(newUserState);
  const updateNewUserState = useResetRecoilState(newUserState);
  const loggedInUser = useRecoilValue(userState);
  const setLoggedInUser = useSetRecoilState(userState);
  
  const resetUser = useResetRecoilState(userState);
  const resetDirectMessages = useResetRecoilState(directMessageState);
  const resetGroupMessages = useResetRecoilState(groupMessageState);
  
  const [showCreateGroup, setShowCreateGroup] = useState(false);  
  const [userProfile, setUserProfile] = useState(null);

  const toggleSearchBar = () => {
    setSearchVisible(!isSearchVisible);
    setHideSuggestions(false);
  };

  const handleClickOutside = (event) => {
    if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
      setHideSuggestions(true);
      setSearchVisible(false);
    }
  };

  useEffect(() => {
    if (isSearchVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchVisible]);
  
  // fetch the previous messages after login
  useEffect(() => {
    const fetchMessages = async () => {
      if (!userId || !token) {
        return;
      }
      if (newUser) {
        updateNewUserState();
        return;
      }

      try {
        const response = await axios.get(
          `${BASE_URL}/api/message/history?userId=${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setDirectMessagesState(response.data.directMessages);
        setGroupMessagesState(response.data.groupMessages);
        setLoading(false);
      } catch (error) {
        // console.error("Error fetching messages:", error);
        setLoading(false);
      }
    };
    fetchMessages();
  }, [userId, token]);

  const handleLogout = () => {
    resetUser();
    resetDirectMessages();
    resetGroupMessages();
    localStorage.clear();
    socket.emit("logout");
    window.location.href = "/";
  };

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const handleSelectUser = (user) => {
    // console.log("Selected user:", user);
    setSelectedUser(user);
    setSelectedGroup(null);
  };

  const handleSelectGroup = (group) => {
    setSelectedGroup(group);
    setSelectedUser(null);
    // console.log("Selected group:", selectedGroup);
  };

  const handleUserProfile = (user) => {
    setUserProfile(user);
  };


  const handleCreateGroupClick = () => {
    setShowCreateGroup(!showCreateGroup);
  };

  return (
    <Flex direction="column" height="100vh">
      <Flex
        as="header"
        align="center"
        justify="space-between"
        pl={4}
        pr={4}
        bg={headerBg}
        color={headerTextColor}
        borderBottomWidth={1}
        borderBottomColor={useColorModeValue("light.border", "dark.border")}
        height={{ base: "8vh", lg: "8vh" }}
      >
        <HStack spacing={4}>
          <Show below="md">
            <IconButton
              icon={<FaBars />}
              aria-label="Search"
              variant="outline"
              onClick={onDrawerOpen}
            />
          </Show>
          <Text fontSize="xl" fontWeight="bold">
            Chat App
          </Text>
        </HStack>
        <HStack spacing={4}>
          <Box ref={searchBarRef}>
            {!isSearchVisible ? (
              <IconButton
                icon={<IoSearchOutline />}
                aria-label="Search"
                variant="outline"
                onClick={toggleSearchBar}
              />
            ) : (
              <SearchBar
                onSelectUser={handleSelectUser}
                hideSuggestions={hideSuggestions}
              />
            )}
          </Box>
          <UserProfile
            userId={loggedInUser.id}
            isOpen={isProfileOpen}
            onClose={onProfileClose}
          />
          <CreateGroup
            onSelectGroup={handleSelectGroup}
            isOpen={isCreateGroupOpen}
            onClose={onCreateGroupClose}
          />

          <Menu closeOnSelect={false}>
            <MenuButton
              as={Avatar}
              src={loggedInUser.profilePicture}
              aria-label="Options"
              sx={{ _hover: { cursor: "pointer" } }}
            />
            <MenuList minWidth="2vw" bg={surfaceColor} boxShadow="lg">
              <MenuItem onClick={onProfileOpen} bg={surfaceColor}>
                Profile
              </MenuItem>
              <MenuItem onClick={onCreateGroupOpen} bg={surfaceColor}>
                Create Group
              </MenuItem>
              <MenuItem bg={surfaceColor}>
                <Flex align="center">
                  <Text mr={2}>{colorMode === "dark" ? "Dark Mode" : "Light Mode"}</Text>

                  <Switch isChecked={colorMode === "dark"} onChange={toggleColorMode} />
                </Flex>
              </MenuItem>
              <MenuDivider />
              <MenuItem bg={surfaceColor} onClick={() => handleLogout()}>
                Logout
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>

      <Flex flex="1" overflow="hidden">
        {/* Sidebar */}

        {loading ? (
          <Spinner size="xl" m="auto" />
        ) : (
          <Show above="md">
            <Box
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
            >
              <Sidebar
                onSelectUser={handleSelectUser}
                onSelectGroup={handleSelectGroup}
                handleSelectUser={handleSelectUser}
                onCloseDrawer={onDrawerClose}
              />
            </Box>
          </Show>
        )}

        <ChatWindow receiver={selectedUser} group={selectedGroup} />
      </Flex>
      {/* Drawer for mobile view */}
      <Drawer isOpen={isDrawerOpen} placement="left" onClose={onDrawerClose}>
        <DrawerOverlay />
        <DrawerContent bg={surfaceColor}>
          <DrawerCloseButton />
          <DrawerHeader>Search Chats</DrawerHeader>
          <DrawerBody height="90vh">
            <Box height="90vh">
              {loading ? (
                <Spinner size="xl" m="auto" />
              ) : (
                <Sidebar
                  onSelectUser={handleSelectUser}
                  onSelectGroup={handleSelectGroup}
                  handleSelectUser={handleSelectUser}
                  onCloseDrawer={onDrawerClose}
                />
              )}
            </Box>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Flex>
  );
};

export default MainLayout;
