"use client";

import { Box, Skeleton, SkeletonText, Text } from "@chakra-ui/react";
import { ProjectFeed } from "components";
import { FeedItem } from "components/feed";
import { FluidText } from "components/fluid-text";
import { MainContainer } from "components/main-container";
import { SearchFilter } from "components/search-filter";
import { Tag } from "components/tags";
import { useMemo, useState } from "react";

export function ProjectsContent({ projects, isLoading }: { projects: FeedItem[] | undefined; isLoading?: boolean }) {
    const [search, setSearch] = useState("");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    // Derive unique tags from all projects
    const allTags = useMemo<Tag[]>(() => {
        const seen = new Set<string>();
        const tags: Tag[] = [];
        for (const item of projects ?? []) {
            for (const tag of item.tags) {
                if (!seen.has(tag.id)) {
                    seen.add(tag.id);
                    tags.push(tag);
                }
            }
        }
        return tags;
    }, [projects]);

    // Filter projects by search query and selected tags
    const filtered = useMemo(() => {
        if (!projects) return projects;
        const q = search.toLowerCase();
        return projects.filter((item) => {
            const matchesSearch =
                !q ||
                item.title.toLowerCase().includes(q) ||
                item.description.toLowerCase().includes(q);
            const matchesTags =
                selectedTags.length === 0 ||
                item.tags.some((t) => selectedTags.includes(t.name));
            return matchesSearch && matchesTags;
        });
    }, [projects, search, selectedTags]);

    return (
        <>
            {/* ── Page Hero ──────────────────────────────────────── */}
            <Box as="section" bg="surface.muted" pt={{ base: 10, md: 14 }} pb={{ base: 6, md: 8 }}>
                <MainContainer>
                    {isLoading ? (
                        <Skeleton
                            height={{ base: "44px", md: "56px" }}
                            width="7ch"
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
                            <FluidText gradient>Projects.</FluidText>
                        </Text>
                    )}
                    {isLoading ? (
                        <SkeletonText noOfLines={1} maxW="22ch" startColor="surface.soft" endColor="surface.border" />
                    ) : (
                        <Text fontFamily="body" fontSize="sm" color="ink.muted" lineHeight="1.7">
                            <FluidText>Software, games, and creative tooling.</FluidText>
                        </Text>
                    )}
                </MainContainer>
            </Box>

            {/* ── Projects ───────────────────────────────────────── */}
            <Box as="section" bg="surface.elevated" py={{ base: 8, md: 12 }}>
                <MainContainer>
                    <SearchFilter
                        tags={allTags}
                        search={search}
                        selectedTags={selectedTags}
                        onSearchChange={setSearch}
                        onTagsChange={setSelectedTags}
                        placeholder="Search projects…"
                        isLoading={isLoading}
                    />
                    <ProjectFeed items={filtered} isLoading={isLoading} />
                </MainContainer>
            </Box>
        </>
    );
}
