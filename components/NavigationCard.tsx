import { CardActionArea, Card, CardActions, CardContent } from "@mui/material"
import { cloneElement } from "react"

export default function NavigationCard({ media, title, body, categories, href, horizontal }: { 
    media: React.ReactElement, title: React.ReactElement, body: React.ReactElement, 
    categories: React.ReactElement, href: string, horizontal: boolean
}){
    return (
        <Card elevation={4}>
            <CardActionArea href={href} sx={horizontal ? { display: "flex", flexDirection: "row-reverse", justifyContent: "flex-start"} : {}}>
                {cloneElement(media, {...{sx: {height: 100}}, ...media.props})}
                <CardContent>
                    {title}
                    {body}
                    <CardActions sx={{p: 0, pt: 2}}>
                        {categories}
                    </CardActions>
                </CardContent>
            </CardActionArea>
        </Card>
    )
}