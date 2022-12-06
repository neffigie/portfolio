"use client"
import { Typography } from "@mui/material";
import CodeBlock from "app/components/CodeBlock";
import PostTags from "app/components/PostTags";
import { getFirstListItem, getFileUrl } from "app/globals/PocketBaseClient";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import Box from "@mui/material/Box";
import { Record } from "pocketbase";

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
                    <img src={getFileUrl(post, post.image)}/>
                    <Typography variant="h5">{post.date}</Typography>
                    <hr/>
                    <ReactMarkdown
                        children={post.body}
                        components={{
                            code({node, className, children, ...props}) {
                                const match = /language-(\w+)/.exec(className || ''); 
                                return match ? (
                                <CodeBlock
                                    code={String(children).replace(/\n$/, '')}
                                    language={match[1]}
                                />
                                ) : (
                                    <code className={className} {...props}>
                                        {children}
                                    </code>
                                )
                            }
                        }}
                    />
                </>
            )}
        </>
    );
}