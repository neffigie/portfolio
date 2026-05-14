import { extendTheme, withDefaultColorScheme } from "@chakra-ui/react";
import { withProse } from "@nikolovlazar/chakra-ui-prose";
import link from "theme/components/link";
import blockquote from "theme/components/blockquote";
import fonts from "theme/fonts";
import styles from "theme/styles";
import colors from "theme/colors";

const theme = {
    config: {
        initialColorMode: "light",
        useSystemColorMode: false,
    },
    styles,
    fonts,
    colors,
    components: {
        Link: link,
    },
};

export default extendTheme(
    theme,
    withDefaultColorScheme({
        colorScheme: "accent",
        components: ["Tag", "Badge", "Spinner", "Code"],
    }),
    withProse({
        baseStyle: {
            blockquote,
        },
    }),
);
