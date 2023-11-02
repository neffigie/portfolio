import { ClientHeading, ClientText, Center } from "components";

export default function NotFound() {
    return (
        <Center>
            <ClientHeading>🚧 Not Found</ClientHeading>
            <ClientText>Could not find the requested page, sorry!</ClientText>
        </Center>
    );
}
