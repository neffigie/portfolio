/** The font class name CSS variable. */
export const FontClassName = "--font-inter";

/**
 * Global default fonts
 * See: https://chakra-ui.com/getting-started/nextjs-guide#chakra-ui-with-nextfont
 */
const fonts = {
    heading: `var(${FontClassName})`,
    body: `var(${FontClassName})`,
};

export default fonts;
