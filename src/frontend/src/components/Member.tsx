import {
  Heading,
  Avatar,
  Box,
  Center,
  Text,
  Stack,
  Button,
  Badge,
  useColorModeValue,
} from "@chakra-ui/react";
import { Principal } from "@dfinity/principal";
import { Link } from "react-router-dom";
import { Member } from "../../../declarations/backend/backend.did";
import { extractGithubUsername } from "../helpers/string";

interface MemberProps {
  principal: Principal;
  member: Member;
}

export default function Component({ principal, member }: MemberProps) {
  const bg = useColorModeValue("white", "gray.900");
  return (
    <Box
      maxW={"320px"}
      w={"full"}
      bg={bg}
      boxShadow={"2xl"}
      rounded={"lg"}
      p={6}
      textAlign={"center"}
    >
      <Avatar
        size={"xl"}
        src={
          "https://images.unsplash.com/photo-1520810627419-35e362c5dc07?ixlib=rb-1.2.1&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&ixid=eyJhcHBfaWQiOjE3Nzg0fQ"
        }
        mb={4}
        pos={"relative"}
        _after={{
          content: '""',
          w: 4,
          h: 4,
          bg: "green.300",
          border: "2px solid white",
          rounded: "full",
          pos: "absolute",
          bottom: 0,
          right: 3,
        }}
      />
      <Heading fontSize={"2xl"} fontFamily={"body"}>
        {member.name}
      </Heading>
      <Text fontWeight={600} color={"gray.500"} mb={4}>
        @{extractGithubUsername(member.github)}
      </Text>
      <Text
        textAlign={"center"}
        color={useColorModeValue("gray.700", "gray.400")}
        px={3}
      >
        {member.bio.substring(0, 50)}
        {member.bio.length > 50 ? "..." : ""}
      </Text>
      <Stack mt={8} direction={"row"} spacing={4}>
        <Button
          flex={1}
          fontSize={"sm"}
          rounded={"full"}
          _focus={{
            bg: "gray.200",
          }}
          as={Link}
          target={"_blank"}
          to={member.github}
        >
          Github
        </Button>
        <Button
          flex={1}
          fontSize={"sm"}
          rounded={"full"}
          bg={"blue.400"}
          color={"white"}
          boxShadow={
            "0px 1px 25px -5px rgb(66 153 225 / 48%), 0 10px 10px -5px rgb(66 153 225 / 43%)"
          }
          _hover={{
            bg: "blue.500",
          }}
          _focus={{
            bg: "blue.500",
          }}
          as={Link}
          to={`/members/${principal.toText()}`}
        >
          View
        </Button>
      </Stack>
    </Box>
  );
}
