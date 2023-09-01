'use client'

import { extendTheme } from "@chakra-ui/react";

/** The font class name CSS variable. */
const FontClassName = '--font-inter';

/** The extended theme. */
const theme = extendTheme({

    /** 
     * System set initial value, and the app subscribes to system color mode changes. 
     * See: https://chakra-ui.com/docs/styled-system/color-mode#common-configurations
     */
    initialColorMode: 'system',
    useSystemColorMode: true,

    /** 
     * Global default fonts 
     * See: https://chakra-ui.com/getting-started/nextjs-guide#chakra-ui-with-nextfont
     */
    fonts: {
        heading: `var(${FontClassName})`, 
        body: `var(${FontClassName})`, 
    }
});

export { theme as default, FontClassName };