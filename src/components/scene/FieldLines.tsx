"use client";

import { useEffect, useRef } from "react";

const LINES = [
    { d: "M-40,320 C200,280 480,400 720,340 S1200,280 1500,360 1960,300", stroke: "#D8BEC6" },
    { d: "M-40,400 C180,370 500,470 760,400 S1180,340 1520,420 1960,380", stroke: "#E8D4DA" },
    { d: "M-40,480 C220,440 460,560 700,490 S1220,420 1540,490 1960,460", stroke: "#D7DED3" },
    { d: "M-40,560 C200,520 520,620 780,550 S1160,480 1480,560 1960,520", stroke: "#EADFC2" },
    { d: "M-40,640 C240,600 480,700 720,630 S1200,560 1520,640 1960,600", stroke: "#CFA8B5" },
    { d: "M-40,720 C200,680 500,780 760,710 S1180,640 1500,720 1960,680", stroke: "#D7DED3" },
    { d: "M-40,800 C220,760 460,860 700,790 S1220,720 1540,800 1960,760", stroke: "#D8BEC6" },
];

/** Fixed atmospheric SVG field lines that drift vertically. */
export function FieldLines() {
    const groupRef = useRef<SVGGElement>(null);
    const rafRef = useRef<number>();

    useEffect(() => {
        const tick = (now: number) => {
            const t = now * 0.001;
            const fy = Math.sin(t * 0.12) * 10;
            if (groupRef.current) {
                groupRef.current.setAttribute("transform", `translate(0,${fy})`);
            }
            rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
        return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    }, []);

    return (
        <svg
            aria-hidden="true"
            data-glass-ignore=""
            style={{
                position: "fixed",
                inset: 0,
                width: "100%",
                height: "100%",
                zIndex: 0,
                pointerEvents: "none",
            }}
            viewBox="0 0 1920 1080"
            preserveAspectRatio="none"
        >
            <g ref={groupRef} strokeWidth="0.7" fill="none" opacity="0.12">
                {LINES.map((l, i) => (
                    <path key={i} d={l.d} stroke={l.stroke} />
                ))}
            </g>
        </svg>
    );
}
