import { extendTheme, withDefaultColorScheme } from "@chakra-ui/react";
import link from "chakra/theme/components/link";
import fonts from "chakra/theme/foundations/fonts";
import styles from "chakra/theme/foundations/fonts";

/** The app theme. */
const theme = {
    /**
     * System set initial value, and the app subscribes to system color mode changes.
     * See: https://chakra-ui.com/docs/styled-system/color-mode#common-configurations
     */
    initialColorMode: "system",
    useSystemColorMode: true,
    styles,
    fonts,
    components: {
        Link: link,
    },
};

export default extendTheme(
    theme,
    withDefaultColorScheme({
        colorScheme: "teal",
        components: ["Tag", "Badge"],
    }),
);
