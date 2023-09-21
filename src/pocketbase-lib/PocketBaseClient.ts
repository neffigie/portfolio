import { environment } from "environment";
import {
    type NarrowCollectionExpand,
    type Collections,
    type CustomRecordListQueryParams,
    type RecordNames,
} from "pocketbase-lib";
import { omit } from "shared/object-util";

import PocketBase, { type FileQueryParams, type RecordListQueryParams } from "pocketbase";

/** Documentation modified from: https://github.com/pocketbase/js-sdk */

/** The PocketBase client. */
const pocketbase = new PocketBase(environment.NEXT_PUBLIC_POCKETBASE_URL);
pocketbase.autoCancellation(false);

/** Converts the `expand` property of a {@link CustomRecordListQueryParams} to a space-delimited string, if it exists. */
function convertParamsToPBParams(queryParams: CustomRecordListQueryParams<any> | undefined) {
    if (!queryParams) return {} as RecordListQueryParams;
    let res: RecordListQueryParams = omit(queryParams, "expand");
    res.expand = queryParams.expand?.join(" ");
    return res;
}

/**
 * Returns paginated items list.
 *
 * @template T The name of the record on which to perfom the request.
 *
 * @param collection The collection from which to fetch records.
 *
 * @param page The page (aka. offset) of the paginated list (default to 1).
 *
 * @param perPage Specify the max returned records per page (default to 30).
 *
 * @param queryParams The query parameters.
 */
export async function getList<T extends RecordNames, Q extends CustomRecordListQueryParams<T> | undefined>(
    collection: T,
    page?: number,
    perPage?: number,
    queryParams?: Q,
) {
    return await pocketbase
        .collection(collection)
        .getList<NarrowCollectionExpand<T, Q>>(page, perPage, convertParamsToPBParams(queryParams));
}

/**
 * Returns a promise with all list items batch fetched at once
 * (by default 200 items per request; to change it, set the `queryParams.batch` to the wanted value).
 *
 * @template T The name of the record on which to perfom the request.
 *
 * @param collection The collection from which to fetch records.
 *
 * @param queryParams The query parameters.
 */
export async function getFullList<T extends RecordNames, Q extends CustomRecordListQueryParams<T> | undefined>(
    collection: T,
    queryParams?: Q,
) {
    return await pocketbase
        .collection(collection)
        .getFullList<NarrowCollectionExpand<T, Q>>(convertParamsToPBParams(queryParams));
}

/**
 * Returns single item by its id.
 *
 * @template T The name of the record on which to perfom the request.
 *
 * @param id The id of the record to get.
 *
 * @param queryParams The query parameters.
 */
export async function getOne<T extends RecordNames, Q extends CustomRecordListQueryParams<T> | undefined>(
    collection: T,
    id: string,
    queryParams?: Q,
) {
    return pocketbase
        .collection(collection)
        .getOne<NarrowCollectionExpand<T, Q>>(id, convertParamsToPBParams(queryParams));
}

/**
 * Builds and returns an absolute record file url for the provided filename.
 *
 * @template T The name of the record on which to perfom the request.
 *
 * @param record The record containing the file.
 *
 * @param filename The name of the file within the record.
 *
 * @param queryParams The file query parameters.
 */
export function getUrl<T extends RecordNames>(
    record: Pick<Collections[T], "id" | "collectionId" | "collectionName">,
    filename: string,
    queryParams?: FileQueryParams,
) {
    return pocketbase.files.getUrl(record, filename, queryParams);
}

/**
 * Returns the first found item by the specified filter.
 *
 * @template T The name of the record on which to perfom the request.
 *
 * @template Q The query parameters.
 *
 * @param collection The collection from which to fetch records.
 *
 * @param filter The filter (e.g. `id='abc' && created>'2022-01-01'`). See {@link https://pocketbase.io/docs/api-rules-and-filters#filters-syntax} for the specification.
 *
 * @param queryParams The file query parameters.
 *
 * @remarks Internally it calls `getList(1, 1, { filter })` and returns the
 * first found item. For consistency with `getOne`, this method will throw a `404`
 * `ClientResponseError` if no item was found.
 */
export async function getFirstListItem<T extends RecordNames, Q extends CustomRecordListQueryParams<T> | undefined>(
    collection: T,
    filter: string,
    queryParams?: Q,
) {
    return pocketbase
        .collection(collection)
        .getFirstListItem<NarrowCollectionExpand<T, Q>>(filter, convertParamsToPBParams(queryParams));
}

export { pocketbase };
