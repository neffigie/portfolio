"use client";

import type { CSSProperties } from "react";
import { TagsProps } from "./types";

const wrapStyle: CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
};

const tagStyle: CSSProperties = {
    backdropFilter: "blur(8px)",
    background: "rgba(234,223,194,0.42)",
    border: "1px solid rgba(216,190,198,0.55)",
    borderRadius: "9999px",
    color: "var(--chakra-colors-ink-muted)",
    fontFamily: "var(--chakra-fonts-body)",
    fontSize: "9px",
    letterSpacing: "0.1em",
    padding: "4px 12px",
    textTransform: "uppercase",
};

/** Displays a group of soft accent tag chip(s). */
export default function Tags({ tags, style, ...props }: TagsProps) {
    const getItem = (name: string, key?: string) => (
        <span key={key ?? name} style={tagStyle}>
            {name}
        </span>
    );
    return (
        <div style={{ ...wrapStyle, ...style }} {...props}>
            {Array.isArray(tags) ? tags.map((tag) => getItem(tag.name, tag.id)) : getItem(tags.name)}
        </div>
    );
}
