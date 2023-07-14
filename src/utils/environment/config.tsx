import { str } from "envalid";
import { urlWithoutTrailingSlash, repository, boolean01 } from "./validators";

/** The environement variable names mapped to their validator.  */
const environmentConfig = {

    /** The pocketbase database endpoint. */
    NEXT_PUBLIC_POCKETBASE_URL: urlWithoutTrailingSlash(),

    /** The respository to use for `giscus`. */
    NEXT_PUBLIC_GISCUS_REPOSITORY: repository(),

    /** 
     * The repository id for `giscus`. 
     * Use the tool at https://giscus.app/ to get your repo's id.
     * */
    NEXT_PUBLIC_GISCUS_REPOSITORY_ID: str(), 

    /** Category where the discussion will be searched for `giscus`. */
    NEXT_PUBLIC_GISCUS_CATEGORY: str(), 

    /** 
     * The cateogry id for `giscus`. 
     * Use the tool at https://giscus.app/ to get the category's id.
     * */
    NEXT_PUBLIC_GISCUS_CATEGORY_ID: str(), 

    /**
     * The `giscus` mapping responsible for mapping between the embedding page 
     * and the embedded discusion. 
     * 
     * `url` - giscus will search for a discussion whose title contains the page's URL.
     * 
     * `title` - giscus will search for a discussion whose title contains the page's \<title\> HTML tag.
     * 
     * `specific` - giscus will search for a discussion whose title contains a specific term.
     * 
     * `number` - giscus will load a specific discussion by number. This option does not support automatic discussion creation.
     * 
     * `pathname` - giscus will search for a discussion whose title contains the page's pathname URL component.
     * 
     * @remarks See https://www.giscus.app/ for further information.
     */
    NEXT_PUBLIC_GISCUS_MAPPING: str({ choices: ['url', 'title', 'specific', 'number', 'pathname'] as const }), 

    /** 
     * Whether or not to use strict title matching for `giscus`.
     * 
     * `0` - false
     * 
     * `1` - true
     *  */
    NEXT_PUBLIC_GISCUS_STRICT: boolean01(), 

    /** 
     * Whether or not to enable reactions for `giscus`.
     * 
     * `0` - false
     * 
     * `1` - true
     *  */
    NEXT_PUBLIC_GISCUS_REACTIONS_ENABLED: boolean01(),
};

/** The {@link environmentConfig} keys. */
type EnvironmentVariables = keyof typeof environmentConfig;

export { environmentConfig, type EnvironmentVariables }; 
