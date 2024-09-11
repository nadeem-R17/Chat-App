import React, { useState } from "react";
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
  useDisclosure,
  useToast,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
  IconButton,
  useColorMode,
} from "@chakra-ui/react";
import axios from "axios";
import { BASE_URL } from "../assets/BASE_URL";
import { userState } from "../atoms/userAtom";
import { useRecoilValue } from "recoil";
import SearchBar from "./SearchBar";
import { FaPlus } from "react-icons/fa6";

const CreateGroup = ({ onSelectGroup, isOpen, onClose }) => {
  // const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupName, setGroupName] = useState("");
  const [groupAvatar, setGroupAvatar] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [members, setMembers] = useState([]);
  const [memberIds, setMemberIds] = useState([]);
  const user = useRecoilValue(userState);
  const toast = useToast();
  const { colorMode } = useColorMode();

  const handleCreateGroup = async () => {
    if (!groupName || memberIds.length === 0) {
      toast({
        title: "Validation Error",
        description: "Group name and users are required.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    // console.log("user id in handleCreateGroup", user.id);

    const groupData = {
      groupName,
      groupAvatar,
      groupDescription,
      members: memberIds,
      userId: user.id,
    };

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${BASE_URL}/api/groups/create`, groupData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast({
        title: "Group Created",
        description: `Group "${groupName}" created successfully.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      const group = response.data.groupCreated;

      // console.log("group created in CreateGroup: ", group);

      onSelectGroup(group);

      handleClose();
    } catch (error) {
      // console.error("Error creating group:", error);
      toast({
        title: "Error",
        description: "Failed to create group. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleClose = () => {
    setGroupName("");
    setGroupAvatar("");
    setMembers([]);
    setMemberIds([]);
    onClose();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Avatar should not exceed 1 MB.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    convertImageToBase64(file).then((data) => {
      setGroupAvatar(data);
    });
  };

  const convertImageToBase64 = (image) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(image);
      fileReader.onload = () => {
        resolve(fileReader.result);
      };
      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  const handleRemoveUser = (userId) => {
    setMembers(members.filter((user) => user._id !== userId));
    setMemberIds(memberIds.filter((id) => id !== userId));
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent bg={colorMode === "dark" ? "#294950" : "#FFFFFF"}>
          <ModalHeader>Create a New Group</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Group Name</FormLabel>
                <Input
                  placeholder="Enter group name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Group Description</FormLabel>
                <Input
                  placeholder="Enter group description"
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Group Avatar</FormLabel>
                <Input type="file" onChange={handleAvatarChange} />
                {groupAvatar && <Avatar src={groupAvatar} size="lg" mt={2} />}
              </FormControl>

              {/* User Search and Selection */}
              <FormControl>
                <FormLabel>Add Users</FormLabel>
                <SearchBar
                  onSelectUser={(user) => {
                    if (!members.some((u) => u._id === user._id)) {
                      setMembers([...members, user]);
                    }
                    if (!memberIds.includes(user._id)) {
                      setMemberIds([...memberIds, user._id]);
                    }
                  }}
                />
              </FormControl>

              {/* Display selected users */}
              <Wrap>
                {members.map((user) => (
                  <WrapItem key={user._id}>
                    <Tag size="lg" borderRadius="full" variant="solid" colorScheme="teal">
                      <Avatar
                        src={user.avatar}
                        size="xs"
                        name={user.name}
                        ml={-1}
                        mr={2}
                      />
                      <TagLabel>{user.name || user.email}</TagLabel>
                      <TagCloseButton onClick={() => handleRemoveUser(user._id)} />
                    </Tag>
                  </WrapItem>
                ))}
              </Wrap>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button colorScheme="teal" onClick={handleCreateGroup} ml={3}>
              {/* <Button colorScheme="teal" ml={3}> */}
              Create Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default CreateGroup;
