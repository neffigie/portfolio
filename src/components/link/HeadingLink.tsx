"use client";

import { generateSlug } from "shared/parsing";
import { useRouter } from "router";

import { FaHashtag } from "react-icons/fa";
import { Stack, Flex, IconButton, Box, Heading } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { IconContext } from "react-icons/lib";

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

/** A heading that can link to itself. */
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
            <Stack direction="row">
                <Flex alignItems="center">
                    <IconButton
                        onMouseEnter={() => setHover(true)}
                        onMouseLeave={() => setHover(false)}
                        onClick={onClick}
                        icon={
                            <IconContext.Provider value={{ color: hover ? "black" : "grey" }}>
                                <>
                                    <FaHashtag />
                                </>
                            </IconContext.Provider>
                        }
                        aria-label={`Link for ${text}`}
                        display="contents"
                        size="xl"
                    />
                </Flex>
                <Heading size="lg">{text}</Heading>
            </Stack>
        </Box>
    );
}
