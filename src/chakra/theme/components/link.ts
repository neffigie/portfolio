const link = {
    variants: {
        external: {
            color: "blue.600",
        },
        active: {
            color: "black",
            fontWeight: "bold",
            display: "inline-flex",
            _hover: { textDecoration: "none" },
        },
        inactive: {
            color: "gray.600",
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
