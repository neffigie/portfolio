"use client";

import { StyleFunctionProps } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";

/**
 * The global styles.
 * @remarks See: https://chakra-ui.com/docs/styled-system/customize-theme#customizing-global-styles
 */
const styles = {
    body: (props: StyleFunctionProps) => ({
        body: {
            fontFamily: "body",
            color: mode("gray.800", "whiteAlpha.900")(props),
            bg: mode("white", "gray.800")(props),
            lineHeight: "base",
        },
    }),
};

export default styles;
