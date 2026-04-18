"use client";

import { NewsreaderClassName, ManropeClassName } from "chakra/theme/foundations/fonts";
import { Newsreader, Manrope } from "next/font/google";

const newsreader = Newsreader({
    subsets: ["latin"],
    style: ["normal", "italic"],
    display: "swap",
});

const manrope = Manrope({
    subsets: ["latin"],
    display: "swap",
});

/**
 * Sets the display (Newsreader) and UI (Manrope) fonts for the site.
 * @remarks See: https://chakra-ui.com/getting-started/nextjs-guide#chakra-ui-with-nextfont
 */
export default function StyleJsxGlobal() {
    return (
        <style jsx global>
            {`
                :root {
                    ${NewsreaderClassName}: ${newsreader.style.fontFamily};
                    ${ManropeClassName}: ${manrope.style.fontFamily};
                }
            `}
        </style>
    );
}
