import React, { useEffect, useState } from "react";
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
  useColorMode,
  Fade,
  useToast,
} from "@chakra-ui/react";

import { useNavigate } from "react-router-dom";
import axios from "axios";

import { BASE_URL } from "../assets/BASE_URL";
import { socket } from "../socket";

import { useSetRecoilState, useRecoilValue, useRecoilState } from "recoil";
import { userState } from "../atoms/userAtom";

const Login = ({setIsLogin}) => {
  const { colorMode, toggleColorMode } = useColorMode();

  const bg = useColorModeValue("light.background", "dark.background");
  const boxBg = useColorModeValue("light.surface", "dark.surface");
  const textColor = useColorModeValue("light.text", "dark.text");
  const buttonBg = useColorModeValue("light.buttonBackground", "dark.buttonBackground");
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const setUser = useSetRecoilState(userState);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: "Invalid input",
        description: "Email and password are required.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      // console.error("Email and password are required");
      return;
    }

    if (email.length > 254) {
      toast({
        title: "Invalid email",
        description: "Email must be a less than 254 characters.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    if (typeof email !== "string" || typeof password !== "string") {
      toast({
        title: "Invalid input",
        description: "Email and password must be strings.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/api/auth/login`,
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 400) {
        toast({
          title: "Login failed",
          description: "Invalid email or password.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      if (response.status === 500) {
        toast({
          title: "Login failed",
          description: "Internal server error.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const { user, token, groupIds } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("userId", user.id);

      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));

      const registeredUser = await registerSocketId(user);
      const joinGroups = await joinSocketGroups(groupIds);

      // console.log("Join groups:", joinGroups);

      // console.log("User after socket registered:", registeredUser);

      navigate("/main");
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  const registerSocketId = (user) => {
    return new Promise((resolve, reject) => {
      socket.connect();
      socket.emit("registerSocketId", user.id);
      socket.on("socketIdRegistered", (data) => {
        console.log("Socket ID Registered:", data);
        localStorage.setItem("socketId", data);

        setUser((prev) => ({ ...prev, socketId: data }));
        localStorage.setItem("user", JSON.stringify({ ...user, socketId: data }));

        resolve(user);
      });

      // socket.emit("checkOnlineStatus", user.id);

      socket.on("error", (error) => {
        reject(error);
      });
    });
  };

  const joinSocketGroups = (groupIds) => {
    return new Promise((resolve, reject) => {
      groupIds.forEach((groupId) => {
        socket.emit("joinGroup", groupId);
      });
      resolve("Joined groups");
      socket.on("error", (error) => {
        reject(error);
      });
    });
  };

  return (
    <Fade in={true}>
        <Box
           py={{ base: 4, md: 8 }} // Reduced padding on mobile screens
           px={{ base: 2, md: 4 }}
           maxWidth={{ base: "90%", md: "700px" }} // Adjust width for mobile
           width="100%" // Ensure it takes the full width on smaller screens
           borderWidth={1}
           borderRadius={8}
           boxShadow="lg"
           bg={boxBg}
           color={textColor}
           mx="auto" // Center the box horizontally
        >
          <VStack spacing={4} align="stretch">
            <Heading as="h1" size="xl" textAlign="center" mb={4}>
              Login
            </Heading>
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
            <Button
              background={buttonBg}
              size="lg"
              mt={4}
              rounded="full"
              _hover={{
                bg: colorMode === "dark" ? "#012124" : "#075E",
              }}
              onClick={handleLogin}
            >
              Login
            </Button>
            <Text textAlign="center">
              Don't have an account?{" "}
              <Button
              variant="link"
              colorScheme="teal"
              onClick={() => setIsLogin(false)}
              >
                Signup
              </Button>
            </Text>
          </VStack>
        </Box>
    </Fade>
  );
};

export default Login;
