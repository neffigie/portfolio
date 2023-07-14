'use client'

import { extendTheme } from "@chakra-ui/react";

const FontClassName = '--font-inter';

/** The extended theme. */
const theme = extendTheme({
    fonts: {
        heading: `var(${FontClassName})`, 
        body: `var(${FontClassName})`, 
    }
});

export { theme, FontClassName };