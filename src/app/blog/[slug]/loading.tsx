"use client";
import { Spinner, Stack, Text } from "@chakra-ui/react";

export default function Loading() {
    return (
        <Stack direction="row">
            <Text>Loading the post.... Please wait</Text>
            <Spinner />
        </Stack>
    );
}
