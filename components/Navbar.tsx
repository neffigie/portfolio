"use client"
import Link from 'next/link'; 
import { AppBar, Box, Toolbar, Typography, Button } from '@mui/material/';
import { grey } from '@mui/material/colors';

export default function Navbar({ pages }: { pages: string[] }) {
    return (
        <AppBar position="static" sx={{ mb: 5, backgroundCOlor: grey[900] }}>
            <Toolbar>
                <Typography variant="h5" component="a" href="/" sx={{ textDecoration: "none", color: "inherit" }}>Anna Noelle</Typography>
                <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "row-reverse" }}>
                    {pages.map((page) => (
                        <Link key={page} href={`/${page}`} style={{ textDecoration: "none" }} passHref>
                            <Button sx={{ my: 2, color: 'white', display: 'block' }}>{page ? page : 'home'}</Button>
                        </Link>
                    ))}
                </Box>
            </Toolbar>
        </AppBar>
    )
}