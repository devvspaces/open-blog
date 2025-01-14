import { Box, Center, Flex, Heading, Text } from "@chakra-ui/react";
import { LoaderFunctionArgs, useLoaderData } from "react-router-dom";
import { backend } from "../../../../declarations/backend";
import { createBackendActor, createClient } from "../../helpers/auth";
import { Principal } from "@dfinity/principal";
import { Member } from "../../../../declarations/backend/backend.did";
import MemberCard from "../../components/Member";

let actor = backend;

export async function membersLoader({ request }: LoaderFunctionArgs) {
  const client = await createClient();
  const identity = client.getIdentity();
  actor = await createBackendActor(identity);
  let members = await actor.getMembers();
  return {
    members,
  };
}

export default function Page() {
  const { members } = useLoaderData() as {
    members: [Principal, Member][];
  };
  return (
    <Box>
      {members.length === 0 && (
        <Center>
          <Box>No members found</Box>
        </Center>
      )}
      <Flex wrap={"wrap"} alignItems={'stretch'} gap={6}>
        {members.map(([principal, member]) => (
          <MemberCard
            key={principal.toText()}
            principal={principal}
            member={member}
          />
        ))}
      </Flex>
    </Box>
  );
}
