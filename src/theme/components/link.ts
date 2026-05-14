const link = {
    variants: {
        external: {
            color: "accent.primary",
        },
        active: {
            color: "ink.primary",
            fontWeight: "medium",
            display: "inline-flex",
            borderBottom: "1.5px solid",
            borderColor: "accent.primary",
            paddingBottom: "2px",
            _hover: { textDecoration: "none", color: "accent.primary" },
        },
        inactive: {
            color: "ink.muted",
            display: "inline-flex",
            fontWeight: "medium",
            _hover: { textDecoration: "none", color: "ink.primary" },
        },
    },
    sizes: {
        sm: { fontSize: "sm" },
        md: { fontSize: "md" },
        xl: { fontSize: "xl" },
    },
};

export default link;
