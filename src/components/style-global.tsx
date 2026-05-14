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
                        radial-gradient(ellipse 130% 80% at 15% 20%, rgba(232,212,218,0.58), transparent 55%),
                        radial-gradient(ellipse 90% 90% at 85% 76%, rgba(216,190,198,0.38), transparent 58%),
                        radial-gradient(ellipse 72% 58% at 54% 38%, rgba(215,222,211,0.18), transparent 52%),
                        #FBF5F1;
                    background-attachment: fixed;
                }
                .content-skeleton {
                    background:
                        linear-gradient(90deg, rgba(232,212,218,0.34), rgba(255,249,246,0.78), rgba(232,212,218,0.34)),
                        rgba(232,212,218,0.42);
                    background-size: 220% 100%;
                    box-shadow: inset 0 0 0 1px rgba(216,190,198,0.18);
                    animation: content-skeleton-shimmer 1.9s ease-in-out infinite;
                }
                @keyframes content-skeleton-shimmer {
                    0% {
                        background-position: 120% 0;
                    }
                    100% {
                        background-position: -120% 0;
                    }
                }
                @media (prefers-reduced-motion: reduce) {
                    .content-skeleton {
                        animation: none;
                    }
                }
            `}
        </style>
    );
}
