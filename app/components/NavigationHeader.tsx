"use client"
import { Box } from "@mui/material";
import Typography from "@mui/material/Typography";

export default function NavigationHeader({ title, subtitle }: { title: string, subtitle: string }){
    return (
        <>
            <Box>
                <Typography variant="h5">{title}</Typography>
                <Typography variant="body2">{subtitle}</Typography>
            </Box>
        </>
    ); 
}