"use client";

import { Tooltip } from "@chakra-ui/react";
import NextImage from "next/image";
import { type StaticImport } from "next/dist/shared/lib/get-img-props";

interface ImageProps extends React.ComponentProps<typeof NextImage> {
    /** The image source url. */
    src: string | StaticImport;

    /** The image alt text. */
    alt: string;

    /** The style properties, if any. */
    style?: React.CSSProperties;
}

/** The Next `Image` component wrapped in a tooltip with extra configuration. */
const Image = ({ src, alt, style, ...props }: ImageProps) => (
    <Tooltip label={alt} background="brand.100" color="gray.800" backdropFilter="saturate(180%) blur(2px)">
        <NextImage
            src={src}
            alt={alt}
            width={0}
            height={0}
            sizes="100vw"
            style={{ ...{ width: "100%", height: "auto" }, ...style }}
            {...props}
        />
    </Tooltip>
);

export { Image, type ImageProps };
