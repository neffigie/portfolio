import { revalidatePath } from 'next/cache';
import PocketBase, { Record } from 'pocketbase';
import { environment } from 'src/utils/environment/config';

/** The PocketBase client. */
const PocketBaseClient = new PocketBase(environment.NEXT_PUBLIC_POCKETBASE_URL); 

// TODO - add params documentation 

/**
 * Preforms a request on the {@link PocketBaseClient} and revalidates the path to ensure 
 * the information is always up-to-date on demand. 
 * @template T A wrapper type of the CRUD model.
 * @param resourcepath The resource path over which to perform the request. 
 * @returns The request data as `T`. 
 */
async function fetchPocketBase<T extends Record = Record>(resourcepath: `/api/${string}`){
    const res = await fetch(resourcepath) as unknown as T; 
    revalidatePath(resourcepath); 
    return res; 
}

/**
 * Returns paginated items list.
 *
 * @template T A wrapper type of the CRUD model.
 */
async function getList<T extends Record = Record>(collection: string, page?: number | undefined, perPage?: number | undefined, queryParams?: {} | undefined) {
    return await PocketBaseClient.collection(collection).getList<T>(page, perPage, queryParams); 
}

/**
 * Returns a promise with all list items batch fetched at once.
 *
 * @template T A wrapper type of the CRUD model.
 */
async function getFullList<T extends Record = Record>(collection: string, batchSize?: number | undefined, queryParams?: {} | undefined) {
    return await PocketBaseClient.collection(collection).getFullList<T>(batchSize, queryParams); 
}

/**
 * Returns single item by its id.
 *
 * @template T A wrapper type of the CRUD model.
 */
async function getOne<T extends Record = Record>(collection: string, id: string, queryParams?: {} | undefined) {
    return PocketBaseClient.collection(collection).getOne<T>(id, queryParams); 
}

/** 
 * Builds and returns an absolute record file url for the provided filename.
 */
function getFileUrl(record: Record, filename: string, reqConfig: {} = {}) {
    return PocketBaseClient.getFileUrl(record, filename, reqConfig)
}

/**
 * Returns the first found item by the specified filter.
 *
 * Internally it calls `getList(1, 1, { filter })` and returns the
 * first found item.
 *
 * @template T A wrapper type of the CRUD model.
 *
 * For consistency with `getOne`, this method will throw a 404
 * ClientResponseError if no item was found.
 * */
async function getFirstListItem<T extends Record = Record>(collection: string, filter: string, queryParams?: {} | undefined) {
    return PocketBaseClient.collection(collection).getFirstListItem<T>(filter, queryParams)
}

export { PocketBaseClient, fetchPocketBase, getList, getFullList, getOne, getFileUrl, getFirstListItem };
