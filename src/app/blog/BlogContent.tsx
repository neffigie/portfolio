"use client";

import { Box, Text } from "@chakra-ui/react";
import { Feed } from "components";
import { FeedItem } from "components/feed";
import { FluidText } from "components/fluid-text";
import { MainContainer } from "components/main-container";
import { SearchFilter } from "components/search-filter";
import { Tag } from "components/tags";
import { useMemo, useState } from "react";

export function BlogContent({ posts }: { posts: FeedItem[] | undefined }) {
    const [search, setSearch] = useState("");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    // Derive unique tags from all posts
    const allTags = useMemo<Tag[]>(() => {
        const seen = new Set<string>();
        const tags: Tag[] = [];
        for (const item of posts ?? []) {
            for (const tag of item.tags) {
                if (!seen.has(tag.id)) {
                    seen.add(tag.id);
                    tags.push(tag);
                }
            }
        }
        return tags;
    }, [posts]);

    // Filter posts by search query and selected tags
    const filtered = useMemo(() => {
        if (!posts) return posts;
        const q = search.toLowerCase();
        return posts.filter((item) => {
            const matchesSearch =
                !q ||
                item.title.toLowerCase().includes(q) ||
                item.description.toLowerCase().includes(q);
            const matchesTags =
                selectedTags.length === 0 ||
                item.tags.some((t) => selectedTags.includes(t.name));
            return matchesSearch && matchesTags;
        });
    }, [posts, search, selectedTags]);

    return (
        <>
            {/* ── Page Hero ──────────────────────────────────────── */}
            <Box as="section" bg="surface.containerLow" pt={{ base: 16, md: 24 }} pb={{ base: 12, md: 16 }}>
                <MainContainer>
                    <Text
                        fontSize="10px"
                        letterSpacing="0.14em"
                        textTransform="uppercase"
                        color="ink.muted"
                        fontFamily="heading"
                        mb={4}
                    >
                        <FluidText>The archive</FluidText>
                    </Text>
                    <Text
                        as="h1"
                        fontFamily="heading"
                        fontStyle="italic"
                        fontSize={{ base: "5xl", md: "7xl" }}
                        lineHeight="0.92"
                        letterSpacing="-0.02em"
                        mb={6}
                    >
                        <FluidText gradient>Writings.</FluidText>
                    </Text>
                    <Text
                        fontFamily="body"
                        fontSize="sm"
                        color="ink.muted"
                        maxW="48ch"
                        lineHeight="1.7"
                    >
                        <FluidText>A collection of write-ups on software development, game design, and the craft of building thoughtful digital systems.</FluidText>
                    </Text>
                </MainContainer>
            </Box>

            {/* ── Feed ───────────────────────────────────────────── */}
            <Box as="section" bg="surface.bright" py={{ base: 12, md: 20 }}>
                <MainContainer>
                    <SearchFilter
                        tags={allTags}
                        search={search}
                        selectedTags={selectedTags}
                        onSearchChange={setSearch}
                        onTagsChange={setSelectedTags}
                        placeholder="Search posts…"
                    />
                    <Feed items={filtered} />
                </MainContainer>
            </Box>
        </>
    );
}
