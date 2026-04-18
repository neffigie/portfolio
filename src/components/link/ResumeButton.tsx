"use client";

import Link from "next/link";
import { Box, Flex } from "@chakra-ui/react";
import { MdOutlineDescription } from "react-icons/md";

export interface ResumeButtonProps {
    resumeUrl: string;
}

/** Outlined CTA resume link with file icon. */
export function ResumeButton({ resumeUrl }: ResumeButtonProps) {
    return (
        <Box
            as={Link}
            href={resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            display="inline-block"
            fontSize="10px"
            letterSpacing="0.12em"
            textTransform="uppercase"
            fontFamily="body"
            color="ink.primary"
            border="1px solid"
            borderColor="ink.primary"
            px={4}
            py="8px"
            borderRadius="lg"
            transition="all 0.15s ease"
            _hover={{ bg: "ink.primary", color: "surface.bright" }}
        >
            <Flex as="span" align="center" gap={2}>
                <MdOutlineDescription size={14} />
                Open Resume
            </Flex>
        </Box>
    );
}
