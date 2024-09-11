// components/SearchBar.jsx
import React, { useState, useEffect } from "react";
import { Input, List, ListItem, Box, useColorModeValue, useToast } from "@chakra-ui/react";
import axios from "axios";
import { BASE_URL } from "../assets/BASE_URL";
import { useRecoilValue } from "recoil";
import { userState } from "../atoms/userAtom";

const SearchBar = ({ onSelectUser, hideSuggestions }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const inputBorderColor = useColorModeValue("light.borderInput", "dark.borderInput");
  const listBgColor = useColorModeValue("light.surface", "dark.surface");
  const listBorderColor = useColorModeValue("light.border", "dark.border");
  const listItemHoverBg = useColorModeValue("light.hover", "dark.hover");
  const toast = useToast();

  const loggedInUser = useRecoilValue(userState);

  useEffect(() => {
    const fetchSuggestions = async () => {

      if (typeof query !== "string") {
        toast({
          title: "Invalid input",
          description: "Search query must be a string.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      if (query.length > 254) {
        toast({
          title: "Query too long",
          description: "Search query must not exceed 254 characters.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      if (query.length > 2) {
        try {
          const response = await axios.get(`${BASE_URL}/api/user/search?query=${query}&userId=${loggedInUser.id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          // console.log("Suggestions:");
          setSuggestions(response.data);
        } catch (error) {
          // console.error("Error fetching suggestions:", error);
        }
      } else {
        setSuggestions([]);
      }
    };

    fetchSuggestions();
  }, [query]);

  const handleSelectUser = (user) => {
    onSelectUser(user);
    setQuery("");
    setSuggestions([]);
  }

  useEffect(() => {
    if (hideSuggestions) {
      setSuggestions([]);
    }
  }, [hideSuggestions]);

  return (
    <Box position="relative">
      <Input
        placeholder="Search by email"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        borderColor={inputBorderColor}
      />
      {suggestions.length > 0 && (
        <List
          spacing={3}
          mt={2}
          position="absolute"
          zIndex="1"
          bg={listBgColor}
          border="1px solid"
          borderColor={listBorderColor}
          borderRadius="md"
          width="100%" 
          maxHeight="200px"
          overflowY="auto"
        >
          {suggestions.map((user, index) => (
            <ListItem
              key={index}
              onClick={() => handleSelectUser(user)}
              cursor="pointer"
              _hover={{ bg: listItemHoverBg }}
              p={2}
            >
              {user.email}
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default SearchBar;