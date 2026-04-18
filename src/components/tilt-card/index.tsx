"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";

interface TiltCardProps {
    children: React.ReactNode;
    style?: React.CSSProperties;
    className?: string;
}

/** Wraps children with a spring-based 3D tilt + physical drift toward the cursor. */
export function TiltCard({ children, style, ...props }: TiltCardProps) {
    const ref = useRef<HTMLDivElement>(null);
    const rawX = useMotionValue(0); // normalised −0.5 → 0.5
    const rawY = useMotionValue(0);
    const cfg = { stiffness: 150, damping: 20 };

    const x       = useSpring(useTransform(rawX, [-0.5, 0.5], [-10, 10]), cfg);
    const y       = useSpring(useTransform(rawY, [-0.5, 0.5], [-10, 10]), cfg);
    const rotateX = useSpring(useTransform(rawY, [-0.5, 0.5], [2, -2]),   cfg);
    const rotateY = useSpring(useTransform(rawX, [-0.5, 0.5], [-2, 2]),   cfg);

    const track = (e: React.MouseEvent<HTMLDivElement>) => {
        const { left, top, width, height } = ref.current!.getBoundingClientRect();
        rawX.set((e.clientX - left) / width - 0.5);
        rawY.set((e.clientY - top)  / height - 0.5);
    };
    const reset = () => { rawX.set(0); rawY.set(0); };

    return (
        <motion.div
            ref={ref}
            onMouseMove={track}
            onMouseLeave={reset}
            style={{ x, y, rotateX, rotateY, transformPerspective: 1000, ...style }}
            {...props}
        >
            {children}
        </motion.div>
    );
}
