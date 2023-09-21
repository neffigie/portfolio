import { getFirstListItem, convertToPlainObject } from "pocketbase-lib";

import { notFound } from "next/navigation";
import { ClientResponseError } from "pocketbase";
import { type Metadata } from "next";
import { Post } from "./Post";

interface PostPageProps {
    params: { slug: string };
}

/** Gets a post by its `slug` defined in the database. */
export async function getPost(slug: string) {
    try {
        return await getFirstListItem("posts", `slug="${slug}"`, { expand: ["categories"] });
    } catch (error) {
        if (error instanceof ClientResponseError && error.status === 404) notFound();
        // TODO: else ... ? show error page
    }
    return null;
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

export default async function PostPage({ params }: Partial<PostPageProps>) {
    const post = await getPost(params?.slug ?? "");
    return post ? <Post post={convertToPlainObject(post)} /> : <>Loading...</>;
}
