"use client"

import GiscusBase from "@giscus/react"
import { environment } from "src/utils/environment/cleaner"

/** Renders `giscus` using its respective `enviornment` variables. */
const Giscus = ({ darkTheme }: { darkTheme: boolean }) => {
    return <GiscusBase
        repo={environment.NEXT_PUBLIC_GISCUS_REPOSITORY}
        repoId={environment.NEXT_PUBLIC_GISCUS_REPOSITORY_ID}
        category={environment.NEXT_PUBLIC_GISCUS_CATEGORY}
        categoryId={environment.NEXT_PUBLIC_GISCUS_CATEGORY_ID}
        mapping={environment.NEXT_PUBLIC_GISCUS_MAPPING}
        strict={environment.NEXT_PUBLIC_GISCUS_STRICT}
        reactionsEnabled={environment.NEXT_PUBLIC_GISCUS_REACTIONS_ENABLED}    
        emitMetadata="0"
        inputPosition="top"
        theme={darkTheme ? 'dark' : 'light'}
        loading="lazy"
    />;
}

export { Giscus };
