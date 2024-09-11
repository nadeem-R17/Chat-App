import React, { useState } from "react";
import { Box, IconButton, Text, useColorMode } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import WallOpening from "../components/WallOpening";
import Signup from "../components/Signup";
import Login from "../components/Login";
import { FaMoon, FaSun } from "react-icons/fa";

const MotionBox = motion(Box);

const WelcomeScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { colorMode, toggleColorMode } = useColorMode();

  const textVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1, ease: "easeOut", delay: 2 },
    },
  };

  const transitionVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 1, ease: "easeOut", delay: 0.5 },
    },
  };

  return (
    <Box
      position="relative"
      width="100vw"
      height="100vh"
      bg="transparent"
      overflow="hidden"
    >
      <Box
        position="absolute"
        top="0"
        left="0"
        width="100%"
        height="100%"
        zIndex={1} 
      >
        <WallOpening />
      </Box>

      <Box
        position="relative"
        width="100%"
        height="100%"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        zIndex={2}
      >
        <MotionBox
          initial="hidden"
          animate="visible"
          variants={textVariants}
          position="absolute"
          top="20%"
          zIndex={2} 
        >
          <Text fontSize="4xl" fontWeight="bold">
            Welcome to Chat App
          </Text>
        </MotionBox>

        <IconButton
          icon={colorMode === "light" ?<FaSun />: <FaMoon />}
          position="absolute"
          top="5%"
          right="5%"
          aria-label="Toggle Theme"
          onClick={() => {
            toggleColorMode();
          }}
        />
          
        <AnimatePresence>
          <MotionBox
            key={isLogin ? "login" : "signup"}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={transitionVariants}
            position="absolute"
            top="30%" 
            width="100%"
            maxWidth="400px" 
            display="flex"
            justifyContent="center"
            zIndex={2} 
          >
            <Box width="100%" p={4}>
              {isLogin ? <Login setIsLogin={setIsLogin } /> : <Signup setIsLogin={setIsLogin} />}
            </Box>
          </MotionBox>
        </AnimatePresence>
      </Box>
    </Box>
  );
};

export default WelcomeScreen;


