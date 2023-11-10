const link = {
    variants: {
        external: {
            color: "brand.500",
        },
        active: {
            color: "brand.800",
            fontWeight: "bold",
            display: "inline-flex",
            _hover: { textDecoration: "none" },
        },
        inactive: {
            color: "brand.900",
            display: "inline-flex",
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
