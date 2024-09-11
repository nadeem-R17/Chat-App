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
  useToast,
  IconButton,
  Textarea,
  useColorMode,
} from "@chakra-ui/react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { userState } from "../atoms/userAtom";
import { FaTrashAlt, FaEdit } from "react-icons/fa"; 
import axios from "axios";
import { BASE_URL } from "../assets/BASE_URL";
import { socket } from "../socket";

const UserProfile = ({ userId, isOpen, onClose }) => {
  const loggedInUser = useRecoilValue(userState);
  const setLoggedInUser = useSetRecoilState(userState);
  const [fullName, setFullName] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [newProfilePicture, setNewProfilePicture] = useState(null);
  const toast = useToast();
  const { colorMode } = useColorMode();

  useEffect(() => {
    const getUserDetails = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/user/?userId=${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const user = response.data;
        setFullName(user.fullName);
        setProfilePicture(user.profilePicture);
        setEmail(user.email);
        setStatus(user.status);
        // setUserId(user._id);
      } catch (error) {
        // console.error("Error fetching user details:", error);
      }
    };
    getUserDetails();
  }, [userId, isOpen]);


  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;
    
    if (!isValidFile(file)) {
      toast({
        title: "Invalid file format. Please upload an image.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (file.size > 1024 * 1024 * 3) {
      toast({
        title: "File size exceeds 3MB limit.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    convertImageToBase64(file).then((base64Image) => {
      setNewProfilePicture(base64Image);
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

  const handleDeleteProfilePicture = () => {
    setNewProfilePicture(null);
    setProfilePicture(null);
  };

  const handleUpdateUser = async () => {

    const data = {
      userId: loggedInUser.id,
      fullName,
      profilePicture: newProfilePicture || profilePicture,
      status,
    };

    try {
      const response = await axios.put(`${BASE_URL}/api/user/update`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      toast({
        title: "Profile updated.",
        status: "success", 
        duration: 3000,
        isClosable: true,
      });

      setLoggedInUser((prev) => ({ ...prev, fullName: data.fullName, profilePicture: data.profilePicture, status: data.status }));

      await sendUpdateNotification(data);

    } catch (error) {
      // console.error("Error updating user:", error);
      toast({
        title: "Error updating user.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    onClose();
  };

  const sendUpdateNotification = async (data) => {

    // console.log("Sending update notification:", data);
    socket.emit("updateUser", data);
  };

  const handleClose = () => {
    onClose();
    setNewProfilePicture(null); 
  };

  return (
    <div>
      <Modal isOpen={isOpen} onClose={handleClose} size="lg">
        <ModalOverlay />
        <ModalContent bg={colorMode === "dark"? "#294950": "#FFFFFF"}>
          <ModalCloseButton />
          <ModalHeader>User Profile</ModalHeader>
          <ModalBody>
            <HStack spacing={8} alignItems="start">
              <VStack spacing={4} alignItems="center" width="50%">
                <Avatar
                  src={newProfilePicture || profilePicture}
                  size="2xl"
                  mb={4}
                />
                <HStack>
                  <IconButton
                    icon={<FaEdit />}
                    cursor={loggedInUser.id === userId ? "pointer" : "not-allowed"}
                    onClick={() => {
                      if (userId === loggedInUser.id) {
                        document.getElementById("file-input-user").click();
                      } else {
                        toast({
                          title: "You can only edit your own profile.",
                          status: "error",
                          duration: 3000,
                          isClosable: true,
                        });
                      }
                    }}
                    aria-label="Edit profile picture"
                    size="sm"
                    colorScheme="blue"
                    disabled={userId !== loggedInUser.id}
                  />
                  <IconButton
                    icon={<FaTrashAlt />}
                    onClick={() => {
                      if (userId === loggedInUser.id) {
                        handleDeleteProfilePicture();
                      } else {
                        toast({
                          title: "You can only delete your own profile.",
                          status: "error",
                          duration: 3000,
                          isClosable: true,
                        });
                      }
                    }}
                    aria-label="Delete profile picture"
                    size="sm"
                    colorScheme="red"
                    cursor={loggedInUser.id === userId ? "pointer" : "not-allowed"}
                    disabled={userId !== loggedInUser.id}
                  />
                </HStack>
                <Input
                  type="file"
                  id="file-input-user"
                  onChange={handleProfilePictureChange}
                  display="none"
                />
              </VStack>

              {/* Right side: User information */}
              <VStack spacing={4} width="50%">
                <FormControl isRequired>
                  <FormLabel>Full Name</FormLabel>
                  <Input
                    placeholder="Enter your name"
                    value={fullName}
                    // value={user.fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={userId !== loggedInUser.id}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <Input value={email} disabled />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Status</FormLabel>
                  <Textarea
                    placeholder="Status..."
                    value={status}
                    // value={user.fullName}
                    onChange={(e) => setStatus(e.target.value)}
                    disabled={userId !== loggedInUser.id}
                  />
                </FormControl>
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
                if (userId === loggedInUser.id) {
                  handleUpdateUser();
                } else {
                  toast({
                    title: "You can only update your own profile.",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                  });
                }
              }}
              cursor={loggedInUser.id === userId ? "pointer" : "not-allowed"}
              ml={3}
              disabled={userId !== loggedInUser.id}
            >
              Update
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default UserProfile;
