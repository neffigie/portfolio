import "css/nprogress/nprogress.css";

import { Heading, Text } from "components";
import { generatePageMetadata } from "config";

export function generateMetadata() {
    return generatePageMetadata({
        publishedTime: "2023",
        type: "website",
        locale: "en_US",
    });
}

export default function HomePage() {
    return (
        <>
            <Heading>Hi, 👋! I'm </Heading>
            <Heading bgGradient="linear(to-l, teal.500, cyan.500)" bgClip="text" fontSize="6xl" fontWeight="extrabold">
                Anna Noelle.
            </Heading>
            <Text mt={4}>
                I'm a UVA Computer Science student and aspiring game developer. I'm passionate about creating exciting,
                accessible systems. When I'm not coding, I enjoy drawing and making music.
            </Text>
        </>
    );
}
