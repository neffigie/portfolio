"use client"
import { useRouter } from "next/router";
import { Typography } from "@mui/material";
import CodeBlock from "components/CodeBlock";
import PostTags from "components/PostTags";
import { getFirstListItem, getFileUrl } from "globals/PocketBaseClient";
import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import { Record } from "pocketbase";
import Markdown from "markdown-to-jsx";
import Image from "next/image";

export default function PostPage() {
    const router = useRouter(); 
    const [post, setPost] = useState<Record>(); 
    useEffect(() => {
        if (!router.query.slug) return; 
        const fetch = async() => setPost(await getFirstListItem('posts', `slug="${router.query.slug}"`, { expand: 'categories' })); 
        fetch().catch(console.log); 
    }, [router]); 
    return (
        <>
            {post && post.expand && (
                <>
                    <Box sx={{mt: 2, mb: 2}}>
                        <PostTags tags={post.expand.categories}/>
                    </Box>
                    <Typography variant="h1">{post.title}</Typography>
                    <Image src={getFileUrl(post, post.image)} alt={post.alt} height={100} width={100}/>
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

/* 
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
                            }*/