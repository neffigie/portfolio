import { NodeType } from "shared/types";

/**
 * Replaces a `string` with a properly formatted slug.
 * @privateremarks Modified from: http://dense13.com/blog/2009/05/03/converting-string-to-slug-javascript/
 */
export function generateSlug(from: string): string;
export function generateSlug(from: ChildNode | ParentNode | Node): string | undefined;
export function generateSlug(from: string | ChildNode | ParentNode | Node): string | undefined;
export function generateSlug(from: string | ChildNode | ParentNode | Node): string | undefined {
    if (!from) return undefined;
    let string: string | undefined = undefined;
    if (typeof from === "string") string = from;
    else if ("nodeType" in from && isText(from)) string = `${from.data}`;
    if (!string) return undefined;

    string = string.replace(/^\s+|\s+$/g, ""); // trim
    string = string.toLowerCase();

    // remove accents, swap ñ for n, etc
    let source =
        "ÁÄÂÀÃÅČÇĆĎÉĚËÈÊẼĔȆĞÍÌÎÏİŇÑÓÖÒÔÕØŘŔŠŞŤÚŮÜÙÛÝŸŽáäâàãåčçćďéěëèêẽĕȇğíìîïıňñóöòôõøðřŕšşťúůüùûýÿžþÞĐđßÆa·/_,:;";
    let target =
        "AAAAAACCCDEEEEEEEEGIIIIINNOOOOOORRSSTUUUUUYYZaaaaaacccdeeeeeeeegiiiiinnooooooorrsstuuuuuyyzbBDdBAa------";
    for (let i = 0, l = source.length; i < l; i++) {
        string = string.replace(new RegExp(source.charAt(i), "g"), target.charAt(i));
    }

    string = string.replace(/[^a-zA-Z0-9- ]/g, ""); // remove non-alphanumeric characters except dash and space

    string = string
        .replace(/[^a-z0-9 -]/g, "") // remove invalid chars
        .replace(/\s+/g, "-") // collapse whitespace and replace by -
        .replace(/-+/g, "-"); // collapse dashes

    return string;
}

/** Returns `true` if `node` is of type `Text`, false otherwise. */
export function isText(node: Node | ChildNode): node is Text {
    return node.nodeType === NodeType.TEXT_NODE;
}
