"use client";

import { ColorMode, Divider } from "@chakra-ui/react";
import GiscusBase from "@giscus/react";
import { environment } from "environment";

/** Renders `giscus` using its respective `enviornment` variables. */
const Giscus = ({
    colorMode,
}: {
    /** The color mode. */
    colorMode: ColorMode;
}) => {
    return (
        <>
            <Divider mt={16} mb={4} p={4} />
            <GiscusBase
                repo={environment.NEXT_PUBLIC_GISCUS_REPOSITORY}
                repoId={environment.NEXT_PUBLIC_GISCUS_REPOSITORY_ID}
                category={environment.NEXT_PUBLIC_GISCUS_CATEGORY}
                categoryId={environment.NEXT_PUBLIC_GISCUS_CATEGORY_ID}
                mapping={environment.NEXT_PUBLIC_GISCUS_MAPPING}
                strict={environment.NEXT_PUBLIC_GISCUS_STRICT}
                reactionsEnabled={environment.NEXT_PUBLIC_GISCUS_REACTIONS_ENABLED}
                emitMetadata="0"
                inputPosition="top"
                theme={colorMode}
                loading="lazy"
                lang="en"
            />
        </>
    );
};

export { Giscus };
