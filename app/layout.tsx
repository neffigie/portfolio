import { StyleJsxGlobal } from "src/chakra/style-jsx-global";
import { Providers } from "../src/chakra/providers";

const RootLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <html lang='en'>
            <body>
                <StyleJsxGlobal/>
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    );
}

export default RootLayout; 