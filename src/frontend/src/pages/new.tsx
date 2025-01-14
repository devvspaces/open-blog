import {
  Box,
  Heading,
  HStack,
  Button,
  useColorMode,
  FormControl,
  FormLabel,
  Input,
  Select,
  useToast,
  FormErrorMessage,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
  Member,
  Post,
} from "../../../declarations/backend/backend.did";
import { FaSave } from "react-icons/fa";
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { useFormik } from "formik";
import * as Yup from "yup";
import { createBackendActor, createClient } from "../helpers/auth";
import withAuth from "../lib/withAuth";
import { useAuth } from "../lib/AuthContext";
import { useNavigate } from "react-router-dom";
import { PostStatus } from "../helpers/types";

function NewPost() {
  const { colorMode } = useColorMode();
  const [value, setValue] = useState("**Hello world!!!**");
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const { state } = useAuth();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      title: "",
      content: "",
      status: "Published",
    },
    validationSchema: Yup.object({
      title: Yup.string().required().min(10),
      content: Yup.string().required().min(100),
      status: Yup.string().required().oneOf([
        PostStatus.Draft.toString(),
        PostStatus.Published.toString(),
        PostStatus.Archived.toString(),
      ]),
    }),
    onSubmit: async (values, { setFieldError }) => {
      try {
        setIsLoading(true);
        const authClient = await createClient();
        const identity = authClient.getIdentity();
        const actor = await createBackendActor(identity);
        const response = (await actor.createPost(
          values.title,
          values.content,
          { [values.status]: null }
        )) as { ok: Post; err: string };
        setIsLoading(false);
        if (response.ok !== undefined) {
          toast({
            title: "Success.",
            description: "New post created successfully.",
            status: "success",
            duration: 3000,
            position: "top",
          });
          navigate(
            `/account`
          );
          // navigate(
          //   `/posts/${state.user?.principal.toText()}/${response.ok.id}`
          // );
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
          description: "An error occurred while trying to create post",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
      }
    },
  });

  useEffect(() => {
    formik.setFieldValue("content", value);
  }, [value])

  return (
    <Box>
      <form onSubmit={formik.handleSubmit}>
        <HStack justify="space-between" mb={4}>
          <Heading size="lg">Create new post</Heading>
          <Button
            colorScheme="blue"
            leftIcon={<FaSave />}
            type="submit"
            isLoading={isLoading}
          >
            Save
          </Button>
        </HStack>

        <HStack mb={6}>
          <FormControl
            id="title"
            isRequired
            isInvalid={!!formik.errors.title && formik.touched.title}
          >
            <FormLabel>Title</FormLabel>
            <Input
              type="text"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            <FormErrorMessage>{formik.errors.title}</FormErrorMessage>
          </FormControl>
          <FormControl
            id="title"
            isRequired
            isInvalid={!!formik.errors.status && formik.touched.status}
          >
            <FormLabel>Status</FormLabel>
            <Select
              value={formik.values.status}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              name="status"
            >
              <option value={PostStatus.Draft.toString()}>Draft</option>
              <option value={PostStatus.Published.toString()}>Published</option>
              <option value={PostStatus.Archived.toString()}>Archived</option>
            </Select>
            <FormErrorMessage>{formik.errors.status}</FormErrorMessage>
          </FormControl>
        </HStack>

        <FormControl
          id="content"
          isRequired
          isInvalid={!!formik.errors.content && formik.touched.content}
        >
          <FormLabel>Content</FormLabel>
          <div data-color-mode={colorMode}>
            <MDEditor
              height={"calc(100vh - 300px)"}
              value={value}
              id="content"
              onChange={(value, e) => {
                setValue(value || "");
              }}
              textareaProps={{
                id: "content",
                name: "content",
              }}
              onBlur={formik.handleBlur}
            />
          </div>
          <FormErrorMessage>{formik.errors.content}</FormErrorMessage>
        </FormControl>
      </form>
    </Box>
  );
}

const Page = withAuth(NewPost);

export default Page;
