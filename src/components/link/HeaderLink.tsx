"use client";

import { generateSlug } from "shared/parsing";
import { Text } from "components";
import { useRouter } from "router";

import { FiLink2 } from "react-icons/fi";
import { Stack, Flex, IconButton } from "@chakra-ui/react";
import { useState } from "react";

export interface HeaderLinkProps {
    /** The element that is used for the header slug. See {@link generateSlug} */
    slugSource: Node | ParentNode | ChildNode | string;

    /** The text used for the header link text. */
    text: React.ReactNode;

    /** Any other arbitrary props. */
    [key: PropertyKey]: any;
}

export function HeaderLink({ slugSource, text, ...props }: HeaderLinkProps) {
    const [hover, setHover] = useState(false);
    const onMouseEnter = () => setHover(true);
    const onMouseLeave = () => setHover(false);
    const id = generateSlug(slugSource);
    const router = useRouter();
    const onClick = () => id && router.push(`#${id}`);
    return (
        <Text as="div" fontSize="2xl" fontWeight="bold" marginTop="12" marginBottom="4" id={id} {...props}>
            <Stack direction="row" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
                <Text>{text}</Text>
                <Flex alignItems="center">
                    {hover && <IconButton onClick={onClick} icon={<FiLink2 />} aria-label={`Link for ${text}`} display="contents" />}
                </Flex>
            </Stack>
        </Text>
    );
}
