"use client";

import { generateSlug } from "shared/parsing";
import { useRouter } from "router";

import { FaHashtag } from "react-icons/fa6";
import { IconButton, Heading, Box, Divider } from "@chakra-ui/react";
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
        <>
            <Box
                paddingTop={firstRender ? 8 - anchorOffset : 32 - anchorOffset}
                marginTop={anchorOffset}
                id={id}
                display="flex"
                alignItems="center"
                marginBottom={2}
                {...props}
            >
                <Heading size="md" display="inline">
                    {text}{" "}
                    <IconButton
                        onMouseEnter={() => setHover(true)}
                        onMouseLeave={() => setHover(false)}
                        onClick={onClick}
                        icon={
                            <FaHashtag
                                color={hover ? "var(--chakra-colors-brand-300)" : "var(--chakra-colors-brand-200)"}
                                size="1.25em"
                                strokeWidth={2}
                            />
                        }
                        aria-label={`Link for ${text}`}
                        display="inline flex"
                        justifyContent="left"
                        minWidth="auto"
                        marginLeft={2}
                        backgroundColor="transparent"
                        _hover={{ backgroundColor: "transparent" }}
                        size="xs"
                        verticalAlign="top"
                    />
                </Heading>
            </Box>
            <Divider marginBottom={4} borderColor="brand.50" />
        </>
    );
}
