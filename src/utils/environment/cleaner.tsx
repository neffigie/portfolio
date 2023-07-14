import { cleanEnv } from 'envalid'
import { type EnvironmentVariables, environmentConfig } from './config';

/**
 * Source: https://gist.github.com/stefan-girlich/4974d9d57bcbad35a973ba02774eb999
 * Envalid: https://github.com/af/envalid
 * This module is the single source of truth for application environment configuration. It shouldn't 
 * need to be edited to get the application's environment variables loaded correctly from an `.env` file.
 * This module detects if it is executed in a client-side environment and excludes server-only variables, see:
 * https://nextjs.org/docs/basic-features/environment-variables#exposing-environment-variables-to-the-browser
 */

/** The `--force-load-env` command line argument. */
const FORCE_LOAD_CLI_FLAG = '--force-load-env'

/** The `--print-env` command line argument. */
const PRINT_ENV_CLI_FLAG = '--print-env'

/** Whether or not `--force-load-env` is used. */
const printEnvCliFlagProvided = process.argv?.includes(PRINT_ENV_CLI_FLAG); 

/** Whether or not `--print-env` is used. */
const forceLoadCliFlagProvided = process.argv?.includes(FORCE_LOAD_CLI_FLAG); 

// load current environment beforehand (when CLI flag --force-load-env is used)
if (forceLoadCliFlagProvided) {
    console.info('Force-loading environment ...');
    const { loadEnvConfig } = require('@next/env');
    loadEnvConfig(process.cwd()); 
}

// print valid environment configuration as .env-compatible string (when CLI flag --print-env is used)
if (printEnvCliFlagProvided && forceLoadCliFlagProvided) {
    console.info('Printing current valid .env configuration ...')
    const validEnvConfigString = Object.entries(environmentConfig)
        .reduce((acc: string[], [key, value]) => [...acc, `${key}=${value}`], [])
        .join('\n')
    console.info(`${validEnvConfigString}\n`)
}

// print empty environment configuration as .env-compatible string (when CLI flag --print-env is used)
if (printEnvCliFlagProvided) {
    console.info('Printing empty .env configuration ...')
    const emptyEnvConfigString = Object.keys(environmentConfig)
        .reduce((acc: string[], curr) => [...acc, `${curr}=`], [])
        .join('\n')
    console.info(`${emptyEnvConfigString}\n`); 
}

/** Whether or not the app is running on the server. */
const isServer = typeof window === 'undefined'

/** The environment variable values as defined by the `.env` or `undefined` if not found (which will eventually throw an error).  */
let environmentVariables = {} as Record<EnvironmentVariables, string | undefined>;
(Object.keys(environmentConfig) as EnvironmentVariables[]).forEach(key => environmentVariables[key] = process.env[key]);

/** Contains the enviornment variables from the dotenv `process.env`. */
const environment = cleanEnv(environmentVariables, environmentConfig);

export { environment };