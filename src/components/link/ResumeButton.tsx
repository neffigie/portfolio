"use client";

import Link from "next/link";
import { Flex, Button } from "@chakra-ui/react";
import { GrDocumentText } from "react-icons/gr";
import { getResumeURL } from "config";

/** Button to open resume. */
export function ResumeButton() {
    return (
        <Link href={getResumeURL()} passHref target="_blank">
            <Flex justify="center" align="center">
                <Button variant="outline" leftIcon={<GrDocumentText />}>
                    Open Resume
                </Button>
            </Flex>
        </Link>
    );
}
