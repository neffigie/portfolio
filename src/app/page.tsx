import "css/nprogress/nprogress.css";

import { ClientHeading, ClientText } from "components";
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
            <ClientHeading>Hi, 👋! I'm </ClientHeading>
            <ClientHeading
                bgGradient="linear(to-l, brand.700, brand.500)"
                bgClip="text"
                fontSize="6xl"
                fontWeight="extrabold"
            >
                Anna Noelle.
            </ClientHeading>
            <ClientText mt={4}>
                I'm a UVA Computer Science student and aspiring game developer. I'm passionate about creating exciting,
                accessible systems. When I'm not coding, I enjoy drawing and making music.
            </ClientText>
        </>
    );
}
