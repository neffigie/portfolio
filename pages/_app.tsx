"use client";
import { useState, useMemo, createContext } from 'react';
import Navbar from 'components/Navbar';
import Footer from 'components/Footer';
import { Container, Box } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { grey } from '@mui/material/colors';

import './styles.css'; 
import { Roboto } from '@next/font/google';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faLinkedin, faItchIo, faGithub } from '@fortawesome/free-brands-svg-icons';
import { NextPage } from 'next';
import { AppProps } from 'next/app'; 

const roboto = Roboto({
    weight: ['300', '700'],
    style: ['normal', 'italic'],
    subsets: ['latin'],
});

// keys added for eslint compliance
const socials = new Map<string, React.ReactElement>([
    ['https://www.linkedin.com/in/Anna Noelle/', <Icon key={0} icon={faLinkedin}/>], 
    ['https://github.com/neffigie', <Icon key={1} icon={faGithub}/>], 
    ['https://neffigie.itch.io/', <Icon key={2} icon={faItchIo}/>]
]); 

const ColorModeContext = createContext({ toggleColorMode: () => {} }); 

export default function RootLayout({ Component, pageProps }: AppProps & { Component: React.ReactNode }) {
    const [mode, setMode] = useState<'light' | 'dark'>('light');  

    const colorMode = useMemo(() => ({ 
        toggleColorMode: () => { setMode(prevMode => prevMode === 'light' ? 'dark' : 'light') }
    }), []); 

    const theme = useMemo(() => createTheme({
        palette: { mode }, 
        components: {
            MuiAppBar: {
              styleOverrides: {
                colorPrimary: {
                  backgroundColor: grey[900]
                }
              }
            }
          }
    }), [mode]); 

    return (
        <main className={roboto.className}>
            <ColorModeContext.Provider value={colorMode}>
                <ThemeProvider theme={theme}>
                    <Navbar pages={['posts', 'projects', '']}/>
                    <Container maxWidth="xl">
                        <Box sx={{ flex: 1, m: 2 }}>
                            <Component {...pageProps}/>
                        </Box>
                    </Container>
                    <Footer socials={socials}/>
                </ThemeProvider>
            </ColorModeContext.Provider>
        </main>
    );
}