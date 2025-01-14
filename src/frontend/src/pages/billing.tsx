import {
  Box,
  Stack,
  HStack,
  Heading,
  Text,
  VStack,
  useColorModeValue,
  List,
  ListItem,
  ListIcon,
  Button,
  Center,
  CircularProgress,
  useToast,
} from "@chakra-ui/react";
import { FaCheckCircle } from "react-icons/fa";
import withAuth from "../lib/withAuth";
import { LOGIN, useAuth } from "../lib/AuthContext";
import { createBackendActor, createClient, getPlan } from "../helpers/auth";
import { Plan } from "../helpers/types";
import {
  decodeIcrcAccount,
  IcrcLedgerCanister,
  IcrcMetadataResponseEntries,
  IcrcTokenMetadataResponse,
} from "@dfinity/ledger-icrc";
import { createLedgerCanister } from "../helpers/ledger";
import { useEffect, useState } from "react";
import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE } from "../../../declarations/backend/backend.did";

interface Props {
  children: React.ReactNode;
}

function PriceWrapper(props: Props) {
  const { children } = props;

  return (
    <Box
      mb={4}
      shadow="base"
      borderWidth="1px"
      alignSelf={{ base: "center", lg: "flex-start" }}
      borderColor={useColorModeValue("gray.200", "gray.500")}
      borderRadius={"xl"}
    >
      {children}
    </Box>
  );
}

function Page() {
  const { state, dispatch } = useAuth();
  const [ledger, setLedger] = useState<IcrcLedgerCanister | null>(null);
  const [actor, setActor] = useState<ActorSubclass<_SERVICE> | null>(null);
  const [metadata, setMetadata] = useState<IcrcTokenMetadataResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);

  const plan = getPlan(state.user?.member!!)!!;

  const isFree = plan === Plan.Free;
  const isElite = plan === Plan.Elite;
  const isLegendary = plan === Plan.Legendary;

  const bg = useColorModeValue("gray.50", "gray.700");
  const mostP = useColorModeValue("red.300", "red.700");
  const mostPC = useColorModeValue("gray.900", "gray.300");
  const boxBg = useColorModeValue("gray.50", "gray.700");

  useEffect(() => {
    async function setupLedger() {
      const ledger = await createLedgerCanister();
      const metadata = await ledger.metadata({});
      setLedger(ledger);
      setMetadata(metadata);

      const tokens = await ledger.balance({
        owner: state.user?.principal!!,
      });
      setBalance(Number(tokens));
    }
    async function setupActor() {
      const client = await createClient();
      const identity = client.getIdentity();
      setActor(await createBackendActor(identity));
    }
    setupActor();
    setupLedger();
  }, []);

  function getTokenSymbol() {
    if (!metadata) return "-";
    for (const value of metadata) {
      if (value[0] === IcrcMetadataResponseEntries.SYMBOL) {
        return (value[1] as any).Text;
      }
    }
    return "nil";
  }

  function getTokenDecimals() {
    if (!metadata) throw new Error("No metadata");
    for (const value of metadata) {
      if (value[0] === IcrcMetadataResponseEntries.DECIMALS) {
        return parseInt((value[1] as any).Nat);
      }
    }
    throw new Error("No decimals");
  }

  const toast = useToast();

  const prices = {
    [Plan.Free]: 0,
    [Plan.Elite]: 10,
    [Plan.Legendary]: 20,
  };

  async function getSubAccount(): Promise<string> {
    if (!actor) throw new Error("No actor");
    const response = await actor.get_account_address();
    console.log("Account Address", response);
    return response;
  }

  async function transferToSubAccount(plan: Plan) {
    if (!ledger) return;
    if (!actor) throw new Error("No actor");
    const toIcrcAccount = decodeIcrcAccount(await getSubAccount());
    console.log(
      "BALANCE",
      await ledger.balance({
        owner: state.user?.principal!!,
      })
    );
    try {
      setIsLoading(true);
      const transfer_result = await ledger.transfer({
        to: {
          owner: toIcrcAccount.owner,
          subaccount: toIcrcAccount.subaccount
            ? [toIcrcAccount.subaccount]
            : [],
        },
        amount: BigInt(prices[plan] * Math.pow(10, getTokenDecimals())),
      });
      setIsLoading(false);

      // Make payment
      const response = await actor.transferFromSubAccountToMain(
        plan === Plan.Elite
          ? { Elite: null }
          : plan === Plan.Free
          ? { Free: null }
          : { Legendary: null }
      );
      console.log("::PAYMENT::", response);
      if (response.ok) {
        toast({
          title: "Payment successful",
          status: "success",
          position: "top",
          duration: 5000,
          isClosable: true,
        });
        dispatch({
          type: LOGIN,
          payload: {
            principal: state.user?.principal,
            member: {
              ...state.user?.member,
              plan: { [plan]: null },
            },
          },
        });
      } else {
        toast({
          title: "Error making payment",
          status: "error",
          position: "top",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (e) {
      setIsLoading(false);
      toast({
        title: `Error making payment: ${e.errorType}`,
        status: "error",
        position: "top",
        duration: 5000,
        isClosable: true,
      });
    }
  }

  return (
    <Box py={12}>
      <VStack spacing={2} textAlign="center">
        <Heading as="h1" fontSize="4xl">
          Plans that fit your need
        </Heading>
        <Text fontSize="lg" color={"gray.500"}>
          No credit card needed, just pay with any ICRC-1 token.
        </Text>
      </VStack>
      {ledger && metadata ? (
        <>
          <Box my={'1rem'}>
            <Heading size={'sm'}>Balance:</Heading>{" "}
            <Text>{balance !== null ? balance : "Loading..."}</Text>
          </Box>

          <Stack
            direction={{ base: "column", md: "row" }}
            textAlign="center"
            justify="center"
            spacing={{ base: 4, lg: 10 }}
            py={10}
          >
            <PriceWrapper>
              <Box py={4} px={12}>
                <Text fontWeight="500" fontSize="2xl">
                  Free
                </Text>
                <HStack justifyContent="center">
                  <Text fontSize="3xl" fontWeight="600">
                    {getTokenSymbol()}
                  </Text>
                  <Text fontSize="5xl" fontWeight="900">
                    0
                  </Text>
                </HStack>
              </Box>
              <VStack bg={bg} py={4} borderBottomRadius={"xl"}>
                <List spacing={3} textAlign="start" px={12}>
                  <ListItem>
                    <ListIcon as={FaCheckCircle} color="green.500" />
                    Can create 5 posts
                  </ListItem>
                  <ListItem>
                    <ListIcon as={FaCheckCircle} color="green.500" />
                    Can read posts
                  </ListItem>
                  <ListItem>
                    <ListIcon as={FaCheckCircle} color="green.500" />
                    Can use markdown editor
                  </ListItem>
                </List>
                <Box w="80%" pt={7}>
                  <Button
                    w="full"
                    colorScheme="blue"
                    variant="outline"
                    isDisabled={isFree || isElite || isLegendary}
                  >
                    {isFree ? "Current Plan" : "-"}
                  </Button>
                </Box>
              </VStack>
            </PriceWrapper>

            <PriceWrapper>
              <Box position="relative">
                <Box
                  position="absolute"
                  top="-16px"
                  left="50%"
                  style={{ transform: "translate(-50%)" }}
                >
                  <Text
                    textTransform="uppercase"
                    bg={mostP}
                    px={3}
                    py={1}
                    color={mostPC}
                    fontSize="sm"
                    fontWeight="600"
                    rounded="xl"
                  >
                    Most Popular
                  </Text>
                </Box>
                <Box py={4} px={12}>
                  <Text fontWeight="500" fontSize="2xl">
                    Elite
                  </Text>
                  <HStack justifyContent="center">
                    <Text fontSize="3xl" fontWeight="600">
                      {getTokenSymbol()}
                    </Text>
                    <Text fontSize="5xl" fontWeight="900">
                      10
                    </Text>
                  </HStack>
                </Box>
                <VStack bg={boxBg} py={4} borderBottomRadius={"xl"}>
                  <List spacing={3} textAlign="start" px={12}>
                    <ListItem>
                      <ListIcon as={FaCheckCircle} color="green.500" />
                      Can create 50 posts
                    </ListItem>
                    <ListItem>
                      <ListIcon as={FaCheckCircle} color="green.500" />
                      Can read posts
                    </ListItem>
                    <ListItem>
                      <ListIcon as={FaCheckCircle} color="green.500" />
                      Can use markdown editor
                    </ListItem>
                  </List>
                  <Box w="80%" pt={7}>
                    <Button
                      w="full"
                      colorScheme="blue"
                      isDisabled={isElite || isLegendary}
                      onClick={async () => {
                        await transferToSubAccount(Plan.Elite);
                      }}
                      isLoading={isLoading}
                    >
                      {isElite ? "Current Plan" : isLegendary ? "-" : "Upgrade"}
                    </Button>
                  </Box>
                </VStack>
              </Box>
            </PriceWrapper>
            <PriceWrapper>
              <Box py={4} px={12}>
                <Text fontWeight="500" fontSize="2xl">
                  Legendary
                </Text>
                <HStack justifyContent="center">
                  <Text fontSize="3xl" fontWeight="600">
                    {getTokenSymbol()}
                  </Text>
                  <Text fontSize="5xl" fontWeight="900">
                    20
                  </Text>
                </HStack>
              </Box>
              <VStack bg={boxBg} py={4} borderBottomRadius={"xl"}>
                <List spacing={3} textAlign="start" px={12}>
                  <ListItem>
                    <ListIcon as={FaCheckCircle} color="green.500" />
                    Can create unlimited posts
                  </ListItem>
                  <ListItem>
                    <ListIcon as={FaCheckCircle} color="green.500" />
                    Can read posts
                  </ListItem>
                  <ListItem>
                    <ListIcon as={FaCheckCircle} color="green.500" />
                    Can use markdown editor
                  </ListItem>
                </List>
                <Box w="80%" pt={7}>
                  <Button
                    w="full"
                    colorScheme="blue"
                    variant="outline"
                    isDisabled={isLegendary}
                    onClick={async () => {
                      await transferToSubAccount(Plan.Legendary);
                    }}
                    isLoading={isLoading}
                  >
                    {isLegendary ? "Current Plan" : "Upgrade"}
                  </Button>
                </Box>
              </VStack>
            </PriceWrapper>
          </Stack>
        </>
      ) : (
        <>
          <Center>
            <CircularProgress isIndeterminate color="blue.300" />
          </Center>
        </>
      )}
    </Box>
  );
}

const Billing = withAuth(Page);

export default Billing;
