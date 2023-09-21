import { z } from "zod";
import { urlWithoutTrailingSlash, repository, boolean01 } from "./refiners";

/** Contains the environment variables from the `.env.local` file. */
const environment = {
    /** The pocketbase database endpoint. */
    NEXT_PUBLIC_POCKETBASE_URL: urlWithoutTrailingSlash().parse(process.env.NEXT_PUBLIC_POCKETBASE_URL),

    /** The name of the resume file as in PocketBase. */
    NEXT_PUBLIC_POCKETBASE_RESUME_FILE_NAME: z.string().parse(process.env.NEXT_PUBLIC_POCKETBASE_RESUME_FILE_NAME),

    /** The id of the resume PDF file, named `NEXT_PUBLIC_POCKETBASE_RESUME_FILE_NAME`, in the files collection. */
    NEXT_PUBLIC_POCKETBASE_RESUME_FILE_ID: z.string().parse(process.env.NEXT_PUBLIC_POCKETBASE_RESUME_FILE_ID),

    /** The respository to use for `giscus`. */
    NEXT_PUBLIC_GISCUS_REPOSITORY: repository().parse(process.env.NEXT_PUBLIC_GISCUS_REPOSITORY),

    /**
     * The repository id for `giscus`.
     * Use the tool at https://giscus.app/ to get your repo's id.
     * */
    NEXT_PUBLIC_GISCUS_REPOSITORY_ID: z.string().parse(process.env.NEXT_PUBLIC_GISCUS_REPOSITORY_ID),

    /** Category where the discussion will be searched for `giscus`. */
    NEXT_PUBLIC_GISCUS_CATEGORY: z.string().parse(process.env.NEXT_PUBLIC_GISCUS_CATEGORY),

    /**
     * The cateogry id for `giscus`.
     * Use the tool at https://giscus.app/ to get the category's id.
     * */
    NEXT_PUBLIC_GISCUS_CATEGORY_ID: z.string().parse(process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID),

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
    NEXT_PUBLIC_GISCUS_MAPPING: z
        .enum(["url", "title", "specific", "number", "pathname"])
        .parse(process.env.NEXT_PUBLIC_GISCUS_MAPPING),

    /**
     * Whether or not to use strict title matching for `giscus`.
     *
     * `0` - false
     *
     * `1` - true
     */
    NEXT_PUBLIC_GISCUS_STRICT: boolean01().parse(process.env.NEXT_PUBLIC_GISCUS_STRICT),

    /**
     * Whether or not to enable reactions for `giscus`.
     *
     * `0` - false
     *
     * `1` - true
     */
    NEXT_PUBLIC_GISCUS_REACTIONS_ENABLED: boolean01().parse(process.env.NEXT_PUBLIC_GISCUS_REACTIONS_ENABLED),

    /** The email. */
    NEXT_PUBLIC_EMAIL: z.string().email("The 'email' is not a valid email!").parse(process.env.NEXT_PUBLIC_EMAIL),

    /** The LinkedIn url. */
    NEXT_PUBLIC_LINKEDIN_URL: z
        .string()
        .url("The LinkedIn url is not valid!")
        .parse(process.env.NEXT_PUBLIC_LINKEDIN_URL),

    /** The GitHub url. */
    NEXT_PUBLIC_GITHUB_URL: z.string().url("The GitHub url is not valid!").parse(process.env.NEXT_PUBLIC_GITHUB_URL),

    /** The Itch.io url. */
    NEXT_PUBLIC_ITCH_URL: z.string().url("The Itch.io url is not valid!").parse(process.env.NEXT_PUBLIC_ITCH_URL),
};

export { environment as default };
