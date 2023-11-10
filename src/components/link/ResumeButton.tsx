"use client";

import Link from "next/link";
import { Flex, Button } from "@chakra-ui/react";
import { HiDocument } from "react-icons/hi2";
import { getResumeURL } from "config";

/** Button to open resume. */
export function ResumeButton() {
    return (
        <Link href={getResumeURL()} passHref target="_blank">
            <Flex justify="center" align="center">
                <Button
                    variant="outline"
                    colorScheme="brand"
                    leftIcon={<HiDocument color="var(--chakra-colors-brand-500)" />}
                >
                    Open Resume
                </Button>
            </Flex>
        </Link>
    );
}
