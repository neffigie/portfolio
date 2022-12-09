import NavigationHeader from "app/components/NavigationHeader";
import Navigation from "app/components/Navigation";

export default function PostsPage() {
    return (
        <>
            <NavigationHeader title="Blog" subtitle="A collection of various write-ups on software development."/>
            <Navigation postTypes={["blog"]}/>
        </>
    );
}