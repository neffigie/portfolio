"use client";

/**
 * The global styles.
 * @remarks See: https://chakra-ui.com/docs/styled-system/customize-theme#customizing-global-styles
 * Dark mode is deferred — the Editorial Ether system is light-only for now.
 */
const styles = {
    global: {
        body: {
            fontFamily: "body",
            color: "ink.primary",
            bg: "surface.bright",
            lineHeight: "base",
        },
    },

    initialColorMode: "light",
    useSystemColorMode: false,
};

export default styles;
