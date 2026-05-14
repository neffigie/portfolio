import StyleGlobal from "components/style-global";
import { Providers } from "components/providers";
import { Header, Footer, ScrollToTop } from "components";
import { HeroScene } from "components/scene/HeroScene";
import { FieldLines } from "components/scene/FieldLines";
import { HandleOnComplete } from "router";
import { environment } from "environment";
import { getResumeURL } from "config";
import "css/giscus/giscus.css";
import "css/nprogress/nprogress.css";

export const dynamic = "force-dynamic"; // layout fetches resume URL from PocketBase on every request

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const resumeUrl = (await getResumeURL()) ?? "";
    return (
        <html
            lang="en"
            suppressHydrationWarning /** https://github.com/chakra-ui/chakra-ui/issues/7040#issuecomment-1655818781 */
        >
            <body
                suppressHydrationWarning
                style={{
                    display: "flex",
                    flexDirection: "column",
                    minHeight: "100dvh",
                }}
            >
                <link rel="icon" href="/favicon.ico" sizes="any" />
                <HandleOnComplete />
                <StyleGlobal />
                <Providers>
                    <HeroScene />
                    <FieldLines />
                    <Header />
                    <main
                        style={{
                            boxSizing: "border-box",
                            display: "flex",
                            flex: "1 1 auto",
                            flexDirection: "column",
                            minHeight: 0,
                            paddingTop: "56px",
                            position: "relative",
                            zIndex: 1,
                        }}
                    >
                        {children}
                    </main>
                    <Footer
                        email={environment.NEXT_PUBLIC_EMAIL}
                        linkedInUrl={environment.NEXT_PUBLIC_LINKEDIN_URL}
                        githubUrl={environment.NEXT_PUBLIC_GITHUB_URL}
                        itchUrl={environment.NEXT_PUBLIC_ITCH_URL}
                        resumeUrl={resumeUrl}
                    />
                    <ScrollToTop />
                </Providers>
            </body>
        </html>
    );
}
