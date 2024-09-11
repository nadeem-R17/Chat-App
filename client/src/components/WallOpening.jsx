import React from "react";
import { Box, Button } from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

const WallOpening = () => {
  return (
    <Box width="100vw" height="100vh" position="relative" overflow="hidden">
      {/* Left Wall */}
      <MotionBox
        position="absolute"
        top="0"
        left="0"
        height="100vh"
        width="50vw"
        bg="linear-gradient(135deg, #ff7e5f, #feb47b)" 
        borderBottomRightRadius="50%"
        borderTopRightRadius="50%"
        boxShadow="0 0 20px rgba(0, 0, 0, 0.3)"
        initial={{ x: 0 }}
        animate={{ x: "-100vw" }}
        transition={{ duration: 5, ease: "easeInOut" }}
        zIndex={0}
      />

      {/* Right Wall */}
      <MotionBox
        position="absolute"
        top="0"
        right="0"
        height="100vh"
        width="50vw"
        bg="linear-gradient(135deg, #ff7e5f, #feb47b)" 
        borderBottomLeftRadius="50%"
        borderTopLeftRadius="50%"
        boxShadow="0 0 20px rgba(0, 0, 0, 0.3)"
        initial={{ x: 0 }}
        animate={{ x: "100vw" }}
        transition={{ duration: 5, ease: "easeInOut" }}
        zIndex={0}
          />
          
    </Box>
  );
};

export default WallOpening;
