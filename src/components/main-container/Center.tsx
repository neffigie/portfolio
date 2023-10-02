export default function Center({ children, ...props }: React.ComponentPropsWithoutRef<"div">) {
    return (
        <div
            style={{
                display: "flex",
                flex: 1,
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
            }}
            {...props}
        >
            {children}
        </div>
    );
}
