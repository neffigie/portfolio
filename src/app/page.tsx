import "css/nprogress/nprogress.css";

import { generatePageMetadata, getProjects, getResumeURL } from "config";
import { HomeContent } from "./HomeContent";

export function generateMetadata() {
    return generatePageMetadata({
        publishedTime: "2023",
        type: "website",
        locale: "en_US",
    });
}

export default async function HomePage() {
    const [allProjects, resumeUrl] = await Promise.all([getProjects(), getResumeURL()]);
    const featured = (allProjects ?? []).slice(0, 3);
    return <HomeContent featured={featured} resumeUrl={resumeUrl ?? ""} />;
}
