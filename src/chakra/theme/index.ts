import { extendTheme, withDefaultColorScheme } from "@chakra-ui/react";
import { withProse } from "@nikolovlazar/chakra-ui-prose";
import link from "chakra/theme/components/link";
import blockquote from "chakra/theme/components/blockquote";
import fonts from "chakra/theme/foundations/fonts";
import styles from "chakra/theme/styles";
import colors from "chakra/theme/colors";

/** The app theme. */
const theme = {
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
        colorScheme: "brand",
        components: ["Tag", "Badge", "Spinner", "Code"],
    }),
    withProse({
        baseStyle: {
            blockquote,
        },
    }),
);
