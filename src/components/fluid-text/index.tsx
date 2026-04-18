"use client";

import { Fragment, useEffect, useRef } from "react";

interface FluidTextProps {
    children: string;
    /** Apply ink.primary → brand.500 left-to-right gradient across all characters. */
    gradient?: boolean;
    maxPush?: number;
    radius?: number;
}

/**
 * Splits text into individual character spans repelled away from the cursor
 * (X + Y) based on proximity, creating a ripple/parting wave effect.
 *
 * When `gradient` is true, each character gets its own correctly-offset slice
 * of the full gradient so they appear as one continuous gradient across the
 * whole word. Gradient is on the same element as the text so transforms don't
 * break background-clip (the stacking-context issue only occurs with
 * background-clip on a PARENT of transformed children).
 */
export function FluidText({ children, gradient = false, maxPush = 10, radius = 150 }: FluidTextProps) {
    const containerRef = useRef<HTMLSpanElement>(null);
    const charsRef = useRef<(HTMLSpanElement | null)[]>([]);
    const rafRef = useRef<number>();
    const targetsX = useRef<number[]>([]);
    const targetsY = useRef<number[]>([]);
    const currentX = useRef<number[]>([]);
    const currentY = useRef<number[]>([]);

    const charCount = children.replace(/ /g, "").length;
    const words = children.split(" ");

    useEffect(() => {
        targetsX.current = new Array(charCount).fill(0);
        targetsY.current = new Array(charCount).fill(0);
        currentX.current = new Array(charCount).fill(0);
        currentY.current = new Array(charCount).fill(0);

        // Interpolate color per character across the gradient range.
        // Avoids background-clip entirely — italic glyphs extend beyond their
        // content box, so background-clip always clips the descenders/ascenders.
        // Direct color interpolation has no clipping issues whatsoever.
        // ink.primary = #111c1b, brand.500 = #2a6c5c
        if (gradient) {
            const applyGradient = () => {
                const container = containerRef.current;
                if (!container) return;
                const containerRect = container.getBoundingClientRect();
                if (containerRect.width === 0) {
                    requestAnimationFrame(applyGradient);
                    return;
                }
                const [sR, sG, sB] = [17, 28, 27];   // #111c1b
                const [eR, eG, eB] = [42, 108, 92];  // #2a6c5c
                for (let i = 0; i < charCount; i++) {
                    const el = charsRef.current[i];
                    if (!el) continue;
                    const charRect = el.getBoundingClientRect();
                    const t = Math.max(0, Math.min(1,
                        (charRect.left + charRect.width / 2 - containerRect.left) / containerRect.width
                    ));
                    el.style.color = `rgb(${Math.round(sR + t * (eR - sR))},${Math.round(sG + t * (eG - sG))},${Math.round(sB + t * (eB - sB))})`;
                }
            };
            requestAnimationFrame(applyGradient);
        }

        const loop = () => {
            for (let i = 0; i < charCount; i++) {
                currentX.current[i] += (targetsX.current[i] - currentX.current[i]) * 0.05;
                currentY.current[i] += (targetsY.current[i] - currentY.current[i]) * 0.05;
                const el = charsRef.current[i];
                if (el) el.style.transform = `translate(${currentX.current[i]}px, ${currentY.current[i]}px)`;
            }
            rafRef.current = requestAnimationFrame(loop);
        };

        rafRef.current = requestAnimationFrame(loop);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [charCount, gradient]);

    const handleMouseMove = (e: React.MouseEvent<HTMLSpanElement>) => {
        for (let i = 0; i < charCount; i++) {
            const el = charsRef.current[i];
            if (!el) continue;
            const rect = el.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = cx - e.clientX;
            const dy = cy - e.clientY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < radius && dist > 0) {
                const sigma = radius / 1.5;
                const strength = maxPush * Math.exp(-(dist * dist) / (2 * sigma * sigma));
                targetsX.current[i] = (dx / dist) * strength;
                targetsY.current[i] = (dy / dist) * strength;
            } else {
                targetsX.current[i] = 0;
                targetsY.current[i] = 0;
            }
        }
    };

    const handleMouseLeave = () => {
        targetsX.current.fill(0);
        targetsY.current.fill(0);
    };

    let ci = 0;
    return (
        <span
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ display: "inline" }}
        >
            {words.map((word, wi) => (
                <Fragment key={wi}>
                    <span style={{ display: "inline-block", whiteSpace: "nowrap" }}>
                        {word.split("").map((char) => {
                            const idx = ci++;
                            return (
                                <span
                                    key={idx}
                                    ref={(el) => { charsRef.current[idx] = el; }}
                                    style={{ display: "inline-block" }}
                                >
                                    {char}
                                </span>
                            );
                        })}
                    </span>
                    {wi < words.length - 1 && " "}
                </Fragment>
            ))}
        </span>
    );
}
