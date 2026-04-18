"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface MagneticTextProps {
    children: React.ReactNode;
}

/** Wraps inline text with a spring-based physical drift toward the cursor. */
export function MagneticText({ children }: MagneticTextProps) {
    const rawX = useMotionValue(0);
    const rawY = useMotionValue(0);
    const cfg = { stiffness: 300, damping: 22 };
    const x = useSpring(useTransform(rawX, [-0.5, 0.5], [-5, 5]), cfg);
    const y = useSpring(useTransform(rawY, [-0.5, 0.5], [-5, 5]), cfg);

    return (
        <motion.span
            onMouseMove={(e) => {
                const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
                rawX.set((e.clientX - left) / width - 0.5);
                rawY.set((e.clientY - top)  / height - 0.5);
            }}
            onMouseLeave={() => { rawX.set(0); rawY.set(0); }}
            style={{ x, y, display: "inline-block" }}
        >
            {children}
        </motion.span>
    );
}
