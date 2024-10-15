"use client";

import { Center, Divider, Stack, Text } from "@chakra-ui/react";
import { IconButtonLink, ResumeButton } from "components/link";
import { GrLinkedin, GrGithub } from "react-icons/gr";
import { HiOutlineMail } from "react-icons/hi";
import { FaItchIo } from "react-icons/fa6";

export interface FooterProps {
    email: string;
    linkedInUrl: string;
    githubUrl: string;
    itchUrl: string;
    resumeUrl: string;
}

export function Footer({ email, linkedInUrl, githubUrl, itchUrl, resumeUrl }: FooterProps) {
    const iconProps = { size: "lg", fontSize: "18px", display: "contents" };
    return (
        <Center as="footer" mt={50} pb={46} flexDirection="column">
            <Stack direction="column" spacing={4}>
                <Divider mb={2} borderColor="brand.100" />
                <Text textAlign="center">Made by Anna Noelle</Text>
                <Stack direction="row" justify="center" align="center" spacing={6}>
                    <IconButtonLink
                        href={`mailto:${email}`}
                        icon={<HiOutlineMail />}
                        aria-label="Email"
                        {...iconProps}
                    />
                    <IconButtonLink href={linkedInUrl} icon={<GrLinkedin />} aria-label="LinkedIn" {...iconProps} />
                    <IconButtonLink href={githubUrl} icon={<GrGithub />} aria-label="GitHub" {...iconProps} />
                    <IconButtonLink href={itchUrl} icon={<FaItchIo />} aria-label="Itch.io" {...iconProps} />
                </Stack>
                <ResumeButton resumeUrl={resumeUrl} />
            </Stack>
        </Center>
    );
}
