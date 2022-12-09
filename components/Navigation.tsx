"use client"; 
import { getList, getFullList, getFileUrl } from "globals/PocketBaseClient";
import React, { useState, useEffect } from "react";

import { Skeleton, CardMedia, Box, Autocomplete, TextField, Typography, Chip, Checkbox, FormGroup, FormControlLabel, Stack, Grid, Container } from '@mui/material';
import PostTags from "./PostTags";
import { Record } from "pocketbase";
import NavigationCard from "./NavigationCard";
import Link from "next/link";


class TagFilter {
    /** Contains the tag current filtered */
    public active: string[]; 

    constructor(); 
    constructor(active: string[]); 
    public constructor(active?: string[]) {
        if (active) this.active = active; 
        else this.active = new Array<string>(); 
    }

    /** Removes a tag from the filter */
    public remove (item: string): TagFilter { 
        this.active = this.active.filter((x) => x !== item); 
        return this.copy(); 
    }

    /** Adds a tag to the filter*/
    public push (item: string): TagFilter { 
        this.active.push(item); 
        return this.copy(); 
    }

    /** Removes a tag if active, adds otherwise */
    public toggle (item: string): TagFilter { 
        this.isActive(item) ? this.remove(item) : this.push(item); 
        return this.copy(); 
    }

    /** Returns a shallow copy of this */
    public copy(): TagFilter {
        return new TagFilter(this.active); 
    }

    /** Determines if item is filtered */
    isActive(item: string): boolean; 
    /** Determines if any items are filtered */
    isActive(items: string[]): boolean; 
    public isActive(item: string | string[]): boolean {
        const includes = (item: string) =>  this.active.includes(item); 
        if (typeof item === 'string') return includes(item); 
        if (Array.isArray(item) && item.length > 0) return this.active.some(includes); 
        return false; 
    }
}

export default function Navigation({ postTypes }: { postTypes: ('blog' | 'project')[]}) {
    const postsPerPage = 3; 
    const [posts, setPosts] = useState<Record[]>([]); 
    const [categories, setCategories] = useState<Record[]>([]); 
    const [types, setTypes] = useState<Record[]>([]); 
    const [categoryFilter, setCategoryFilter] = useState<TagFilter>(new TagFilter()); 
    const [typeFilter, setTypeFilter] = useState<TagFilter>(new TagFilter(postTypes)); 

    useEffect(() => {
        const fetch = async() => Promise.all([
            getList('posts', 1, 50, { sort: '-date', expand: 'categories' }), 
            getFullList('post_categories', undefined, { sort: '+name' }), 
            getFullList('post_types', undefined, { sort: '+name' })
        ]).then((promises) => {
            setPosts(promises[0].items); 
            setCategories(promises[1]); 
            setTypes(promises[2]); 
        }); 
        fetch().catch(console.log); 
    }, []); 

    return (
        <> 
            { posts.length === 0 && (
                [...Array(postsPerPage)].map((_, i) => (
                    <Box key={i} sx={{ width: 1, mb: 3 }}>
                        <NavigationCard 
                            href=""
                            media={<Skeleton variant="rounded" sx={{height: 200}}/>}
                            title={<Skeleton variant="text"/>}
                            body={<Skeleton variant="text"/>}
                            categories={<Chip sx={{width: 75}}/>}
                            horizontal={false}
                        />
                    </Box>
                ))
            )}
            { posts.length > 0 && ( 
                <>
                    <Autocomplete
                        freeSolo
                        options={posts.map((post: any, i) => <React.Fragment key={i}>{post.title}</React.Fragment>)}
                        renderInput={(params) => <TextField {...params} label="Search"/>}
                        sx={{ mt: 2, mb: 2 }}
                    />
                    <FormGroup>
                        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                            {categories.map(x => <FormControlLabel key={x.id} control={<Checkbox/>} label={x.name}/>)}
                            <Link href="/posts/tags">All tags...</Link>
                        </Stack>
                    </FormGroup>
                    <hr/>
                    <Grid container spacing={2}>
                        {posts.map((post, i) => {
                            const { id, date, updated, alt, body, image, slug, subtitle, expand, title, type } = post; 
                            const isFirst = i == 0; 
                            return ( 
                                <Grid item={true} xs={isFirst ? 12: 6} sx={{ width: 1, mb: 3 }} key={id}>
                                    <NavigationCard 
                                        media={
                                            <CardMedia 
                                                component="img" 
                                                image={getFileUrl(post, image)} 
                                                alt={alt}
                                            />
                                        }
                                        href={`posts/${slug}`}
                                        title={<Typography gutterBottom variant="h5">{title}</Typography>}
                                        body={<Typography variant="subtitle2">{subtitle}</Typography>}
                                        categories={<PostTags tags={expand.categories}/>}
                                        horizontal={isFirst}
                                    />
                                </Grid>
                            ); 
                        })}
                    </Grid>
                </>
            )}
        </>
    )
}