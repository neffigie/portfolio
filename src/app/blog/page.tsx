import { Heading, TagSelect, Text, Feed, FeedItem } from "components";
import { BlogPathName, getPostTags, getPosts } from "config";

export default async function PostNavigationPage() {
    const tags = await getPostTags();
    const posts = await (async () => {
        let posts = await getPosts();
        return posts?.map<FeedItem>((post) => ({
            id: post.image_src,
            image_src: post.image_src,
            image_alt: post.image_alt,
            title: post.title,
            tags: post.tags,
            description: post.description,
            date: post.date,
            url: `${BlogPathName}/${post.slug}`,
        }));
    })();
    return (
        <>
            <Heading>Blog ✏️</Heading>
            <Text fontSize="2xl">A collection of various write-ups on software development.</Text>
            <TagSelect tags={tags} />
            <Feed items={posts} paddingTop={12} />
        </>
    );
}
