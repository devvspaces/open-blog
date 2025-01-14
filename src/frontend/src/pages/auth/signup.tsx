import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Button,
  Heading,
  Text,
  useColorModeValue,
  Textarea,
  useToast,
  FormErrorMessage,
} from "@chakra-ui/react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { backend } from "../../../../declarations/backend";
import { createBackendActor, createClient, getIdentityProvider } from "../../helpers/auth";
import { Member } from "../../../../declarations/backend/backend.did";
import { LOGIN, useAuth } from "../../lib/AuthContext";

let actor = backend;

export default function Page() {
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const { dispatch } = useAuth();

  const formik = useFormik({
    initialValues: {
      name: "",
      github: "",
      bio: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required().min(3),
      github: Yup.string().required().url(),
      bio: Yup.string().required().min(10),
    }),
    onSubmit: async (values, { setFieldError }) => {
      try {
        setIsLoading(true);

        // Authenticate the user to get the identity
        const authClient = await createClient();
        await new Promise((resolve) => {
          authClient.login({
            identityProvider: getIdentityProvider(),
            onSuccess: () => resolve(null),
          });
        });
        const identity = authClient.getIdentity();
        actor = await createBackendActor(identity);

        // Register the user
        const response = (await actor.register(
          values.name,
          values.github,
          values.bio
        )) as any;
        setIsLoading(false);
        if (response.ok !== undefined) {
          toast({
            title: "Success.",
            description: "Your account has been created successfully.",
            status: "success",
            duration: 3000,
            position: "top",
          });
          const response = (await actor.getMemberProfile(
            identity.getPrincipal()
          ));
          const member = (response.ok as Member) ?? null;
          dispatch({
            type: LOGIN,
            payload: {
              principal: identity.getPrincipal(),
              member,
            },
          });
          navigate("/");
        } else {
          toast({
            title: "An error occurred.",
            description: response.err,
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "top",
          });
        }
      } catch (e: unknown) {
        console.error(e);
        setIsLoading(false);
        toast({
          title: "An error occurred.",
          description: "An error occurred while trying to create your account.",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
      }
    },
  });

  return (
    <Flex align={"center"} justify={"center"}>
      <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
        <Stack align={"center"}>
          <Heading fontSize={"4xl"} textAlign={"center"}>
            Sign up
          </Heading>
          <Text fontSize={"lg"} color={"gray.600"}>
            to enjoy all of our cool features ✌️
          </Text>
        </Stack>
        <Box
          rounded={"lg"}
          bg={useColorModeValue("white", "gray.700")}
          boxShadow={"lg"}
          p={8}
        >
          <form onSubmit={formik.handleSubmit}>
            <Stack spacing={4} w={"400px"}>
              <FormControl
                id="name"
                isRequired
                isInvalid={!!formik.errors.name && formik.touched.name}
              >
                <FormLabel>Name</FormLabel>
                <Input
                  type="text"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <FormErrorMessage>{formik.errors.name}</FormErrorMessage>
              </FormControl>
              <FormControl
                id="github"
                isRequired
                isInvalid={!!formik.errors.github && formik.touched.github}
              >
                <FormLabel>Github</FormLabel>
                <Input
                  type="url"
                  value={formik.values.github}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <FormErrorMessage>{formik.errors.github}</FormErrorMessage>
              </FormControl>
              <FormControl
                id="bio"
                isRequired
                isInvalid={!!formik.errors.bio && formik.touched.bio}
              >
                <FormLabel>Bio</FormLabel>
                <Textarea
                  rows={4}
                  value={formik.values.bio}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <FormErrorMessage>{formik.errors.bio}</FormErrorMessage>
              </FormControl>
              <Stack spacing={10} pt={2}>
                <Button
                  isLoading={isLoading}
                  loadingText="Submitting"
                  size="lg"
                  bg={"blue.400"}
                  color={"white"}
                  _hover={{
                    bg: "blue.500",
                  }}
                  type="submit"
                >
                  Sign up
                </Button>
              </Stack>
              <Stack pt={6}>
                <Text align={"center"}>
                  Already a user?{" "}
                  <Link to={"/"} color={"blue.400"}>
                    Login
                  </Link>
                </Text>
              </Stack>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Flex>
  );
}
