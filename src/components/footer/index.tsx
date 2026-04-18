"use client";

import { Box, Flex, Text } from "@chakra-ui/react";
import { MainContainer } from "components/main-container";
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
    return (
        <Box as="footer" bg="surface.containerLow" borderTop="1px solid" borderColor="surface.containerHighest" py={10}>
            <MainContainer>
                <Flex
                    direction={{ base: "column", md: "row" }}
                    alignItems={{ base: "flex-start", md: "center" }}
                    gap={6}
                >
                    {/* Wordmark */}
                    <Text
                        fontFamily="heading"
                        fontStyle="italic"
                        fontSize="lg"
                        color="ink.primary"
                        letterSpacing="-0.01em"
                        flexShrink={0}
                    >
                        {environment.NEXT_PUBLIC_METADATA_AUTHOR.replace(/['"]+/g, "")}
                    </Text>

                    {/* Social icons + resume CTA */}
                    <Flex direction="row" align="center" gap={2} ml={{ base: 0, md: "auto" }} flexWrap="wrap">
                        <IconButtonLink
                            href={`mailto:${email}`}
                            aria-label="Email"
                            icon={<MdOutlineEmail size={16} />}
                            variant="ghost"
                            size="sm"
                            color="ink.muted"
                            _hover={{ color: "ink.primary", bg: "surface.containerHighest" }}
                            borderRadius="md"
                        />
                        <IconButtonLink
                            href={linkedInUrl}
                            aria-label="LinkedIn"
                            icon={<FaLinkedin size={15} />}
                            variant="ghost"
                            size="sm"
                            color="ink.muted"
                            _hover={{ color: "ink.primary", bg: "surface.containerHighest" }}
                            borderRadius="md"
                        />
                        <IconButtonLink
                            href={githubUrl}
                            aria-label="GitHub"
                            icon={<FaGithub size={15} />}
                            variant="ghost"
                            size="sm"
                            color="ink.muted"
                            _hover={{ color: "ink.primary", bg: "surface.containerHighest" }}
                            borderRadius="md"
                        />
                        <IconButtonLink
                            href={itchUrl}
                            aria-label="Itch.io"
                            icon={<FaItchIo size={15} />}
                            variant="ghost"
                            size="sm"
                            color="ink.muted"
                            _hover={{ color: "ink.primary", bg: "surface.containerHighest" }}
                            borderRadius="md"
                        />

                        {resumeUrl && (
                            <>
                                <Box w="1px" h="20px" bg="surface.containerHighest" mx={2} flexShrink={0} />
                                <ResumeButton resumeUrl={resumeUrl} />
                            </>
                        )}
                    </Flex>
                </Flex>

                {/* Copyright */}
                <Text fontSize="xs" color="ink.faint" mt={6} letterSpacing="0.04em">
                    © {new Date().getFullYear()} neffigie. All rights reserved.
                </Text>
            </MainContainer>
        </Box>
    );
}
