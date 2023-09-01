/**
 * Removes all index signatures from `T`, if any.
 *
 * @template T the type.
 *
 * @example Given the interface `Foo`,
 *
 * ```ts
 * interface Foo { [key: string]: any; bar: string; };
 * ```
 *
 * it will become
 *
 * ```ts
 * interface Foo { bar: string; };
 * ```
 *
 * @remarks This is important in cases where an interface with index-able members
 * will lose its predefined members when used as a type.
 *
 * @privateremarks modified from: https://stackoverflow.com/a/66252656
 */
export type RemoveIndexSignatures<T extends object> = {
    [P in keyof T as string extends P ? never : number extends P ? never : symbol extends P ? never : P]: T[P];
};

/**
 * From `T`, produce a type where `string`, `number`, and `symbol` are not assignable to any properties.
 *
 * @template T The type.
 *
 * @example Given the interface,
 *
 * ```ts
 * interface Foo { foo: string; bar: 'test'; };
 * ```
 *
 * it will become
 *
 * ```ts
 * interface Foo { bar: 'test'; };
 * ```
 *
 * @remarks Using this type, you can differentiate between const and non const-asserted arrays, for example.
 */
export type RemovePropertyKeys<T extends object> = {
    [P in keyof T as string extends T[P] ? never : number extends T[P] ? never : symbol extends T[P] ? never : P]: T[P];
};

/**
 * Uses tail-recursion on conditional types to generate a union type of numbers from 0 to `TMax` exclusive.
 * @template TMax The exclusive maximum of the generated union type.
 * @template A An optional list of additional numbers to include in the enumeration.
 * @privateremarks Modified from https://stackoverflow.com/a/70307091
 */
export type Enumerate<TMax extends number, A extends number[] = []> = A["length"] extends TMax ? A[number] : Enumerate<TMax, [...A, A["length"]]>;

/**
 * Generates a union type of numbers from `TMin` to `TMax` exclusive.
 * @template TMin The minimum. Must be less than `TMax`.
 * @template TMax The maximum. Must be greater than `TMin`.
 * @remarks If `TMin` is greater than or equal to `TMax`, the resulting type will be `never`.
 * @privateremarks Modified from https://stackoverflow.com/a/70307091
 */
export type Range<TMin extends number, TMax extends number> = Exclude<Enumerate<TMax>, Enumerate<TMin>>;

/** From `T`, produce a type with at least one property from `T`. */
export type AtLeastOne<T extends object, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> & U[keyof U];

/** From `T`, produce a type that excludes empty objects. */
export type ExcludeEmpty<T extends object> = T extends AtLeastOne<T> ? T : never;

/** Removes the `readonly` modifier. Opposite of `ReadOnly<T>`. */
export type Mutable<T extends object> = { -readonly [P in keyof T]: T[P] };

/** Construct a union type with the properties of union type `T` except for those in type `K`. */
export type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

/**
 * Restricts `X` to be exactly of type `T`. Any excess properties of `X` not in `T` will be of type `never`.
 *
 * @remarks Useful in generic type parameters where you want `X` to be exactly of type `T` (i.e. `X extends Exactly<T, X>`).
 * ⚠️Widening the type will break this behavior.
 *
 * @privateremarks Modified from: https://github.com/microsoft/TypeScript/issues/12936#issuecomment-368244671. The over-arching
 * issue proposes a feature that will make this type obsolete, if adopted.
 */
export type Exactly<T extends object, X extends object> = T & Record<Exclude<keyof X, keyof T>, never>;

/**
 * Renames keys of `T` in `U` to their value in `U`.
 *
 * @privateremarks Modified from: https://stackoverflow.com/a/71912306
 */
export type Rename<T extends object, U extends Exactly<T, U>> = {
    [K in keyof T as K extends keyof U ? (U[K] extends string ? U[K] : never) : K]: K extends keyof T ? T[K] : never;
};

/** Types a class `T` with any constructor. */
export type Class<T = any> = new (...args: any[]) => T;

/**
 * The node type.
 * @privateremarks Modified from: https://github.com/jsdom/jsdom/blob/628d1f5/lib/jsdom/living/node-type.js
 */
export enum NodeType {
    ELEMENT_NODE = 1,
    /** ⚠️ historical **/
    ATTRIBUTE_NODE = 2,
    TEXT_NODE = 3,
    /** ⚠️ historical **/
    CDATA_SECTION_NODE = 4,
    /** ⚠️ historical **/
    ENTITY_REFERENCE_NODE = 5,
    /** ⚠️ historical **/
    ENTITY_NODE = 6,
    PROCESSING_INSTRUCTION_NODE = 7,
    COMMENT_NODE = 8,
    DOCUMENT_NODE = 9,
    DOCUMENT_TYPE_NODE = 10,
    DOCUMENT_FRAGMENT_NODE = 11,
    /** ⚠️ historical **/
    NOTATION_NODE = 12,
}
