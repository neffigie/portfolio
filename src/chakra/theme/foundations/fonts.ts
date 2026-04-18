/** CSS variable for the Newsreader serif display font. */
export const NewsreaderClassName = "--font-newsreader";

/** CSS variable for the Manrope sans-serif UI font. */
export const ManropeClassName = "--font-manrope";

/**
 * Global default fonts.
 * Newsreader is used for display/headings; Manrope for body/UI.
 * See: https://chakra-ui.com/getting-started/nextjs-guide#chakra-ui-with-nextfont
 */
const fonts = {
    heading: `var(${NewsreaderClassName})`,
    body: `var(${ManropeClassName})`,
    mono: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`,
};

export default fonts;
