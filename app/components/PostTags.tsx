"use client"
import { Typography, Chip } from "@mui/material/"; 
import { Record } from "pocketbase"

export default function PostTags({ tags }: { tags: Record[] | Record }) {
    return <>{tags?.map((tag: Record) => <Chip key={tag.id} sx={{mr: 1}} label={<Typography variant="body2">{tag.name}</Typography>}/>)}</>
}