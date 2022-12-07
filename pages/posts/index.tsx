import NavigationHeader from "components/NavigationHeader";
import Navigation from "components/Navigation";

export default function PostsPage() {
    return (
        <>
            <NavigationHeader title="Blog" subtitle="A collection of various write-ups on software development."/>
            <Navigation postTypes={["blog"]}/>
        </>
    );
}