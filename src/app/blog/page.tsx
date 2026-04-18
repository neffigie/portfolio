import { getPosts } from "config";
import { BlogContent } from "./BlogContent";

export const fetchCache = "force-no-store";

export default async function PostNavigationPage() {
    const posts = (await getPosts()) ?? undefined;
    return <BlogContent posts={posts} />;
}
