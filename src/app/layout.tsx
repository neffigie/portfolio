import { StyleJsxGlobal, Providers, ColorModeScript } from "chakra";
import { Header, MainContainer, Footer } from "components";
import { HandleOnComplete } from "router";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html
            lang="en"
            suppressHydrationWarning /** https://github.com/chakra-ui/chakra-ui/issues/7040#issuecomment-1655818781 */
            style={{
                height: "100%",
            }}
        >
            <body
                suppressHydrationWarning
                style={{
                    display: "flex",
                    flexDirection: "column",
                    minHeight: "100%",
                }}
            >
                <ColorModeScript />
                <HandleOnComplete />
                <StyleJsxGlobal />
                <Providers>
                    <Header />
                    <MainContainer>{children}</MainContainer>
                    <Footer />
                </Providers>
            </body>
        </html>
    );
}
