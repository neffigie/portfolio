import { makeValidator } from "envalid";

/**
 * Validates a url without a trailing slash 
 * @example https://sub.site.com
 * @privateremarks Modified from: https://stackoverflow.com/a/64252045/20697358
 */
const urlWithoutTrailingSlash = makeValidator(x => {
    if ((/^https?:\/\/(?:.*\/)?[^\/]+$/).test(x)) return x;
    console.log('Expected a url without a trailing slash');
    throw new Error('Expected a url without a trailing slash'); 
}); 

/**
 * Validate a github repository
 * @example neffigie/nextjs-portfolio
 */
const repository = makeValidator<`${string}/${string}`>(x => {
    if ((/.*\/.*/).test(x)) return x as `${string}/${string}`; 
    console.log('Expected a repository');
    throw new Error('Expected a repository');
});

/** Boolean that only accepts a `0` or `1` for `false` and `true`, respectively. */
const boolean01 = makeValidator(x => {
    if (x === '0' || x === '1') return x; 
    console.log("Expected either a '0' or '1'");
    throw new Error("Expected either a '0' or '1'");
});

export { urlWithoutTrailingSlash, repository, boolean01 }; 
