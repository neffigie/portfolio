"use client";

import { Box, Text } from "@chakra-ui/react";
import { ProjectFeed } from "components";
import { FeedItem } from "components/feed";
import { FluidText } from "components/fluid-text";
import { MainContainer } from "components/main-container";
import { SearchFilter } from "components/search-filter";
import { Tag } from "components/tags";
import { useMemo, useState } from "react";

export function ProjectsContent({ projects }: { projects: FeedItem[] | undefined }) {
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
            <Box as="section" bg="surface.containerLow" pt={{ base: 16, md: 24 }} pb={{ base: 16, md: 20 }}>
                <MainContainer>
                    <Text
                        fontSize="10px"
                        letterSpacing="0.14em"
                        textTransform="uppercase"
                        color="ink.muted"
                        fontFamily="heading"
                        mb={4}
                    >
                        <FluidText>The curated collection</FluidText>
                    </Text>
                    <Text
                        as="h1"
                        fontFamily="heading"
                        fontStyle="italic"
                        fontSize={{ base: "5xl", md: "7xl", lg: "8xl" }}
                        lineHeight="0.92"
                        letterSpacing="-0.02em"
                        mb={8}
                    >
                        <FluidText gradient>Exhibit</FluidText>
                        <br />
                        <FluidText gradient>Pieces.</FluidText>
                    </Text>
                    <Text
                        fontFamily="body"
                        fontSize="sm"
                        color="ink.muted"
                        maxW="50ch"
                        lineHeight="1.7"
                    >
                        <FluidText>A non-standard exploration of digital craftsmanship. Each entry is a study in interaction, form, and purpose — presented as individual moments of intent.</FluidText>
                    </Text>
                </MainContainer>
            </Box>

            {/* ── Projects ───────────────────────────────────────── */}
            <Box as="section" bg="surface.bright" py={{ base: 8, md: 12 }}>
                <MainContainer>
                    <SearchFilter
                        tags={allTags}
                        search={search}
                        selectedTags={selectedTags}
                        onSearchChange={setSearch}
                        onTagsChange={setSelectedTags}
                        placeholder="Search projects…"
                    />
                    <ProjectFeed items={filtered} />
                </MainContainer>
            </Box>
        </>
    );
}
