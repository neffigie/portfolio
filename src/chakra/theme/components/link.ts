const link = {
    variants: {
        external: {
            color: "brand.500",
        },
        active: {
            color: "brand.700",
            fontWeight: "bold",
            display: "inline-flex",
            _hover: { textDecoration: "none" },
        },
        inactive: {
            display: "inline-flex",
            fontWeight: "bold",
            _hover: { textDecoration: "none" },
        },
    },
    sizes: {
        xl: {
            fontSize: "xl",
        },
    },
};

export default link;
