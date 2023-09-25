import { type Metadata } from "next";
import { Post } from "./Post";
import { getPost } from "config/database";

interface PostPageProps {
    params: { slug: string };
}

// see: https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#fetchcache
export const fetchCache = "force-no-store";

// see: https://nextjs.org/docs/app/building-your-application/optimizing/metadata#dynamic-metadata
export const generateMetadata = async ({ params }: PostPageProps): Promise<Metadata> => {
    const post = await getPost(params.slug);
    return {
        title: post?.title,
        description: post?.description,
    };
};

export default async function PostPage({ params }: PostPageProps) {
    const post = await getPost(params.slug);
    return post ? <Post post={post} /> : <>Loading...</>;
}
