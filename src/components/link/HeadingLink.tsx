"use client";

import { generateSlug } from "shared/parsing";
import { useRouter } from "router";

import { FiLink2 } from "react-icons/fi";
import { Stack, Flex, IconButton, Box, Heading } from "@chakra-ui/react";
import { useState } from "react";

export interface HeadingLinkProps {
    /** The element that is converted into a header slug. See {@link generateSlug} */
    slugSource: Node | ParentNode | ChildNode | string;

    /** The text used for the header link text. */
    text: React.ReactNode;

    /** Any other arbitrary props. */
    [key: PropertyKey]: any;
}

/** A heading that can link to itself. */
export function HeadingLink({ slugSource, text, ...props }: HeadingLinkProps) {
    const [hover, setHover] = useState(false);
    const onMouseEnter = () => setHover(true);
    const onMouseLeave = () => setHover(false);
    const id = generateSlug(slugSource);
    const router = useRouter();
    const onClick = () => id && router.push(`#${id}`);
    return (
        <Box marginTop="12" marginBottom="4" id={id} {...props}>
            <Stack direction="row" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
                <Heading size="lg">{text}</Heading>
                <Flex alignItems="center">
                    {hover && (
                        <IconButton
                            onClick={onClick}
                            icon={<FiLink2 />}
                            aria-label={`Link for ${text}`}
                            display="contents"
                        />
                    )}
                </Flex>
            </Stack>
        </Box>
    );
}
