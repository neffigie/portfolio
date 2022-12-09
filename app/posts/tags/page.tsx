"use client"
import { Box, Typography } from "@mui/material";
import { getFullList } from "globals/PocketBaseClient";
import { Record } from "pocketbase";
import { useEffect, useState } from "react";
import Markdown from "markdown-to-jsx";

export default function TagsPage() {
    const [tags, setTags] = useState<Record[]>(); 
    useEffect(() => {
        const fetch = async() => setTags(await getFullList('post_categories')); 
        fetch().catch(console.log); 
    }, []); 
    return (
        <>
            {tags?.map((tag) => (
                <Box key={tag.id}>
                    <Typography variant="h2">{tag.name}</Typography>
                    <Markdown>{tag.description}</Markdown>
                </Box>
            ))}
        </>
    ); 
}