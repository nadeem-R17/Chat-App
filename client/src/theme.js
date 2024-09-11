// ./theme.js
import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  fonts: {
    heading: "Montserrat,Roboto, Open Sans, sans-serif",
    body: "Open Sans, sans-serif",
  },
  colors: {
    light: {
      primary: "#8BC34A",
      secondary: "#4CAF50",
      background: "#075E",
      surface: "#CFCFCF",
      text: "#333333",
      border: "#CCCCCC",
      borderInput: "#000000",
      buttonBackground: "#888888",
      error: "#FFC107",
      hover: '#CCCCCC',
    },

    dark: {
      primary: "#63B3ED",
      secondary: "#2B6CB0",
      background: "#003135",
      buttonBackground: "#003135",
      surface: "#294950",
      text: "#E2E8F0",
      border: "#4A5568",
      borderInput: "#FFFFFF",
      error: "#F56565",
      hover: '#4A5568',
    },
  },
  config: {
    initialColorMode: "dark",
    useSystemColorMode: false,
  },
});

export default theme;
