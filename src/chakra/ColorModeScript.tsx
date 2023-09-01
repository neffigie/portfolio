"use client";
import theme from "chakra/theme";
import { ColorModeScript as Script } from "@chakra-ui/react";
/**
 * The color mode script needs to be added before the content inside the `body` tag for local storage syncing to work correctly.
 *
 * See: https://chakra-ui.com/getting-started/nextjs-guide#color-mode-script
 */
const ColorModeScript = () => <Script initialColorMode={theme.config.initialColorMode} />;
export { ColorModeScript as default };
