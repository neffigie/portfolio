"use client";

import { generateSlug } from "shared/parsing";
import { useRouter } from "router";

import { FaHashtag } from "react-icons/fa";
import { Stack, Flex, IconButton, Box, Heading, Wrap, WrapItem } from "@chakra-ui/react";
import { useEffect, useState } from "react";

export interface HeadingLinkProps {
    /** The element that is converted into a header slug. See {@link generateSlug} */
    slugSource: Node | ParentNode | ChildNode | string;

    /** The text used for the header link text. */
    text: React.ReactNode;

    /** Any other arbitrary props. */
    [key: PropertyKey]: any;
}

/** The amount of `HeadingLink` instances. */
let instancesCount = 0;

/** A heading that can link to itself using anchors. */
export function HeadingLink({ slugSource, text, ...props }: HeadingLinkProps) {
    const [hover, setHover] = useState(false);
    const [firstRender, setFirstRender] = useState(false);
    useEffect(() => {
        setFirstRender(instancesCount === 0);
        instancesCount++;
        return () => {
            instancesCount--;
        };
    }, []);

    const id = generateSlug(slugSource);
    const router = useRouter();
    const onClick = () => id && router.push(`#${id}`);
    const anchorOffset = -100;

    return (
        <Box
            paddingTop={firstRender ? 8 - anchorOffset : 32 - anchorOffset}
            marginTop={anchorOffset}
            marginBottom={4}
            id={id}
            {...props}
        >
            <Wrap direction="row">
                <WrapItem>
                    <Flex alignItems="center">
                        <IconButton
                            onMouseEnter={() => setHover(true)}
                            onMouseLeave={() => setHover(false)}
                            onClick={onClick}
                            icon={<FaHashtag color={hover ? "black" : "gray"} />}
                            aria-label={`Link for ${text}`}
                            display="contents"
                            size="xl"
                        />
                    </Flex>
                </WrapItem>
                <WrapItem>
                    <Heading size="lg">{text}</Heading>
                </WrapItem>
            </Wrap>
        </Box>
    );
}
