import PocketBase, { ListResult, Record } from 'pocketbase';

const PocketBaseClient = new PocketBase("https://pocketbase-docker.fly.dev/"); // TODO - use env var

/**
 * Performs a query on PocketBase
 * @param request the async request to perform
 * @returns the results of the query
 */
export async function request(request: (client: PocketBase) => Promise<any>) {
    return await request(PocketBaseClient); 
}

/** @see request GetList wrapper */
export async function getList(collection: string, page?: number | undefined, perPage?: number | undefined, queryParams?: {} | undefined): Promise<ListResult<Record>> {
    return request((client) => client.collection(collection).getList(page, perPage, queryParams)); 
}

/** @see request GetList wrapper */
export async function getFullList(collection: string, batchSize?: number | undefined, queryParams?: {} | undefined): Promise<Record[]> {
    return request((client) => client.collection(collection).getFullList(batchSize, queryParams)); 
}

/** @see request GetOne wrapper */
export async function getOne(collection: string, id: string, queryParams?: {} | undefined): Promise<any> {
    return request((client) => client.collection(collection).getOne(id, queryParams)); 
}

/** @see request GetFileUrl wrapper */
export function getFileUrl(record: Record, filename: string, reqConfig: {} = {}): string {
    return PocketBaseClient.getFileUrl(record, filename, reqConfig)
}

/** @see request GetFirstListItem wrapper */
export async function getFirstListItem(collection: string, filter: string, queryParams?: {} | undefined): Promise<Record>{
    return PocketBaseClient.collection(collection).getFirstListItem(filter, queryParams)
}

export default PocketBaseClient; 