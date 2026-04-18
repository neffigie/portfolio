const colors = {
    // Primary: sage/teal. brand.500 = primary action, brand.700 = deep anchor.
    brand: {
        50: "#cce8e1",  // primary-container tint
        100: "#a8d5ca",
        200: "#7fbdb0",
        300: "#56a496",
        400: "#338b7c",
        500: "#2a6c5c",  // primary — vivid teal, clearly colored
        600: "#1f5346",
        700: "#163b31",
        800: "#0d231d",
        900: "#050e0b",
    },
    // Surface hierarchy (Editorial Ether)
    surface: {
        bright: "#f9f9f8",
        containerLow: "#eff3f2",
        containerLowest: "#ffffff",
        containerHighest: "#cdd8d6",  // more distinct for borders/dividers
    },
    // Semantic text shades — strong contrast on light surfaces
    ink: {
        primary: "#111c1b",  // near-black with teal undertone
        muted: "#4a6560",    // readable secondary — not washed out
        faint: "#7a9490",    // tertiary / placeholders
    },
};

export default colors;
