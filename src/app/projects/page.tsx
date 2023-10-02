import { Feed } from "components";
import { getProjects } from "config";

export const fetchCache = "force-no-store";

export default async function ProjectsPage() {
    const posts = (await getProjects()) ?? undefined;
    return (
        <Feed
            title="Projects 🕹️"
            subtitle="Take a look at of some of the projects that I've worked on."
            items={posts}
            paddingTop={12}
        />
    );
}
