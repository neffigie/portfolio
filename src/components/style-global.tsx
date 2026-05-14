"use client";

import { CormorantClassName, ManropeClassName, SpaceMonoClassName } from "theme/fonts";
import { Cormorant_Garamond, Manrope, Space_Mono } from "next/font/google";

const cormorant = Cormorant_Garamond({
    subsets: ["latin"],
    style: ["normal", "italic"],
    weight: ["300", "400", "500"],
    display: "swap",
});

const manrope = Manrope({
    subsets: ["latin"],
    display: "swap",
});

const spaceMono = Space_Mono({
    subsets: ["latin"],
    weight: ["400", "700"],
    display: "swap",
});

const paperTexture = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='t'%3E%3CfeTurbulence baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.78 0 0 0 0 0.72 0 0 0 0 0.66 0 0 0 0.08 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23t)'/%3E%3C/svg%3E")`;

export default function StyleGlobal() {
    return (
        <style jsx global>
            {`
                :root {
                    ${CormorantClassName}: ${cormorant.style.fontFamily};
                    ${ManropeClassName}:   ${manrope.style.fontFamily};
                    ${SpaceMonoClassName}: ${spaceMono.style.fontFamily};
                }
                body {
                    background:
                        ${paperTexture},
                        radial-gradient(ellipse 130% 80% at 15% 20%, rgba(232,196,200,0.45), transparent 55%),
                        radial-gradient(ellipse 100% 100% at 85% 75%, rgba(184,212,232,0.40), transparent 55%),
                        radial-gradient(ellipse 80% 60% at 50% 40%, rgba(188,216,204,0.25), transparent 50%),
                        #faf5ee;
                    background-attachment: fixed;
                }
            `}
        </style>
    );
}
