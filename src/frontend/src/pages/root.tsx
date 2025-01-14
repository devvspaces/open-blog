import {
  IconButton,
  Avatar,
  Box,
  CloseButton,
  Flex,
  HStack,
  VStack,
  Icon,
  useColorModeValue,
  Text,
  Drawer,
  DrawerContent,
  useDisclosure,
  BoxProps,
  FlexProps,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Button,
  useColorMode,
  useToast,
  Stack,
} from "@chakra-ui/react";
import {
  FiHome,
  FiTrendingUp,
  FiCompass,
  FiSettings,
  FiMenu,
  FiChevronDown,
} from "react-icons/fi";
import { IconType } from "react-icons";
import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import {
  backend,
} from "../../../declarations/backend";
import { LOGIN, LOGOUT, useAuth } from "../lib/AuthContext";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import {
  createBackendActor,
  createClient,
  getIdentityProvider,
  getPlan,
} from "../helpers/auth";
import { Member } from "../../../declarations/backend/backend.did";

let actor = backend;

interface LinkItemProps {
  name: string;
  icon: IconType;
  link: string;
}

interface NavItemProps extends FlexProps {
  icon: IconType;
  link: string;
  children: React.ReactNode;
}

interface MobileProps extends FlexProps {
  onOpen: () => void;
  login: () => void;
}

interface SidebarProps extends BoxProps {
  onClose: () => void;
}

const LinkItems: Array<LinkItemProps> = [
  { name: "Home", icon: FiHome, link: "/" },
  { name: "Members", icon: FiTrendingUp, link: "/members" },
  { name: "Profile", icon: FiCompass, link: "/account" },
  { name: "Settings", icon: FiSettings, link: "/settings" },
];

const SidebarContent = ({ onClose, ...rest }: SidebarProps) => {
  const [info, setInfo] = useState<{
    name: string;
    manifesto: string;
  } | null>(null);

  useEffect(() => {
    async function fetchInfo() {
      const name = await backend.getName();
      const manifesto = await backend.getManifesto();
      setInfo({ name, manifesto });
    }
    fetchInfo();
  }, []);

  return (
    <Box
      transition="3s ease"
      bg={useColorModeValue("white", "gray.900")}
      borderRight="1px"
      borderRightColor={useColorModeValue("gray.200", "gray.700")}
      w={{ base: "full", md: 60 }}
      pos="fixed"
      h="full"
      {...rest}
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Text fontSize="2xl" fontWeight="900">
          {info?.name}
        </Text>
        <CloseButton display={{ base: "flex", md: "none" }} onClick={onClose} />
      </Flex>
      <Stack>
        {LinkItems.map((link) => (
          <NavItem key={link.name} icon={link.icon} link={link.link}>
            {link.name}
          </NavItem>
        ))}
      </Stack>
    </Box>
  );
};

const NavItem = ({ icon, link, children, ...rest }: NavItemProps) => {
  const location = useLocation();
  const isActive =
    link === "/"
      ? location?.pathname === link
      : location?.pathname.includes(link);
  return (
    <Link to={link}>
      <Box style={{ textDecoration: "none" }} _focus={{ boxShadow: "none" }}>
        <Flex
          align="center"
          p="4"
          mx="4"
          borderRadius="lg"
          role="group"
          cursor="pointer"
          transition=".3s ease"
          _hover={{
            bg: "blue.400",
            color: "white",
          }}
          bg={isActive ? "blue.400" : undefined}
          color={isActive ? "white" : undefined}
          {...rest}
        >
          {icon && (
            <Icon
              mr="4"
              fontSize="16"
              _groupHover={{
                color: "white",
              }}
              as={icon}
            />
          )}
          {children}
        </Flex>
      </Box>
    </Link>
  );
};

const MobileNav = ({ onOpen, login, ...rest }: MobileProps) => {
  const { state, dispatch } = useAuth();
  const { colorMode, toggleColorMode } = useColorMode();
  const navigate = useNavigate();

  const menuBg = useColorModeValue("white", "gray.900");
  const menuBc = useColorModeValue("gray.200", "gray.700");

  const toast = useToast();

  async function logout() {
    dispatch({
      type: LOGOUT,
    });
    const authClient = await createClient();
    authClient.logout();
    toast({
      title: "You have been logged out",
      status: "success",
      duration: 5000,
      isClosable: true,
    });
    navigate("/");
  }

  return (
    <Flex
      ml={{ base: 0, md: 60 }}
      px={{ base: 4, md: 4 }}
      height="20"
      alignItems="center"
      bg={useColorModeValue("white", "gray.900")}
      borderBottomWidth="1px"
      borderBottomColor={useColorModeValue("gray.200", "gray.700")}
      justifyContent={{ base: "space-between", md: "flex-end" }}
      {...rest}
    >
      <IconButton
        display={{ base: "flex", md: "none" }}
        onClick={onOpen}
        variant="outline"
        aria-label="open menu"
        icon={<FiMenu />}
      />

      <Text
        display={{ base: "flex", md: "none" }}
        fontSize="2xl"
        fontFamily="monospace"
        fontWeight="bold"
      >
        Logo
      </Text>

      <HStack spacing={{ base: "0", md: "6" }}>
        <IconButton
          size="lg"
          variant="ghost"
          aria-label="open menu"
          onClick={toggleColorMode}
          icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
        />
        {state.isAuthenticated && state.user?.member ? (
          <>
            <Flex alignItems={"center"}>
              <Menu>
                <MenuButton
                  py={2}
                  transition="all 0.3s"
                  _focus={{ boxShadow: "none" }}
                >
                  <HStack>
                    <Avatar
                      size={"sm"}
                      src={
                        "https://images.unsplash.com/photo-1619946794135-5bc917a27793?ixlib=rb-0.3.5&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&s=b616b2c5b373a80ffc9636ba24f7a4a9"
                      }
                    />
                    <VStack
                      display={{ base: "none", md: "flex" }}
                      alignItems="flex-start"
                      spacing="1px"
                      ml="2"
                    >
                      <Text fontSize="sm">{state.user?.member?.name}</Text>
                      <Text fontSize="xs" color="gray.600">
                        {getPlan(state.user?.member!!)}
                      </Text>
                    </VStack>
                    <Box display={{ base: "none", md: "flex" }}>
                      <FiChevronDown />
                    </Box>
                  </HStack>
                </MenuButton>
                <MenuList bg={menuBg} borderColor={menuBc}>
                  <MenuItem
                    onClick={() => {
                      navigate("/account");
                    }}
                  >
                    Profile
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      navigate("/settings");
                    }}
                  >
                    Settings
                  </MenuItem>
                  <MenuDivider />
                  <MenuItem onClick={logout}>Sign out</MenuItem>
                </MenuList>
              </Menu>
            </Flex>
          </>
        ) : (
          <>
            <Button colorScheme="blue" as={Link} to={"/signup"}>
              Sign up
            </Button>
            <Button colorScheme="gray" onClick={login}>
              Login
            </Button>
          </>
        )}
      </HStack>
    </Flex>
  );
};

const Layout = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const navigation = useNavigate();

  const toast = useToast();

  const { dispatch } = useAuth();

  /**
   * Using the Internet Identity to authenticate the user
   * Checks if authenticated user is already registered
   */
  async function login() {
    const authClient = await createClient();
    await new Promise((resolve) => {
      authClient.login({
        identityProvider: getIdentityProvider(),
        onSuccess: () => resolve(null),
      });
    });
    const identity = authClient.getIdentity();
    actor = await createBackendActor(identity);
    // Check if member exists
    const member = await actor.getMemberProfile(identity.getPrincipal());
    if (member.err) {
      toast({
        title: "You don't have an account, kindly sign up",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      authClient.logout();
      dispatch({
        type: LOGOUT,
      });
      navigation("/signup");
    } else {
      toast({
        title: "Login successful",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      dispatch({
        type: LOGIN,
        payload: {
          principal: identity.getPrincipal(),
          member: member.ok as Member,
        },
      });
      navigation("/");
    }
  }

  /**
   * Check if user is authenticated else logout
   */
  useEffect(() => {
    async function checkAuthenticated() {
      const authClient = await createClient();
      if (await authClient.isAuthenticated()) {
        const identity = authClient.getIdentity();
        actor = await createBackendActor(identity);
        const response = await actor.getMemberProfile(identity.getPrincipal());
        const member = (response.ok as Member) ?? null;
        if (!member) {
          authClient.logout();
          dispatch({
            type: LOGOUT,
          });
        } else {
          dispatch({
            type: LOGIN,
            payload: {
              principal: identity.getPrincipal(),
              member,
            },
          });
        }
      }
    }
    checkAuthenticated();
  }, [dispatch]);

  return (
    <Box minH="100vh" bg={useColorModeValue("gray.100", "gray.900")}>
      <SidebarContent
        onClose={() => onClose}
        display={{ base: "none", md: "block" }}
      />
      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full"
      >
        <DrawerContent>
          <SidebarContent onClose={onClose} />
        </DrawerContent>
      </Drawer>
      {/* mobilenav */}
      <MobileNav onOpen={onOpen} login={login} />
      <Box ml={{ base: 0, md: 60 }} p="4">
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
