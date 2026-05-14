import { type Metadata } from "next";
import { Post } from "components";
import { getPost, generatePageMetadata } from "config";

interface PostPageProps {
    params: Promise<{ slug: string }>;
}

// see: https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#fetchcache
export const fetchCache = "force-no-store";

// see: https://nextjs.org/docs/app/building-your-application/optimizing/metadata#dynamic-metadata
export const generateMetadata = async ({ params }: PostPageProps): Promise<Metadata> => {
    const { slug } = await params;
    const post = await getPost(slug);
    return post
        ? generatePageMetadata({
              title: post.title,
              description: post.description,
              publishedTime: post.date,
              type: "article",
              images: [{ url: post.image_src }],
              locale: "en_US",
          })
        : {};
};

export default async function PostPage({ params }: PostPageProps) {
    const { slug } = await params;
    const post = await getPost(slug);
    return post ? <Post post={post} /> : <></>;
}
