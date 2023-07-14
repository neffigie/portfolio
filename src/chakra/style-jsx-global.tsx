'use client'; 

import { FontClassName } from "./theme";
import { Inter } from '@next/font/google';

const inter = Inter({ subsets: ['latin'] }); 

/** 
 * Sets the font for the site. 
 * @remarks See: https://chakra-ui.com/getting-started/nextjs-guide#chakra-ui-with-nextfont
 * */
const StyleJsxGlobal = () => (
    <style jsx global>
    {`
        :root {
            ${FontClassName}: ${inter.style.fontFamily};
        }
    `}
    </style>
); 

export { StyleJsxGlobal };
