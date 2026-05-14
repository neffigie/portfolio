"use client";

import { forwardRef, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, HTMLAttributes, MutableRefObject, ReactNode, Ref } from "react";
import { usePathname } from "next/navigation";

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    /** "standard" for most UI elements, "accent" for gradient-tinted CTAs. */
    variant?: "standard" | "accent";
    profile?: "rounded" | "bar";
    cornerRadius?: number;
    padding?: string;
    blurAmount?: number;
    saturation?: number;
    displacementScale?: number;
    aberrationIntensity?: number;
    /**
     * For bar profile: thickness (px) of the refractive edge zone.
     * Displacement is strongest at the panel's active edge and fades to zero
     * over this distance into the center. Default 22.
     */
    edgeThickness?: number;
}

interface DisplacementMap {
    height: number;
    url: string;
    width: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const smootherStep = (value: number) => value * value * value * (value * (value * 6 - 15) + 10);

function roundedRectSdf(x: number, y: number, width: number, height: number, radius: number) {
    const qx = Math.abs(x) - (width / 2 - radius);
    const qy = Math.abs(y) - (height / 2 - radius);
    const outsideX = Math.max(qx, 0);
    const outsideY = Math.max(qy, 0);
    return Math.hypot(outsideX, outsideY) + Math.min(Math.max(qx, qy), 0) - radius;
}

function roundedRectNormal(x: number, y: number, width: number, height: number, radius: number) {
    const delta = 0.5;
    const dx =
        roundedRectSdf(x + delta, y, width, height, radius) -
        roundedRectSdf(x - delta, y, width, height, radius);
    const dy =
        roundedRectSdf(x, y + delta, width, height, radius) -
        roundedRectSdf(x, y - delta, width, height, radius);
    const length = Math.hypot(dx, dy) || 1;
    return { x: dx / length, y: dy / length };
}

function createDisplacementMap(width: number, height: number, radius: number): DisplacementMap | null {
    const mapWidth = Math.round(width);
    const mapHeight = Math.round(height);

    if (mapWidth <= 0 || mapHeight <= 0) {
        return null;
    }

    const canvas = document.createElement("canvas");
    canvas.width = mapWidth;
    canvas.height = mapHeight;

    const context = canvas.getContext("2d");
    if (!context) {
        return null;
    }

    const image = context.createImageData(mapWidth, mapHeight);
    const safeRadius = clamp(radius, 0, Math.min(mapWidth, mapHeight) / 2);
    const bezelWidth = clamp(Math.min(mapWidth, mapHeight) * 0.36, 10, 30);

    for (let y = 0; y < mapHeight; y++) {
        for (let x = 0; x < mapWidth; x++) {
            const centeredX = x + 0.5 - mapWidth / 2;
            const centeredY = y + 0.5 - mapHeight / 2;
            const signedDistance = roundedRectSdf(centeredX, centeredY, mapWidth, mapHeight, safeRadius);
            const distanceInside = -signedDistance;
            const offset = (y * mapWidth + x) * 4;

            if (distanceInside < 0 || distanceInside > bezelWidth) {
                image.data[offset] = 128;
                image.data[offset + 1] = 128;
                image.data[offset + 2] = 128;
                image.data[offset + 3] = 255;
                continue;
            }

            const normal = roundedRectNormal(centeredX, centeredY, mapWidth, mapHeight, safeRadius);
            const edgeProgress = clamp(distanceInside / bezelWidth, 0, 1);
            const magnitude = 1 - smootherStep(edgeProgress);

            image.data[offset] = 128 - normal.x * magnitude * 127;
            image.data[offset + 1] = 128 - normal.y * magnitude * 127;
            image.data[offset + 2] = 128;
            image.data[offset + 3] = 255;
        }
    }

    context.putImageData(image, 0, 0);
    return { height: mapHeight, url: canvas.toDataURL("image/png"), width: mapWidth };
}

/**
 * Generates an edge weight mask for the bar profile.
 * The mask is white (weight=1) at the active bottom edge and fades to black (0) inward.
 * feComposite arithmetic uses this to concentrate turbulence displacement at the rim only.
 *
 * Canvas height = headerHeight + 2*edgeExpansion so the mask covers the full displacement
 * canvas including the OOB-sampling margin above and below the visible header.
 */
function createBarEdgeMask(
    width: number,
    canvasHeight: number, // rect.height + 2 * edgeExpansion
    edgeExpansion: number,
    edgeThickness: number,
): DisplacementMap | null {
    const mapWidth = Math.round(width);
    const mapHeight = Math.round(canvasHeight);
    if (mapWidth <= 0 || mapHeight <= 0) return null;

    const canvas = document.createElement("canvas");
    canvas.width = mapWidth;
    canvas.height = mapHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const image = ctx.createImageData(mapWidth, mapHeight);
    // visibleBottomY = the y position (in the canvas) of the visible header's bottom edge
    const headerHeight = mapHeight - 2 * edgeExpansion;
    const visibleBottomY = edgeExpansion + headerHeight; // = mapHeight - edgeExpansion
    const safeThickness = clamp(edgeThickness, 1, headerHeight);

    for (let y = 0; y < mapHeight; y++) {
        let weight: number;
        if (y >= visibleBottomY) {
            // Expansion zone below visible header — keep full weight so the feDisplacementMap
            // can sample from here when displacing the bottom-edge visible pixels.
            weight = 1;
        } else {
            // Distance from the visible bottom edge, measured upward into the header
            const distFromBottom = visibleBottomY - y;
            const edgeProgress = clamp(distFromBottom / safeThickness, 0, 1);
            weight = 1 - smootherStep(edgeProgress);
        }
        const byteValue = Math.round(weight * 255);
        for (let x = 0; x < mapWidth; x++) {
            const offset = (y * mapWidth + x) * 4;
            image.data[offset] = byteValue;
            image.data[offset + 1] = byteValue;
            image.data[offset + 2] = byteValue;
            image.data[offset + 3] = 255;
        }
    }

    ctx.putImageData(image, 0, 0);
    return { height: mapHeight, url: canvas.toDataURL("image/png"), width: mapWidth };
}

function mergeRefs<T>(...refs: Array<Ref<T> | undefined>) {
    return (node: T) => {
        refs.forEach((ref) => {
            if (!ref) return;
            if (typeof ref === "function") {
                ref(node);
                return;
            }
            (ref as MutableRefObject<T | null>).current = node;
        });
    };
}

// Inspired by Chris Feijoo's kube.io writeup on CSS/SVG Liquid Glass:
// https://kube.io/blog/liquid-glass-css-svg/
export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(function GlassPanel(
    {
        children,
        variant = "standard",
        profile = "rounded",
        cornerRadius = 18,
        padding,
        blurAmount = 2,
        saturation = 135,
        displacementScale = 42,
        aberrationIntensity = 1.4,
        edgeThickness = 22,
        style,
        ...rest
    },
    forwardedRef,
) {
    const fallbackId = useId().replace(/:/g, "");
    const filterId = `liquid-glass-${fallbackId}`;
    const localRef = useRef<HTMLDivElement | null>(null);
    const [map, setMap] = useState<DisplacementMap | null>(null);
    const displayCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const fullPageCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const captureRafRef = useRef<number>(0);
    const pathname = usePathname();
    const edgeExpansion = profile === "bar" ? Math.ceil(displacementScale / 2) : 0;
    const horizontalBleed =
        profile === "bar" ? Math.ceil(displacementScale + blurAmount * 4 + 12) : 0;

    useLayoutEffect(() => {
        const element = localRef.current;
        if (!element) return;

        const updateMap = () => {
            const rect = element.getBoundingClientRect();
            setMap(
                profile === "bar"
                    ? createBarEdgeMask(
                          rect.width + horizontalBleed * 2,
                          rect.height + 2 * edgeExpansion,
                          edgeExpansion,
                          edgeThickness,
                      )
                    : createDisplacementMap(rect.width, rect.height, cornerRadius),
            );
        };

        updateMap();

        const observer = new ResizeObserver(updateMap);
        observer.observe(element);
        return () => observer.disconnect();
    }, [cornerRadius, edgeExpansion, edgeThickness, horizontalBleed, profile]);

    useEffect(() => {
        const element = localRef.current;
        if (!element) return;

        let cancelled = false;
        let resizeTimer: ReturnType<typeof setTimeout>;

        const updateSlice = () => {
            const full = fullPageCanvasRef.current;
            const display = displayCanvasRef.current;
            if (!full || !display) return;

            const rect = element.getBoundingClientRect();
            const scrollY = window.scrollY;
            // Bar: full-width strip anchored at scroll position.
            // edgeExpansion adds vertical OOB margin; horizontalBleed lets chromatic split
            // resolve outside the visible viewport edge.
            // Rounded: element can be anywhere on screen — use rect.left + absolute document Y.
            const cssSrcX = profile === "bar" ? 0 : rect.left;
            const cssSrcY = profile === "bar"
                ? Math.max(0, scrollY - edgeExpansion)
                : rect.top + scrollY; // rect.top is viewport-relative; add scrollY for document-absolute
            const cssSrcW = rect.width;
            const cssSrcH = rect.height + edgeExpansion * 2;
            const displayWidth = profile === "bar" ? cssSrcW + horizontalBleed * 2 : cssSrcW;

            display.width = Math.round(displayWidth);
            display.height = Math.round(cssSrcH);

            const ctx = display.getContext("2d");
            if (!ctx) return;
            ctx.clearRect(0, 0, display.width, display.height);

            // html2canvas captured at scale=1 so canvas pixels = CSS pixels: no conversion needed.
            // Bar canvases include neutral horizontal bleed so chromatic displacement
            // resolves offscreen instead of pulling blue source pixels into the viewport edge.
            if (profile === "bar") {
                const visibleDisplayWidth = display.width - horizontalBleed * 2;
                ctx.fillStyle = "#FBF5F1";
                ctx.fillRect(0, 0, horizontalBleed, display.height);
                ctx.drawImage(
                    full,
                    cssSrcX,
                    cssSrcY,
                    cssSrcW,
                    cssSrcH,
                    horizontalBleed,
                    0,
                    visibleDisplayWidth,
                    display.height,
                );
                ctx.fillRect(horizontalBleed + visibleDisplayWidth, 0, horizontalBleed, display.height);
            } else {
                ctx.drawImage(full, cssSrcX, cssSrcY, cssSrcW, cssSrcH, 0, 0, display.width, display.height);
            }
        };

        const captureFullPage = async () => {
            // Dynamic import keeps html2canvas out of the SSR bundle.
            // Canvas pixels are accessible as SVG filter SourceGraphic, unlike CSS backdrop-filter
            // which Chrome isolates in a separate compositor pass with no pixel handoff.
            const { default: html2canvas } = await import("html2canvas");
            if (cancelled) return;

            // html2canvas's CSS parser does not support lab()/oklch()/lch() colors that Chrome
            // returns from getComputedStyle on wide-gamut displays. Patch temporarily to convert
            // them to transparent before html2canvas reads them.
            const origGetComputedStyle = window.getComputedStyle.bind(window);
            (window as typeof window & { getComputedStyle: typeof window.getComputedStyle }).getComputedStyle = (
                el: Element,
                pseudo?: string | null,
            ) => {
                const style = origGetComputedStyle(el, pseudo);
                const modernColorRe = /^(lab|oklch|lch|oklab)\(/;
                return new Proxy(style, {
                    get(target, prop) {
                        // html2canvas reads styles via getPropertyValue() — intercept it directly.
                        if (prop === "getPropertyValue") {
                            return (name: string) => {
                                const val = target.getPropertyValue(name);
                                return modernColorRe.test(val) ? "transparent" : val;
                            };
                        }
                        const val = Reflect.get(target, prop);
                        if (typeof val === "string" && modernColorRe.test(val)) return "transparent";
                        if (typeof val === "function") return (val as (...args: unknown[]) => unknown).bind(target);
                        return val;
                    },
                });
            };

            let captured: HTMLCanvasElement | null = null;
            const hiddenDuringCapture = Array.from(
                document.querySelectorAll<HTMLElement>("[data-glass-ignore]"),
            ).map((el) => ({ el, visibility: el.style.visibility }));
            try {
                hiddenDuringCapture.forEach(({ el }) => {
                    el.style.visibility = "hidden";
                });
                // document.body gives full scroll height; documentElement may return viewport height only.
                // scale=1 keeps canvas pixels = CSS pixels so updateSlice needs no coordinate conversion.
                // scrollX/scrollY=0 ensures we always capture from document top regardless of scroll.
                captured = await html2canvas(document.body, {
                    backgroundColor: "#FBF5F1",
                    scale: 1,
                    logging: false,
                    useCORS: true,
                    allowTaint: true,
                    scrollX: 0,
                    scrollY: 0,
                    // Skip glass panels and decorative backdrops so captured refraction stays UI-colored.
                    ignoreElements: (el) =>
                        el.matches("[data-liquid-glass-panel]") ||
                        Boolean(el.closest("[data-liquid-glass-panel]")) ||
                        el.matches("[data-glass-ignore]") ||
                        Boolean(el.closest("[data-glass-ignore]")),
                });
            } catch (err) {
                console.warn("[GlassPanel] html2canvas capture failed:", err);
            } finally {
                hiddenDuringCapture.forEach(({ el, visibility }) => {
                    el.style.visibility = visibility;
                });
                (window as typeof window & { getComputedStyle: typeof window.getComputedStyle }).getComputedStyle =
                    origGetComputedStyle;
            }

            if (captured && !cancelled) {
                fullPageCanvasRef.current = captured;
                updateSlice();
            }
        };

        const captureTimer = setTimeout(captureFullPage, 600);

        const onScroll = () => {
            cancelAnimationFrame(captureRafRef.current);
            captureRafRef.current = requestAnimationFrame(updateSlice);
        };
        const onResize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(captureFullPage, 1000);
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onResize);

        return () => {
            cancelled = true;
            clearTimeout(captureTimer);
            clearTimeout(resizeTimer);
            cancelAnimationFrame(captureRafRef.current);
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onResize);
        };
    }, [profile, edgeExpansion, horizontalBleed, pathname]);

    const cssVars = {
        "--liquid-glass-radius": `${cornerRadius}px`,
    } as CSSProperties;

    const accentBackground =
        variant === "accent"
            ? "linear-gradient(135deg, rgba(216,190,198,0.34), rgba(255,249,246,0.38))"
            : "rgba(255,249,246,0.10)";

    const displacementFilter = map ? `url(#${filterId})` : "none";

    const filterDefinition = map && (
        <svg
            aria-hidden="true"
            focusable="false"
            style={{ height: 0, pointerEvents: "none", position: "absolute", width: 0 }}
        >
            <defs>
                <filter
                    id={filterId}
                    x={0}
                    y={0}
                    width={map.width}
                    height={map.height}
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                >
                    {profile === "bar" ? (
                        <>
                            {/*
                              * Step 1: Generate subtle organic turbulence noise.
                              * The tiny, slow frequency drift gives the rim a barely-there wave
                              * without sweeping a solid background color through the header.
                              */}
                            <feTurbulence
                                type="fractalNoise"
                                baseFrequency="0.003 0.025"
                                numOctaves={3}
                                seed={9}
                                result="NOISE"
                            >
                                <animate
                                    attributeName="baseFrequency"
                                    values="0.003 0.025;0.00325 0.026;0.003 0.025"
                                    dur="18s"
                                    repeatCount="indefinite"
                                    calcMode="spline"
                                    keySplines="0.45 0 0.55 1;0.45 0 0.55 1"
                                />
                            </feTurbulence>
                            {/*
                              * Step 2: Edge weight mask (white=1 at bottom rim, black=0 at center).
                              * Generated by createBarEdgeMask using smootherStep falloff.
                              */}
                            <feImage
                                href={map.url}
                                x={0}
                                y={0}
                                width={map.width}
                                height={map.height}
                                preserveAspectRatio="none"
                                result="EDGE_MASK"
                            />
                            {/*
                              * Step 3: Weight the noise by the edge mask.
                              * feComposite arithmetic: result = k1*i1*i2 + k2*i1 + k3*i2 + k4
                              * With k1=0.42, k2=0, k3=-0.21, k4=0.5 this computes:
                              *   result = 0.5 + 0.42*EDGE_MASK*(NOISE - 0.5)
                              * At mask=0 (center): result = 0.5 → neutral, no displacement.
                              * At mask=1 (rim):    result = reduced organic displacement.
                              */}
                            <feComposite
                                in="NOISE"
                                in2="EDGE_MASK"
                                operator="arithmetic"
                                k1="0.42"
                                k2="0"
                                k3="-0.21"
                                k4="0.5"
                                result="LIQUID_DISPLACEMENT_MAP"
                            />
                        </>
                    ) : (
                        <feImage
                            href={map.url}
                            x={0}
                            y={0}
                            width={map.width}
                            height={map.height}
                            preserveAspectRatio="none"
                            result="LIQUID_DISPLACEMENT_MAP"
                        />
                    )}
                    {/* Pre-blur softens source pixels before displacement; prevents jagged edges on uniform shapes */}
                    <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="SOFTENED_SOURCE" />
                    <feDisplacementMap
                        in="SOFTENED_SOURCE"
                        in2="LIQUID_DISPLACEMENT_MAP"
                        scale={displacementScale}
                        xChannelSelector="R"
                        yChannelSelector="G"
                        result="RED_DISPLACED"
                    />
                    <feColorMatrix
                        in="RED_DISPLACED"
                        type="matrix"
                        values="1 0 0 0 0
                                0 0 0 0 0
                                0 0 0 0 0
                                0 0 0 1 0"
                        result="RED_CHANNEL"
                    />
                    <feDisplacementMap
                        in="SOFTENED_SOURCE"
                        in2="LIQUID_DISPLACEMENT_MAP"
                        scale={displacementScale * (1 - aberrationIntensity * 0.03)}
                        xChannelSelector="R"
                        yChannelSelector="G"
                        result="GREEN_DISPLACED"
                    />
                    <feColorMatrix
                        in="GREEN_DISPLACED"
                        type="matrix"
                        values="0 0 0 0 0
                                0 1 0 0 0
                                0 0 0 0 0
                                0 0 0 1 0"
                        result="GREEN_CHANNEL"
                    />
                    <feDisplacementMap
                        in="SOFTENED_SOURCE"
                        in2="LIQUID_DISPLACEMENT_MAP"
                        scale={displacementScale * (1 - aberrationIntensity * 0.06)}
                        xChannelSelector="R"
                        yChannelSelector="G"
                        result="BLUE_DISPLACED"
                    />
                    <feColorMatrix
                        in="BLUE_DISPLACED"
                        type="matrix"
                        values="0 0 0 0 0
                                0 0 0 0 0
                                0 0 1 0 0
                                0 0 0 1 0"
                        result="BLUE_CHANNEL"
                    />
                    <feBlend in="GREEN_CHANNEL" in2="BLUE_CHANNEL" mode="screen" result="GB_COMBINED" />
                    <feBlend in="RED_CHANNEL" in2="GB_COMBINED" mode="screen" result="RECONSTRUCTED" />
                    {/* Physically correct order: displace (refract) then blur (absorb/scatter) */}
                    <feGaussianBlur in="RECONSTRUCTED" stdDeviation={blurAmount} result="BLURRED" />
                    <feColorMatrix in="BLURRED" type="saturate" values={String(saturation / 100)} />
                </filter>
            </defs>
        </svg>
    );

    return (
        <>
            {filterDefinition}
            <div
            ref={mergeRefs(localRef, forwardedRef)}
            data-liquid-glass-panel=""
            style={{
                ...cssVars,
                boxSizing: "border-box",
                display: "inline-flex",
                isolation: "isolate",
                overflow: "hidden",
                padding,
                position: "relative",
                borderRadius: "var(--liquid-glass-radius)",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.58)",
                boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.95), inset 0 -1px 0 rgba(255,255,255,0.22), 0 14px 42px rgba(60,40,50,0.14)",
                ...style,
            }}
            {...rest}
        >
            {/*
              * CSS backdrop-filter cannot feed SVG filter SourceGraphic — Chrome's GPU compositor
              * processes them in isolated passes with no pixel handoff between them.
              *
              * Both profiles use html2canvas to capture real page pixels into a <canvas> element.
              * Canvas pixels ARE SourceGraphic for filter: url(), so feDisplacementMap receives
              * real painted content to warp. Blur and saturation run inside the SVG filter chain
              * (after displacement) for physically correct order: refract first, then scatter.
              *
              * Bar: slices from X=0 at scrollY (full-width strip). edgeExpansion extends the
              * canvas above/below the header, while horizontalBleed extends left/right with
              * warm neutral pixels so chromatic edges resolve outside the viewport.
              * Rounded: slices from rect.left at rect.top+scrollY (element-relative position).
              * The SDF displacement map concentrates refraction on all four rounded edges.
              */}
            <canvas
                ref={displayCanvasRef}
                aria-hidden="true"
                style={{
                    WebkitFilter: displacementFilter,
                    filter: displacementFilter,
                    position: "absolute",
                    inset: edgeExpansion > 0 ? `-${edgeExpansion}px -${horizontalBleed}px` : 0,
                    pointerEvents: "none",
                    zIndex: 0,
                }}
            />
            <span
                aria-hidden="true"
                style={{
                    background: accentBackground,
                    inset: 0,
                    pointerEvents: "none",
                    position: "absolute",
                    zIndex: 1,
                }}
            />
            <span
                aria-hidden="true"
                style={{
                    background:
                        "linear-gradient(145deg, rgba(255,249,246,0.42), rgba(232,212,218,0.06) 42%, rgba(74,58,56,0.09) 100%)",
                    borderRadius: "inherit",
                    inset: 0,
                    mixBlendMode: "screen",
                    opacity: 0.34,
                    pointerEvents: "none",
                    position: "absolute",
                    zIndex: 2,
                }}
            />
            <span
                aria-hidden="true"
                style={{
                    border: "1px solid rgba(255,255,255,0.80)",
                    borderRadius: "inherit",
                    boxShadow: "inset 0 1px 2px rgba(255,255,255,0.95), inset 0 -1px 2px rgba(70,45,55,0.12)",
                    inset: 0,
                    pointerEvents: "none",
                    position: "absolute",
                    zIndex: 3,
                }}
            />
            <div style={{ position: "relative", width: "100%", zIndex: 4 }}>
                {children}
            </div>
            </div>
        </>
    );
});
