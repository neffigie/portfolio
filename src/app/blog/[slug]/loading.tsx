"use client";

import { Spinner, Stack, Text } from "@chakra-ui/react";
import { Center } from "components";

export default function Loading() {
    return (
        <Center>
            <Stack direction="row">
                <Text>Loading... Please wait</Text>
                <Spinner color="teal" />
            </Stack>
        </Center>
    );
}
