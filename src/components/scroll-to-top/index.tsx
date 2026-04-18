"use client";

import { IconButton } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { HiArrowUp } from "react-icons/hi2";

/** Appears after scrolling 400px. Smooth-scrolls back to top on click. */
export function ScrollToTop() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > 400);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    style={{
                        position: "fixed",
                        bottom: "2rem",
                        right: "2rem",
                        zIndex: 999,
                    }}
                >
                    <IconButton
                        aria-label="Scroll to top"
                        icon={<HiArrowUp />}
                        onClick={scrollToTop}
                        size="md"
                        borderRadius="full"
                        // Glass treatment
                        backgroundColor="rgba(249, 249, 248, 0.82)"
                        backdropFilter="saturate(180%) blur(16px)"
                        border="1px solid"
                        borderColor="surface.containerHighest"
                        color="ink.primary"
                        boxShadow="0 4px 20px rgba(44, 52, 51, 0.08)"
                        _hover={{
                            backgroundColor: "rgba(249, 249, 248, 0.95)",
                            color: "brand.500",
                        }}
                        _active={{ transform: "scale(0.95)" }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
