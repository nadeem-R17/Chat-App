import React, { useEffect, useState } from "react";
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Avatar,
  VStack,
  HStack,
  Wrap,
  WrapItem,
  Tag,
  TagLabel,
  TagCloseButton,
  IconButton,
  useColorMode,
  useToast,
  Textarea,
} from "@chakra-ui/react";
import { FaTrashAlt, FaEdit } from "react-icons/fa";
import { useRecoilValue } from "recoil";
import { userState } from "../atoms/userAtom";
import SearchBar from "./SearchBar"; 
import axios from "axios";
import { BASE_URL } from "../assets/BASE_URL";
import { RiArrowRightUpLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";

let groupNameInit;

const GroupProfile = ({ groupId, isOpen, onClose }) => {
  // const { onClose } = useDisclosure();
  const loggedInUser = useRecoilValue(userState);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [groupAvatar, setGroupAvatar] = useState("");
  const [groupAdminId, setGroupAdminId] = useState("");
  const [newGroupAvatar, setNewGroupAvatar] = useState(null);
  const [members, setMembers] = useState([]);
  const [memberIds, setMemberIds] = useState([]);
  const [newMember, setNewMember] = useState("");
  const toast = useToast();
  const { colorMode } = useColorMode();

  const navigate = useNavigate();

  // console.log("Group ID:", groupId);

  useEffect(() => {
    const getGroupDetails = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/api/groups/details/?groupId=${groupId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const group = response.data;
        setGroupName(group.groupName);
        setGroupDescription(group.groupDescription);
        setGroupAvatar(group.groupAvatar);
        setMembers(group.groupMembers);
        setMemberIds(group.groupMemberIdsArray);
        setGroupAdminId(group.groupAdminId);

        groupNameInit = group.groupName;
      } catch (error) {
        // console.error("Error fetching group details:", error);
      }
    };

    getGroupDetails();
  }, [groupId, isOpen]);

  useEffect(() => {
    // console.log("Member in groupProfile comp: ",members);
  }, [members]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;
    
    if (!isValidFile(file)) {
      toast({
        title: "Invalid file type. Please upload an image.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (file.size > 1024 * 1024 * 3) {
      toast({
        title: "File size too large. Please upload an image less than 3MB.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    convertImageToBase64(file).then((base64Image) => {
      setNewGroupAvatar(base64Image);
    });
  };

  const isValidFile = (file) => {
    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
    ];
    return allowedTypes.includes(file.type);
  };

  const convertImageToBase64 = (image) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(image);
      fileReader.onload = () => {
        resolve(fileReader.result);
      };
      fileReader.onerror = (error) => {
        toast({
          title: "Error converting image to base64.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        reject(error);
      };
    });
  };


  const handleDeleteAvatar = () => {
    setNewGroupAvatar(null);
    setGroupAvatar(null);
  };

  const handleAddMember = (user) => {
    if (!memberIds.some((u) => u.userId === user._id)) {
      setMemberIds([...memberIds, user._id]);
      setMembers([...members, user]);
    }
  };

  const handleRemoveMember = (userId) => {
    setMembers(members.filter((member) => member.userId !== userId));
    setMemberIds(memberIds.filter((id) => id !== userId));
  };

  const handleUpdateGroup = async () => {
    const data = {
      groupId,
      groupName,
      groupAvatar: newGroupAvatar || groupAvatar,
      groupDescription,
      members: memberIds,
    };

    try {
      await axios.put(`${BASE_URL}/api/groups/update`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      toast({
        title: "Group updated.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      // window.location.reload();
      await updateGroupToSocket(data);
      // navigate("/main");
    } catch (error) {
      // console.error("Error updating group:", error);
      toast({
        title: "Error updating group.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    onClose();
  };

  const updateGroupToSocket = async (data) => {
    // console.log("Sending update group:", data);
    socket.emit("updateGroup", data);
  };

  const handleClose = () => {
    onClose();
    setNewGroupAvatar(null); // Reset avatar changes
  };

  useEffect(() => {
    // console.log("Members:", members);
  }, [members]);

  return (
    <div>
      

      <Modal isOpen={isOpen} onClose={handleClose} size="lg">
        <ModalOverlay />
        <ModalContent bg={colorMode === "dark"? "#294950": "#FFFFFF"}>
          <ModalHeader>{groupNameInit}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <HStack spacing={8} alignItems="start">
              {/* Left side: Group avatar */}
              <VStack spacing={4} alignItems="center" width="50%">
                <Avatar src={newGroupAvatar || groupAvatar} size="2xl" mb={4} />
                {loggedInUser.id === groupAdminId && (
                  <HStack>
                    <IconButton
                      icon={<FaEdit />}
                      onClick={() => document.getElementById("group-file-input").click()}
                      aria-label="Edit group avatar"
                      size="sm"
                      colorScheme="blue"
                    />
                    <IconButton
                      icon={<FaTrashAlt />}
                      onClick={handleDeleteAvatar}
                      aria-label="Delete group avatar"
                      size="sm"
                      colorScheme="red"
                    />
                  </HStack>
                )}
                <Input
                  type="file"
                  id="group-file-input"
                  onChange={handleAvatarChange}
                  display="none"
                />
              </VStack>

              {/* Right side: Group information */}
              <VStack spacing={4} width="50%">
                <FormControl isRequired>
                  <FormLabel>Group Name</FormLabel>
                  <Input
                    placeholder="Enter group name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    disabled={loggedInUser.id !== groupAdminId}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Group Description</FormLabel>
                  <Textarea
                    placeholder="Enter group description"
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                    disabled={loggedInUser.id !== groupAdminId}
                  />
                </FormControl>

                {/* Members list */}
                <FormControl>
                  <FormLabel>Members</FormLabel>
                  <Wrap>
                    {members.map((user, index) => (
                      <WrapItem key={index}>
                        <Tag
                          size="lg"
                          borderRadius="full"
                          variant="solid"
                          colorScheme="teal"
                        >
                          <Avatar
                            src={user.profilePicture}
                            size="xs"
                            name={user.fullName}
                            ml={-1}
                            mr={2}
                          />
                          <TagLabel>{user.fullName || user.email}</TagLabel>
                          {loggedInUser.id === groupAdminId && (
                            <TagCloseButton
                              onClick={() => handleRemoveMember(user.userId)}
                            />
                          )}
                        </Tag>
                      </WrapItem>
                    ))}
                  </Wrap>
                </FormControl>

                {/* Add new members */}
                {loggedInUser.id === groupAdminId && (
                  <FormControl>
                    <FormLabel>Add Members</FormLabel>
                    <SearchBar onSelectUser={handleAddMember} />
                  </FormControl>
                )}
              </VStack>
            </HStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              bg={colorMode === "dark" ? "#075E" : "#C0C0C0"}
              _hover={{ bg: colorMode === "dark" ? "#075000" : "#CFCFCF" }}
              onClick={() => {
                if (loggedInUser.id === groupAdminId) {
                  handleUpdateGroup();
                } else {
                  toast({
                    title: "Only admin can make changes.",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                  });
                }
              }}
              cursor={loggedInUser.id === groupAdminId ? "pointer" : "not-allowed"}
              ml={3}
              disabled={!loggedInUser.isAdmin}
            >
              Update
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default GroupProfile;
