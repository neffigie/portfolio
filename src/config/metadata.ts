import { environment } from "environment";
import { Metadata } from "next";
import { OpenGraph, OpenGraphType } from "next/dist/lib/metadata/types/opengraph-types";

export interface PageMetadata extends Metadata {
    title?: string;
    description?: string;
    publishedTime: string;
    type: OpenGraphType;
    images?: OpenGraph["images"];
    locale: OpenGraph["locale"];
}

/**
 * Returns the metadata that should be exported for a page containing the `post`.
 * @remarks see: https://nextjs.org/docs/app/building-your-application/optimizing/metadata#dynamic-metadata
 */
export function generatePageMetadata({
    title,
    description,
    publishedTime,
    type,
    images,
    locale,
    ...props
}: PageMetadata): Metadata {
    const resolved = title
        ? `${title} | ${environment.NEXT_PUBLIC_METADATA_SITE_NAME}`
        : environment.NEXT_PUBLIC_METADATA_SITE_NAME;
    const resolvedDescription = description ?? environment.NEXT_PUBLIC_METADATA_DESCRIPTION;
    return {
        ...{
            metadataBase: new URL(environment.NEXT_PUBLIC_METADATA_BASE),
            title: resolved,
            description: resolvedDescription,
            publisher: environment.NEXT_PUBLIC_METADATA_AUTHOR,
            creator: environment.NEXT_PUBLIC_METADATA_AUTHOR,
            // colorScheme: "light",
            openGraph: {
                url: "./",
                title: resolved,
                description: resolvedDescription,
                locale: locale,
                publishedTime: publishedTime,
                type: type,
                images: images,
                authors: environment.NEXT_PUBLIC_METADATA_AUTHOR,
                siteName: environment.NEXT_PUBLIC_METADATA_SITE_NAME,
            },
            twitter: {
                title: resolved,
                description: resolvedDescription,
                card: "summary_large_image",
                images: images,
            },
        },
        ...props,
    };
}
