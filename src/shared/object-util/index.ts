/**
 * Returns a subset of `T` with the specified keys.
 * @template T The type of the object.
 * @template TKey the object key type.
 * @param object The original object.
 * @param keys The keys to include in the new object subset.
 * @returns The new object subset.
 * @privateremarks modified from: https://stackoverflow.com/a/56592365
 */
export const pick = <T extends {}, TKey extends keyof T>(object: T, ...keys: TKey[]) =>
    Object.fromEntries(keys.filter((key) => key in object).map((key) => [key, object[key]])) as Pick<T, TKey>;

/**
 * Returns `T` with only the specified keys populated (i.e. the value of unspecified keys will become `undefined`).
 * @template T The type of the object.
 * @template TKey the object key type.
 * @param object The original object.
 * @param keys The keys to populate in the new object.
 * @returns The new object.
 * @privateremarks modified from: https://stackoverflow.com/a/56592365
 */
export const inclusivePick = <T extends {}, TKey extends PropertyKey>(object: T, ...keys: TKey[]) =>
    Object.fromEntries(keys.map((key) => [key, object[key as unknown as keyof T]])) as { [key in TKey]: key extends keyof T ? T[key] : undefined };

/**
 * Returns a subset of `T` with the specified keys removed.
 * @template T The type of the object.
 * @template TKey the object key type.
 * @param object The original object.
 * @param keys The keys to exclude from the object subset.
 * @returns The new object subset.
 * @privateremarks modified from: https://stackoverflow.com/a/56592365
 */
export const omit = <T extends {}, TKey extends keyof T>(object: T, ...keys: TKey[]) =>
    Object.fromEntries(Object.entries(object).filter(([key]) => !keys.includes(key as TKey))) as Omit<T, TKey>;

/**
 * Returns `true` if `value` is an `object`, `false` otherwise.
 * @privateremarks modified from: https://stackoverflow.com/a/8511350
 */
export const isObject = (value: any): value is object => typeof value === "object" && !Array.isArray(value) && value !== null;

/**
 * Returns an array of all properties
 * (including non-enumerable properties except for those which use Symbol) found directly in a given object
 * and those inherited from its prototype.
 * @privateremarks modified from: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyNames
 */
export const getAllPropertyNames = <T extends object>(object: T) => {
    const prototype = Object.getPrototypeOf(object);
    return Object.getOwnPropertyNames(object).concat(prototype ? Object.getOwnPropertyNames(prototype) : []);
};

/**
 * Converts a class, `clss`, to an object recursively.
 * @privateremarks modified from: https://stackoverflow.com/a/58568121
 */
export const classToObject = <T extends { [key: string]: any }>(clss: T) =>
    getAllPropertyNames(clss).reduce((object, key) => {
        const currentValue = clss[key];
        object[key as keyof T] = Array.isArray(currentValue)
            ? (currentValue as any[]).map(classToObject)
            : isObject(currentValue)
            ? classToObject(currentValue)
            : currentValue;
        return object;
    }, {} as T);

/**
 * Makes keys `K` partial in `T`.
 * @privateremarks modified from: https://stackoverflow.com/a/54178819
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
