/** This file was partially @generated using pocketbase-typegen */

import { type Exactly, type RemoveIndexSignatures } from "shared/types";
import { type ListQueryParams, type Record, type RecordQueryParams, type RecordListQueryParams } from "pocketbase";

/** A type containing all expandable fields of every Record */
export type ExpandableRecords<T extends RecordNames> = "expand" extends keyof Collections[T]
    ? Collections[T]["expand"]
    : undefined;

/**
 * Query parameters for record list query service.
 *
 * @remarks Contrary to PocketBase's {@link RecordListQueryParams},
 * this app's {@link CustomRecordListQueryParams} uses an array to represent it's `expand` in order to enforce maximal type safety.
 */
export interface CustomRecordListQueryParams<T extends RecordNames>
    extends ListQueryParams,
        Omit<RecordQueryParams, "expand"> {
    /** The record to expand. */
    expand?: (keyof ExpandableRecords<T> & string)[];
}

/**
 * A {@link Record} with the added base system fields, less the `expand` property and any index signatures.
 * @remarks To see the expanded relationships of the record, use `Collections[name].expand`,
 * where `name` is the name of the record.
 */
export type BaseSystemRecord = {
    id: RecordIdString;
    created: IsoDateString;
    updated: IsoDateString;
} & Omit<RemoveIndexSignatures<Record>, "expand">;

/**
 * From a {@link BaseSystemRecord}, `T`, add an `expand` property with its expanded from, `TRelationship`, if any.
 *
 * @template T The record.
 *
 * @template TRelationship the relationship(s) of the `T`.
 * The key is name of property on `T` that is expanded. ⚠️ You cannot expand keys of {@link BaseSystemRecord} (e.g. `collectionId`),
 * and the value is the type of the expanded `BaseSystemRecord` record.
 */
export type Expand<
    T extends BaseSystemRecord,
    TRelationship extends Exactly<
        { [field in keyof Omit<T, keyof BaseSystemRecord>]?: BaseSystemRecord },
        TRelationship
    > = never,
> = T & {
    expand: [TRelationship] extends [never] ? undefined : TRelationship;
};

/**
 * Narrows the `expand` property of `Collection[T]` to only include properties that are included in `E["expand"]`.
 *
 * @template T The name of the record.
 *
 * @template E The expanded fields of `T`.
 *
 * @remarks If `Collection[T]` has no expandable fields, returns as is.
 * Similarly, if `E` is undefined, `Collection[T]["expand"]` will be too.
 */
export type ExpandCollection<
    T extends RecordNames,
    E extends { expand?: (keyof ExpandableRecords<T>)[] } | undefined,
> = Omit<Collections[T], "expand"> & {
    expand: Collections[T]["expand"] extends undefined
        ? undefined
        : "expand" extends keyof E
        ? {
              [P in E["expand"][keyof E["expand"]] as P extends string
                  ? P
                  : never]: P extends keyof Collections[T]["expand"] ? Collections[T]["expand"][P][] : never;
          }
        : undefined;
};

/** The available record names. */
export type RecordNames = keyof Collections;

/** The available records. */
export type Records = Collections[RecordNames];

// Alias types for improved usability
export type IsoDateString = string;
export type RecordIdString = string;
export type HTMLString = string;

/***************************** Record Types for each collection *****************************/

/** Maps record names to their {@link Records} with all their relationships expanded. */
export type Collections = {
    files: Expand<FilesRecord>;
    categories: Expand<CategoriesRecord>;
    posts: Expand<
        PostsRecord,
        {
            categories: CategoriesRecord;
        }
    >;
    projects: Expand<
        ProjectsRecord,
        {
            categories: CategoriesRecord;
        }
    >;
};

export type FilesRecord = {
    name: string;
    field: string;
} & BaseSystemRecord;

export type CategoriesRecord = {
    name: string;
    short_description: string;
    long_description: HTMLString;
} & BaseSystemRecord;

export type PostsRecord = {
    slug: string;
    title: string;
    description: string;
    image: string;
    image_alt: string;
    date: IsoDateString;
    body: HTMLString;
    categories: RecordIdString[];
    legacy: boolean;
} & BaseSystemRecord;

export type ProjectsRecord = {
    title: string;
    date: string;
    description: HTMLString;
    banner: string;
    url: string;
    github_page: string;
    categories: RecordIdString[];
} & BaseSystemRecord;

export type UsersRecord = {
    name?: string;
    avatar?: string;
} & BaseSystemRecord;
