import { fetchPocketBase, getFileUrl } from "src/utils/pocketbase/PocketBaseClient";
import { HTMLParser } from "src/components/parsing/HTMLParser";

import { notFound } from 'next/navigation'
import { Record } from "pocketbase";
import { Giscus } from "src/components/Giscus";

interface PostPageProps {
    params: {

        /** The slug associated with the post in the database. */
        slug: string; 
    }
}

const PostPage = async ({ params }: PostPageProps) => {
    
    const res = await fetch(`https://neffigie.pockethost.io/api/collections/posts/records/?slug=${params.slug}?perPage=1??expand=categories.name`, { 
        next: { revalidate: 0 }, 
        method: 'GET', 
        headers: {
            'Content-Type': 'application/json',
        }
    });
    const json = await res.json() as Record;
    const post = json.items[0];
    if (!post) notFound();
    // console.log(post); // TODO - post name not id??
    
    const darkTheme = false; 

    return (post ? (
        <>
            {post.title}
            {`${post.categories}`}
            <img src={getFileUrl(post, post.image)} alt={post.alt} width="100%"/>
            {post.date}
            <hr/>
            <HTMLParser body={post.body} darkTheme={darkTheme}/>
            <Giscus darkTheme={darkTheme}/>
        </>
    ) : (
        <>
            Loading...
        </>
    ));
}

export { PostPage as default }; 