import React from "react";
import { Box, Text, Button, useColorMode } from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionBox = motion.create(Box);
const MotionText = motion.create(Text);

const OpeningChatWindow = () => {
  const zoomAnimation = {
    scale: [1, 1.1, 1],
    transition: {
      duration: 2,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "loop",
      delay: 2,
    },
  };

  const textVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1, ease: "easeOut", delay: 0.3 },
    },
  };

  const subTextVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1, ease: "easeOut", delay: 0.6 },
    },
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      bg="transparent"
    >
      <MotionBox initial="hidden" animate="visible" variants={textVariants}>
        <MotionText fontSize="4xl" fontWeight="bold" animate={zoomAnimation}>
          Welcome to Chat App
        </MotionText>
      </MotionBox>

      <MotionBox initial="hidden" animate="visible" variants={subTextVariants} mt={4}>
        <MotionText fontSize="xl" mt={4}>
          Select a contact or group to start chatting
        </MotionText>
      </MotionBox>
    </Box>
  );
};

export default OpeningChatWindow;
