import { Box, Grid, IconButton, Typography } from '@mui/material/'; 
import { grey } from '@mui/material/colors';

/**
 * Page fotter
 * @param {Object} obj the object 
 * @param {Map<string, React.ReactElement>} obj.socials the socials displayed as buttons, maps social link to the its icon
 */
export default function Footer({ socials }: { socials: Map<string, React.ReactElement> }) {
    return (
        <Box sx={{ pt: 5, p: 3, mt: "auto", backgroundColor: grey[50] }}>
            <hr/>
            <Grid container justifyContent="flex-end" spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                <Grid item xs>
                    <Typography variant="body1">Made with love - © 2022 Copyright: Anna Noelle</Typography>
                </Grid>
                <Grid item xs="auto">
                    {socials && Array.from(socials).map(([k, v]) => (
                        <IconButton key={k} href={k} target="_blank" rel="noopener noreferrer">{v}</IconButton>
                    ))}
                </Grid>
            </Grid>
        </Box>
    ); 
}

