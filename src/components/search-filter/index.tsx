"use client";

import { Box, Flex, Input } from "@chakra-ui/react";
import { Tag, TagSelect } from "components/tags";
import { MdClose, MdSearch } from "react-icons/md";

interface SearchFilterProps {
    tags: Tag[];
    search: string;
    selectedTags: string[];
    onSearchChange: (v: string) => void;
    onTagsChange: (v: string[]) => void;
    placeholder?: string;
}

/** Search bar + floating tag pills. Search bar fades into the page background. */
export function SearchFilter({
    tags,
    search,
    selectedTags,
    onSearchChange,
    onTagsChange,
    placeholder = "Search…",
}: SearchFilterProps) {
    return (
        <Box mb={10}>
            {/* Search input — gradient from pure white to page background, no border */}
            <Box
                sx={{
                    background: "linear-gradient(to right, #ffffff, #f9f9f8)",
                }}
                backdropFilter="blur(8px)"
                borderRadius="xl"
                mb={1}
            >
                <Flex align="center" gap={3} px={{ base: 4, md: 6 }} py={{ base: 3, md: 4 }}>
                    <Box color="ink.faint" flexShrink={0} display="flex" alignItems="center">
                        <MdSearch size={18} />
                    </Box>
                    <Input
                        variant="unstyled"
                        placeholder={placeholder}
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        fontFamily="body"
                        fontSize="sm"
                        color="ink.primary"
                        _placeholder={{ color: "ink.faint" }}
                    />
                    {search && (
                        <Box
                            as="button"
                            onClick={() => onSearchChange("")}
                            color="ink.faint"
                            display="flex"
                            alignItems="center"
                            flexShrink={0}
                            _hover={{ color: "ink.primary" }}
                            transition="color 0.15s ease"
                            aria-label="Clear search"
                        >
                            <MdClose size={16} />
                        </Box>
                    )}
                </Flex>
            </Box>

            {/* Tags float freely — no wrapper box, no divider */}
            {tags.length > 0 && (
                <TagSelect
                    tags={tags}
                    value={selectedTags}
                    onChange={onTagsChange}
                />
            )}
        </Box>
    );
}
