import {
  Box,
  Flex,
  Heading,
  Spacer,
  HStack,
  Button,
  useToast,
  CircularProgress,
  Center,
} from "@chakra-ui/react";
import { useAuth } from "../lib/AuthContext";
import { Link } from "react-router-dom";
import { getPlan } from "../helpers/auth";
import ProfileCard from "../components/ProfileCard";
import PostCard from "../components/PostCard";
import { FaPlus } from "react-icons/fa";
import withAuth from "../lib/withAuth";
import { backend } from "../../../declarations/backend";
import { Post } from "../../../declarations/backend/backend.did";
import { useEffect, useState } from "react";
import { getPostStatus } from "../helpers/post";

function ProfilePage() {
  const { state } = useAuth();

  const user = state.user!!;
  const member = user.member;

  const toast = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  useEffect(() => {
    async function fetchPosts() {
      if (!state.user?.principal) return;
      setIsLoading(true);
      const posts = (await backend.getMemberPosts(
        state.user?.principal
      )) as {
        ok: Post[];
        err: string;
      };
      setIsLoading(false);
      if (posts.err) {
        toast({
          title: "Error loading posts",
          status: "error",
          isClosable: true,
          duration: 5000,
        });
      } else {
        setPosts(posts.ok);
      }
    }
    fetchPosts();
  }, []);

  return (
    <Box>
      <ProfileCard
        name={member.name}
        bio={member.bio}
        github={member.github}
        principal={user.principal}
        plan={getPlan(member)!!}
      />

      <Spacer mb={6} />

      <HStack justify="space-between" mb={4}>
        <Heading size="lg">My Posts</Heading>
        <Button
          colorScheme="blue"
          leftIcon={<FaPlus />}
          as={Link}
          to={"/new/post"}
        >
          New Post
        </Button>
      </HStack>

      {isLoading && <CircularProgress isIndeterminate color="blue.300" />}
      {posts.length === 0 && !isLoading && (
        <Center>
          <Box>No posts found</Box>
        </Center>
      )}

      <Flex wrap={"wrap"} align={"center"} gap={6}>
        {posts.map((post) => (
          <PostCard
            key={post.id}
            id={post.id.toString()}
            owner={post.author}
            author={{
              name: member.name,
            }}
            date={post.createdAt.toString()}
            title={post.title}
            description={post.content}
            status={getPostStatus(post)}
          />
        ))}
      </Flex>
    </Box>
  );
}

const Page = withAuth(ProfilePage);

export default Page;
