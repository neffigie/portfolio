export default function Center({ children, ...props }: React.ComponentPropsWithoutRef<"div">) {
    return (
        <div style={{ display: "table-row", height: "100%" }}>
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                }}
                {...props}
            >
                {children}
            </div>
        </div>
    );
}
