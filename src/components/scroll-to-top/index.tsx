"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { HiArrowUp } from "react-icons/hi2";
import { Box } from "@chakra-ui/react";
import { GlassPanel } from "components/glass";

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
                    style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 999 }}
                >
                    <GlassPanel
                        cornerRadius={15}
                        displacementScale={52}
                        blurAmount={0.8}
                        padding="0"
                        style={{
                            display: "block",
                            height: "44px",
                            transition: "transform 0.2s ease-out, box-shadow 0.2s ease-out",
                            width: "44px",
                        }}
                    >
                        <Box
                            as="button"
                            onClick={scrollToTop}
                            aria-label="Scroll to top"
                            cursor="pointer"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            w="44px"
                            h="44px"
                            border={0}
                            borderRadius="15px"
                            background="transparent"
                            color="ink.primary"
                            transition="all 0.2s ease-out"
                            _hover={{
                                transform: "translateY(-1px)",
                            }}
                            _active={{ transform: "scale(0.95)" }}
                        >
                            <HiArrowUp size={16} />
                        </Box>
                    </GlassPanel>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
