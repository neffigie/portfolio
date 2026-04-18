import { getProjects } from "config";
import { ProjectsContent } from "./ProjectsContent";

export const fetchCache = "force-no-store";

export default async function ProjectsPage() {
    const projects = (await getProjects()) ?? undefined;
    return <ProjectsContent projects={projects} />;
}
