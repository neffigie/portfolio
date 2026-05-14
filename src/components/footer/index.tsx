"use client";

import { Box, Flex, Text } from "@chakra-ui/react";
import { IconButtonLink } from "components/link";
import { ResumeButton } from "components/link/ResumeButton";
import { MdOutlineEmail } from "react-icons/md";
import { FaLinkedin, FaGithub, FaItchIo } from "react-icons/fa";
import { environment } from "../../environment";

export interface FooterProps {
    email: string;
    linkedInUrl: string;
    githubUrl: string;
    itchUrl: string;
    resumeUrl: string;
}

export function Footer({ email, linkedInUrl, githubUrl, itchUrl, resumeUrl }: FooterProps) {
    const author = environment.NEXT_PUBLIC_METADATA_AUTHOR.replace(/['"]+/g, "");

    return (
        <Box as="footer" bg="surface.muted" position="relative" zIndex={10}>
            <Flex px={{ base: 6, md: 10 }} py={2} alignItems="center" gap={4} wrap="wrap">
                <Text
                    fontFamily="heading"
                    fontStyle="italic"
                    fontWeight="400"
                    fontSize="16px"
                    color="ink.primary"
                    letterSpacing="-0.01em"
                    flexShrink={0}
                    lineHeight="1"
                >
                    {author}
                    <Box as="span" color="accent.primary">
                        .
                    </Box>
                </Text>

                <Flex direction="row" align="center" gap={1} ml="auto">
                    <IconButtonLink
                        href={`mailto:${email}`}
                        aria-label="Email"
                        icon={<MdOutlineEmail size={14} />}
                        variant="ghost"
                        size="md"
                        color="ink.faint"
                        _hover={{ color: "ink.primary", bg: "rgba(232,212,218,0.38)" }}
                        borderRadius="md"
                    />
                    <IconButtonLink
                        href={linkedInUrl}
                        aria-label="LinkedIn"
                        icon={<FaLinkedin size={13} />}
                        variant="ghost"
                        size="md"
                        color="ink.faint"
                        _hover={{ color: "ink.primary", bg: "rgba(232,212,218,0.38)" }}
                        borderRadius="md"
                    />
                    <IconButtonLink
                        href={githubUrl}
                        aria-label="GitHub"
                        icon={<FaGithub size={13} />}
                        variant="ghost"
                        size="md"
                        color="ink.faint"
                        _hover={{ color: "ink.primary", bg: "rgba(232,212,218,0.38)" }}
                        borderRadius="md"
                    />
                    <IconButtonLink
                        href={itchUrl}
                        aria-label="Itch.io"
                        icon={<FaItchIo size={13} />}
                        variant="ghost"
                        size="md"
                        color="ink.faint"
                        _hover={{ color: "ink.primary", bg: "rgba(232,212,218,0.38)" }}
                        borderRadius="md"
                    />
                </Flex>

                <Box w="1px" h="16px" bg="surface.border" flexShrink={0} />

                {resumeUrl && <ResumeButton resumeUrl={resumeUrl} />}

                <Text fontSize="10px" color="ink.faint" letterSpacing="0.04em" flexShrink={0}>
                    © {new Date().getFullYear()} neffigie
                </Text>
            </Flex>
        </Box>
    );
}
