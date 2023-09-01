import { BaseSystemRecord } from "pocketbase-lib/pocketbase-types";
import { Class } from "shared/types";

/** Converts a date in `YYYY-MM-DD` format to `Month Day, Year`.*/
export const convertPBDateToDate = (date: string) => {
	const match = /(\d{4})-(\d{2})-(\d{2})/.exec(date);
	if (!match) return undefined;
	return new Date(+match[1], +match[2], +match[3]).toLocaleDateString("default", { month: "long", day: "numeric", year: "numeric" });
};

/**
 * Converts a {@link Collections} to a plain object.
 * @remarks ⚠️ Only plain objects can be passed to Client Components from Server Components. Classes or other objects with methods are not supported.
 */
export function convertToPlainObject<T extends BaseSystemRecord>(collections: T): Exclude<T, Function | Class>;
export function convertToPlainObject<T extends BaseSystemRecord[]>(collections: T): Exclude<T, Function | Class>[];
export function convertToPlainObject<T extends BaseSystemRecord | BaseSystemRecord[]>(
	collections: T
): Exclude<T, Function | Class> | Exclude<T, Function | Class>[] {
	/** Removes properties assignable to `function` and `object` from `T` (https://github.com/vercel/next.js/issues/11993#issuecomment-617375501). */
	const deleteServerOnlyProps = (collection: BaseSystemRecord) => JSON.parse(JSON.stringify(collection));
	return Array.isArray(collections)
		? (collections.map((x) => deleteServerOnlyProps(x)) as Exclude<T, Function | Class>[])
		: (deleteServerOnlyProps(collections) as Exclude<T, Function | Class>);
}
