import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useColorModeValue,
  Fade,
  useToast,
  useColorMode,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../assets/BASE_URL";
import { socket } from "../socket";
import { useSetRecoilState } from "recoil";
import { userState, newUserState } from "../atoms/userAtom";

const Signup = ({ setIsLogin }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [fileError, setFileError] = useState(null);
  const setNewUserState = useSetRecoilState(newUserState);

  const buttonBg = useColorModeValue("light.buttonBackground", "dark.buttonBackground");
  const buttonHover = useColorModeValue(
    "light.buttonBackground",
    "dark.buttonBackground"
  );
  const toast = useToast();
  const { colorMode } = useColorMode();

  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!isValidImage(file)) {
      toast({
        title: "Invalid Image File",
        description: "Please select a valid image file (png, jpg, jpeg)",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setFileError("Please select a valid image file (png, jpg, jpeg)");
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
      setFileError("The file size should not exceed 3 MB");
      return;
    }

    setFileError(null);
    convertImageToBase64(file).then((data) => {
      setProfilePicture(data);
    });
  };

  const isValidImage = (file) => {
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
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
          title: "Error",
          description: "Failed to convert image to base64",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        reject(error);
      };
    });
  };

  const setUser = useSetRecoilState(userState);

  const handleSignup = (e) => {
    e.preventDefault();

    if (!fullName || !email || !password) {
      toast({
        title: "Full Name, email and password are required",
        description: "Please fill in all fields",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      // console.error("All fields are required");
      return;
    }

    if (fullName.length > 50 || typeof fullName !== "string") {
      toast({
        title: "Invalid Full Name",
        description: "Full name must be a string and less than 50 characters",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      // console.error("Invalid Full Name");
      return;
    }

    if (email.length > 254 || typeof email !== "string") {
      toast({
        title: "Invalid Email",
        description: "Email must be a string and less than 254 characters",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      // console.error("Invalid Email");
      return;
    }

    if (password.length < 6 || typeof password !== "string") {
      toast({
        title: "Invalid Password",
        description: "Password must be a string and at least 6 characters",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      // console.error("Invalid Password");
      return;
    }

    axios
      .post(
        `${BASE_URL}/api/auth/register`,
        {
          fullName,
          email,
          password,
          profilePicture,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        // console.log("Login Response:", response.data);
        const { user, token } = response.data;
        localStorage.setItem("token", token);

        // console.log("user id, ", user.id);
        // Connect to socket
        socket.connect();
        socket.emit("registerSocketId", user.id);
        socket.on("socketIdRegistered", (data) => {
          // console.log("Socket ID Registered:", data);
          user.socketId = data;
          setUser(user);
          localStorage.setItem("userId", user.id);
          localStorage.setItem("socketId", user.socketId);
        });

        // socket.emit("checkOnlineStatus", user.id);

        // console.log("User:", user);

        navigate("/main");
      })
      .catch((error) => {
        // console.error(error);
      });
  };

  const bg = useColorModeValue("light.background", "dark.background");
  const boxBg = useColorModeValue("light.surface", "dark.surface");
  const textColor = useColorModeValue("light.text", "dark.text");

  return (
    <Fade in={true}>
      <Box
        py={8}
        px={4}
        maxW={{ base: "90%", md: "400px" }} // Responsive width: 90% on mobile, 400px on larger screens
        minH={{ base: "auto", md: "40vh" }}
        maxH={{ base: "50vh", md: "auto" }} 
        borderWidth={1}
        borderRadius={8}
        boxShadow="lg"
        bg={boxBg}
        color={textColor}
        mx="auto" // Centers the box horizontally
        overflowY="auto"
      >
        <VStack spacing={4} align="stretch">
          <Heading as="h1" size="xl" textAlign="center" mb={4}>
            Sign Up
          </Heading>
          <FormControl id="name">
            <FormLabel>Full Name</FormLabel>
            <Input
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </FormControl>
          <FormControl id="email">
            <FormLabel>Email address</FormLabel>
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormControl>
          <FormControl id="password">
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Upload a profile image</FormLabel>
            <Input type="file" onChange={handleFileChange} />
            {fileError && (
              <Box color="red.500" fontSize="sm" mt={2}>
                {fileError}
              </Box>
            )}
          </FormControl>
          <Button
            background={buttonBg}
            size="lg"
            mt={4}
            rounded="full"
            _hover={{
              bg: colorMode === "dark" ? "#012124" : "#075E",
            }}
            onClick={handleSignup}
          >
            Sign Up
          </Button>
          <Text textAlign="center">
            Already have an account?{" "}
            <Button variant="link" colorScheme="teal" onClick={() => setIsLogin(true)}>
              Login
            </Button>
          </Text>
        </VStack>
      </Box>
    </Fade>
  );
};

export default Signup;
