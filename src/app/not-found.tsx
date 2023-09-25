import { Heading, Text } from "components";

export default function NotFound() {
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
        >
            <Heading>🚧 Not Found</Heading>
            <Text>Could not find the requested page, sorry!</Text>
        </div>
    );
}
