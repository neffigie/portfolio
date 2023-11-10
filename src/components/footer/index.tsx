"use client";

import { Center, Divider, Stack, Text } from "@chakra-ui/react";
import { IconButtonLink, ResumeButton } from "components/link";
import { environment } from "environment";
import { GrLinkedin, GrGithub } from "react-icons/gr";
import { HiOutlineMail } from "react-icons/hi";
import { FaItchIo } from "react-icons/fa6";

export function Footer() {
    const iconProps = { size: "lg", fontSize: "18px", display: "contents" };
    return (
        <Center as="footer" mt={50} pb={46} flexDirection="column">
            <Stack direction="column" spacing={4}>
                <Divider mb={2} borderColor="brand.100" />
                <Text textAlign="center">Made by Anna Noelle</Text>
                <Stack direction="row" justify="center" align="center" spacing={6}>
                    <IconButtonLink
                        href={`mailto:${environment.NEXT_PUBLIC_EMAIL}`}
                        icon={<HiOutlineMail />}
                        aria-label="Email"
                        {...iconProps}
                    />
                    <IconButtonLink
                        href={environment.NEXT_PUBLIC_LINKEDIN_URL}
                        icon={<GrLinkedin />}
                        aria-label="LinkedIn"
                        {...iconProps}
                    />
                    <IconButtonLink
                        href={environment.NEXT_PUBLIC_GITHUB_URL}
                        icon={<GrGithub />}
                        aria-label="GitHub"
                        {...iconProps}
                    />
                    <IconButtonLink
                        href={environment.NEXT_PUBLIC_ITCH_URL}
                        icon={<FaItchIo />}
                        aria-label="Itch.io"
                        {...iconProps}
                    />
                </Stack>
                <ResumeButton />
            </Stack>
        </Center>
    );
}
