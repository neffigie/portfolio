import { z } from "zod";

/**
 * Refiner that validates a url without a trailing slash
 * @example ```https://sub.site.com```
 * @privateremarks Modified from: https://stackoverflow.com/a/64252045/20697358
 */
export const urlWithoutTrailingSlash = () =>
    z.string().refine(
        (x) => /^https?:\/\/(?:.*\/)?[^\/]+$/.test(x),
        (x) => ({ message: `${x} is not a url without a trailing slash` }),
    );

/**
 * Refiner that validates for any url that starts with https
 * @Privateremarks Modified from: https://stackoverflow.com/a/3809435
 */
export const url = () =>
    z.string().refine(
        (x) => /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        (x) => ({ message: `${x} is not a valid url` }),
    );

/**
 * Refiner that validates a github repository
 * @example neffigie/nextjs-portfolio
 */
export const repository = () =>
    z.custom<`${string}/${string}`>(
        (x) => /^[-_.\w]+\/[-_.\w]+$/.test(x as `${string}/${string}`),
        (x) => ({ message: `${x} is not a valid github repository` }),
    );

/** Refiner that only accepts a `0` or `1` for `false` and `true`, respectively. */
export const boolean01 = () =>
    z.custom<"0" | "1">(
        (x) => x === "0" || x === "1",
        (x) => ({ message: `${x} is niether a '0' nor '1'` }),
    );
