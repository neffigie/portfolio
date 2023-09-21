import { StyleJsxGlobal, Providers, ColorModeScript } from "chakra";
import { Header, Footer } from "components";
import { HandleOnComplete } from "router";
import { MainContainer } from "./MainContainer";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html
            lang="en"
            suppressHydrationWarning /** https://github.com/chakra-ui/chakra-ui/issues/7040#issuecomment-1655818781 */
        >
            <body suppressHydrationWarning>
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
