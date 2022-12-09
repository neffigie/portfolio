"use client"
import { Typography } from "@mui/material";
import CodeBlock from "components/CodeBlock";
import PostTags from "components/PostTags";
import { getFirstListItem, getFileUrl } from "globals/PocketBaseClient";
import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import { Record } from "pocketbase";
import Markdown from "markdown-to-jsx";
import Image from "next/image";

export default function PostPage({ params }: any) {
    const [post, setPost] = useState<Record>(); 
    useEffect(() => {
        const fetch = async() => setPost(await getFirstListItem('posts', `slug="${params.slug}"`, { expand: 'categories' })); 
        fetch().catch(console.log); 
    }, []); 
    return (
        <>
            {post && post.expand && (
                <>
                    <Box sx={{mt: 2, mb: 2}}>
                        <PostTags tags={post.expand.categories}/>
                    </Box>
                    <Typography variant="h1">{post.title}</Typography>
                    <img src={getFileUrl(post, post.image)} alt={post.alt} width="100%"/>
                    <Typography variant="h5">{post.date}</Typography>
                    <hr/>
                    <Markdown
                        options={{
                            overrides: {
                                code: { component: CodeBlock }
                            }
                        }}
                    >
                        {post.body}
                    </Markdown>
                </>
            )}
        </>
    );
}