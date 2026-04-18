const link = {
    variants: {
        external: {
            color: "brand.500",
        },
        active: {
            color: "ink.primary",
            fontWeight: "medium",
            display: "inline-flex",
            borderBottom: "1.5px solid",
            borderColor: "brand.500",
            paddingBottom: "2px",
            _hover: { textDecoration: "none", color: "brand.500" },
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
