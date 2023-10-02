import { Feed } from "components";
import { getPosts } from "config";

export default async function PostNavigationPage() {
    const posts = (await getPosts()) ?? undefined;
    return (
        <Feed
            title="Blog ✏️"
            subtitle="A collection of various write-ups on software development."
            items={posts}
            paddingTop={12}
        />
    );
}
