import {
  Box,
  Center,
  Heading,
  Text,
  Stack,
  Avatar,
  useColorModeValue,
  Image,
  Tag,
} from "@chakra-ui/react";
import { PostStatus } from "../helpers/types";
import moment from "moment";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { nano2mill } from "../helpers/string";
import { Link } from "react-router-dom";
import { Principal } from "@dfinity/principal";

interface Props {
  id: string;
  owner: Principal;
  title: string;
  description: string;
  date: string;
  author: {
    name: string;
  };
  status?: PostStatus;
}

export default function PostCard({
  id,
  owner,
  title,
  description,
  date,
  author,
  status,
}: Props) {
  const bg = useColorModeValue("white", "gray.900");
  const headingColor = useColorModeValue("gray.700", "white");
  return (
    <Center>
      <Link to={`/posts/${owner.toText()}/${id}`}>
        <Box
          maxW={"445px"}
          w={"full"}
          bg={bg}
          boxShadow={"2xl"}
          rounded={"md"}
          overflow={"hidden"}
          pos={"relative"}
        >
          {status && (
            <Tag
              size={"sm"}
              pos={"absolute"}
              variant="solid"
              colorScheme={"blue"}
              top={0}
              right={0}
              mt={2}
              mr={2}
              zIndex={2}
            >
              {status}
            </Tag>
          )}

          <Box h={"210px"} bg={"gray.100"} pos={"relative"}>
            <Image
              src={
                "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
              }
              alt="Example"
              h={"100%"}
              w={"100%"}
              objectFit={"cover"}
            />
          </Box>
          <Stack px={6} pt={6}>
            <Heading color={headingColor} fontSize={"2xl"} fontFamily={"body"}>
              {title}
            </Heading>
            <Text color={"gray.500"}>
              <Text className={'markdown'}>
                {description.substring(0, 100) + "..."}
              </Text>
            </Text>
          </Stack>
          <Stack
            px={6}
            pb={6}
            mt={6}
            direction={"row"}
            spacing={4}
            align={"center"}
          >
            <Avatar
              src={"https://avatars0.githubusercontent.com/u/1164541?v=4"}
            />
            <Stack direction={"column"} spacing={0} fontSize={"sm"}>
              <Text fontWeight={600}>{author.name}</Text>
              <Text color={"gray.500"}>
                {moment(nano2mill(date)).fromNow()}
              </Text>
            </Stack>
          </Stack>
        </Box>
      </Link>
    </Center>
  );
}
