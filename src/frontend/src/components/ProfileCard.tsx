import {
  Badge,
  Button,
  Center,
  Flex,
  Heading,
  HStack,
  Image,
  Stack,
  Tag,
  Text,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { extractGithubUsername } from "../helpers/string";
import { getPlanColor } from "../helpers/auth";
import { Plan } from "../helpers/types";
import { Principal } from "@dfinity/principal";
import { FiCopy } from "react-icons/fi";

interface Props {
  name: string;
  bio: string;
  github: string;
  plan: Plan;
  principal: Principal;
}

export default function ProfileCard({
  name,
  bio,
  github,
  plan,
  principal,
}: Props) {
  const bg = useColorModeValue("white", "gray.900");
  const ptext = principal.toText();
  const address = principal.toHex();
  const toast = useToast();

  const copy = (label: string, text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast({
          title: `${label} copied`,
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      })
      .catch((err) => {
        toast({
          title: `Failed to copy ${label.toLowerCase()}`,
          status: "error",
          duration: 2000,
          isClosable: true,
        });
        console.error(`Failed to copy ${label.toLowerCase()}: `, err);
      });
  };

  const copyAddress = () => {
    copy("Address", address)
  };

  const copyPrincipal = () => {
    copy("Principal", ptext)
  };

  return (
    <Center py={6}>
      <Stack
        borderWidth="1px"
        borderRadius="lg"
        w={{ sm: "100%", md: "740px" }}
        direction={{ base: "column", md: "row" }}
        bg={bg}
        boxShadow={"2xl"}
        padding={4}
        pos={"relative"}
        align={"center"}
      >
        <Tag
          size={"sm"}
          pos={"absolute"}
          variant="solid"
          colorScheme={getPlanColor(plan)}
          top={0}
          right={0}
          mt={2}
          mr={2}
        >
          {plan}
        </Tag>
        <Flex
          bg="blue.200"
          height={"300px"}
          overflow={"hidden"}
          rounded={"md"}
          minW={"300px"}
        >
          <Image
            objectFit="cover"
            boxSize="100%"
            src={
              "https://images.unsplash.com/photo-1520810627419-35e362c5dc07?ixlib=rb-1.2.1&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&ixid=eyJhcHBfaWQiOjE3Nzg0fQ"
            }
            alt="#"
          />
        </Flex>
        <Stack
          flex={1}
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          p={1}
          pt={2}
        >
          <Heading fontSize={"2xl"} fontFamily={"body"}>
            {name}
          </Heading>
          <Text fontWeight={600} color={"gray.500"} size="sm" mb={4}>
            @{extractGithubUsername(github)}
          </Text>
          <Stack gap={0} textAlign={'center'}>
            <Text fontWeight={600} color={"gray.500"} fontSize={'14px'}>
              Principal: {ptext.slice(0, 20)}...
            </Text>
            <Text fontWeight={600} color={"gray.500"} fontSize={'14px'}>
              Address: {address.slice(0, 20)}...
            </Text>
          </Stack>
          <Text
            textAlign={"center"}
            // eslint-disable-next-line react-hooks/rules-of-hooks
            color={useColorModeValue("gray.700", "gray.400")}
            px={3}
          >
            {bio}
          </Text>

          <HStack
            width={"100%"}
            mt={"1rem"}
            padding={2}
            justifyContent={"space-between"}
            alignItems={"center"}
            wrap={'wrap'}
          >
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
              as={"a"}
              target={"_blank"}
              href={github}
              maxW={"200px"}
              mx={"auto"}
              minW={'200px'}
            >
              Github
            </Button>
          </HStack>

          <HStack
            width={"100%"}
            justifyContent={"center"}
            alignItems={"center"}
            wrap={'wrap'}
          >
            <Button
              flex={1}
              fontSize={"sm"}
              rounded={"full"}
              minW={"150px"}
              maxW={'150px'}
              mx={"auto"}
              variant={'outline'}
              leftIcon={<FiCopy />}
              onClick={copyAddress}
            >
              Address
            </Button>
            <Button
              flex={1}
              fontSize={"sm"}
              rounded={"full"}
              minW={"150px"}
              maxW={'150px'}
              mx={"auto"}
              variant={'outline'}
              leftIcon={<FiCopy />}
              onClick={copyPrincipal}
            >
              Principal
            </Button>
          </HStack>
        </Stack>
      </Stack>
    </Center>
  );
}
