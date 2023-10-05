"use client";

import { FontClassName } from "chakra/theme/foundations/fonts";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

/**
 * Sets the font for the site.
 * @remarks See: https://chakra-ui.com/getting-started/nextjs-guide#chakra-ui-with-nextfont
 * */
export default function StyleJsxGlobal() {
    return (
        <style jsx global>
            {`
                :root {
                    ${FontClassName}: ${inter.style.fontFamily};
                }
            `}
        </style>
    );
}
