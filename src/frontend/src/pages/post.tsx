import {
  Box,
  Heading,
  HStack,
  useColorMode,
  Text,
  Avatar,
  Stack,
  Badge,
} from "@chakra-ui/react";
import {
  Member,
  Post,
} from "../../../declarations/backend/backend.did";
import { getPlan } from "../helpers/auth";
import { LoaderFunctionArgs, useLoaderData } from "react-router-dom";
import { backend } from "../../../declarations/backend";
import { Principal } from "@dfinity/principal";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { nano2mill } from "../helpers/string";
import moment from "moment";

const actor = backend;

export async function postLoader({ params }: LoaderFunctionArgs) {
  const owner = Principal.fromText(params.owner as string);
  const member = (await actor.getMemberProfile(owner)) as { ok: Member };
  if (!member.ok) {
    throw new Response("Member Not Found", { status: 404 });
  }
  const response = (await actor.getPost(
    BigInt(params.id as string),
    owner
  )) as { ok: Post };
  if (!response.ok) {
    throw new Response("Post Not Found", { status: 404 });
  }
  return {
    post: response.ok,
    member: member.ok,
  };
}

function Page() {
  const { colorMode } = useColorMode();
  const { post, member } = useLoaderData() as {
    post: Post;
    member: Member;
  };
  return (
    <Box>
      <HStack justify="space-between" mb={4}>
        <Heading size="lg">{post.title}</Heading>
      </HStack>

      <Stack
        mt={3}
        direction={"row"}
        spacing={4}
        align={"center"}
      >
        <Avatar src={"https://avatars0.githubusercontent.com/u/1164541?v=4"} />
        <Stack direction={"column"} spacing={0} fontSize={"md"}>
          <Text fontWeight={600}>
            {member.name}{" "}
            <Badge ml={3} size={"sm"} colorScheme={"green"}>
              {getPlan(member)}
            </Badge>
          </Text>
          <Text fontSize={".8rem"} fontWeight={300}>
            {member.github}
          </Text>
          <Text fontSize={".8rem"} color={"gray.500"}>
            {moment(nano2mill(post.createdAt.toString())).fromNow()}
          </Text>
        </Stack>
      </Stack>

      <Box rounded={'md'} p={3} bg={colorMode === "light" ? "gray.200" : "gray.700"} mt={4}>
        <div data-color-mode={colorMode}>
          <Markdown className={"markdown"} remarkPlugins={[remarkGfm]}>
            {post.content}
          </Markdown>
        </div>
      </Box>
    </Box>
  );
}

export default Page;
