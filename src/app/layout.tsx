import { StyleJsxGlobal, Providers } from "chakra";
import { Header, Footer, ScrollToTop } from "components";
import { HandleOnComplete } from "router";
import { environment } from "environment";
import { getResumeURL } from "config";
import "css/giscus/giscus.css";

export const fetchCache = "force-no-store"; // allows the resume to be continuously updated

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
                    minHeight: "100%",
                }}
            >
                <link rel="icon" href="/favicon.ico" sizes="any" />
                <HandleOnComplete />
                <StyleJsxGlobal />
                <Providers>
                    <Header />
                    {/* pt accounts for fixed header height (~64px) */}
                    <main style={{ flex: 1, paddingTop: "64px" }}>
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
