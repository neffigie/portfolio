"use client";

import { Box, Skeleton, SkeletonText, Text } from "@chakra-ui/react";
import { Feed } from "components";
import { FeedItem } from "components/feed";
import { FluidText } from "components/fluid-text";
import { MainContainer } from "components/main-container";
import { SearchFilter } from "components/search-filter";
import { Tag } from "components/tags";
import { useMemo, useState } from "react";

export function BlogContent({ posts, isLoading }: { posts: FeedItem[] | undefined; isLoading?: boolean }) {
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
            <Box as="section" bg="surface.muted" pt={{ base: 10, md: 14 }} pb={{ base: 6, md: 8 }}>
                <MainContainer>
                    {isLoading ? (
                        <Skeleton
                            height={{ base: "44px", md: "56px" }}
                            width="4ch"
                            borderRadius="sm"
                            startColor="surface.soft"
                            endColor="surface.border"
                            mb={3}
                        />
                    ) : (
                        <Text
                            as="h1"
                            fontFamily="heading"
                            fontStyle="italic"
                            fontSize={{ base: "4xl", md: "5xl" }}
                            lineHeight="0.92"
                            letterSpacing="-0.02em"
                            mb={3}
                        >
                            <FluidText gradient>Blog.</FluidText>
                        </Text>
                    )}
                    {isLoading ? (
                        <SkeletonText noOfLines={1} maxW="36ch" startColor="surface.soft" endColor="surface.border" />
                    ) : (
                        <Text fontFamily="body" fontSize="sm" color="ink.muted" lineHeight="1.7">
                            <FluidText>Write-ups on software, game design, and building digital systems.</FluidText>
                        </Text>
                    )}
                </MainContainer>
            </Box>

            {/* ── Feed ───────────────────────────────────────────── */}
            <Box as="section" bg="surface.elevated" py={{ base: 12, md: 20 }}>
                <MainContainer>
                    <SearchFilter
                        tags={allTags}
                        search={search}
                        selectedTags={selectedTags}
                        onSearchChange={setSearch}
                        onTagsChange={setSelectedTags}
                        placeholder="Search posts…"
                        isLoading={isLoading}
                    />
                    <Feed items={filtered} isLoading={isLoading} />
                </MainContainer>
            </Box>
        </>
    );
}
