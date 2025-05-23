export interface Cookie {
    name: string;
    value: string;
    domain: string;
    path: string;
    expires?: Date;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: "Strict" | "Lax" | "None";
    hostOnly?: boolean;
    creationTime: Date;
}
export declare class CookieStore {
    private store;
    parseSetCookie(setCookieHeader: string, originHost: string): void;
    private storeCookie;
    getCookieHeader(url: string): Cookie[];
}
/**
 * Possible output formats for the MediaWiki API.
 */
export type formatOutput = "json" | "none" | "php" | "rawfm" | "xml";
/**
 * Possible format versions for the MediaWiki API output.
 */
export type formatVersion = 1 | 2;
/**
 * Possible values for the 'prop' parameter in the 'query' action.
 * These specify which properties to retrieve for pages.
 */
export type MediaWikiPageOptionsProp = "categories" | "categoryinfo" | "contributors" | "deletedrevisions" | "duplicatefiles" | "extlinks" | "extracts" | "fileusage" | "imageinfo" | "images" | "info" | "infobox" | "iwlinks" | "langlinks" | "links" | "linkshere" | "pageprops" | "redirects" | "revisions" | "stashimageinfo" | "templates" | "transcludedin" | "transcodestatus" | "videoinfo";
/**
 * Possible values for the 'list' parameter in the 'query' action.
 * These specify which lists of pages/data to retrieve.
 */
export type MediaWikiPageOptionsList = "allcategories" | "alldeletedrevisions" | "allfileusages" | "allimages" | "allinfoboxes" | "alllinks" | "allpages" | "allredirects" | "allrevisions" | "alltransclusions" | "allusers" | "backlinks" | "blocks" | "categorymembers" | "embeddedin" | "exturlusage" | "filearchive" | "imageusage" | "iwbacklinks" | "langbacklinks" | "linterrors" | "logevents" | "messagecollection" | "mystashedfiles" | "pagepropnames" | "pageswithprop" | "prefixsearch" | "protectedtitles" | "querypage" | "random" | "recentchanges" | "search" | "tags" | "usercontribs" | "users" | "watchlist" | "watchlistraw";
/**
 * Possible values for the 'meta' parameter in the 'query' action.
 * These specify which meta information about the wiki or user to retrieve.
 */
export type MediaWikiPageOptionsMeta = "allmessages" | "authmanagerinfo" | "filerepoinfo" | "languageinfo" | "languagestats" | "linterstats" | "managemessagegroups" | "messagegroups" | "messagegroupstats" | "messagetranslations" | "notifications" | "siteinfo" | "tokens" | "unreadnotificationpages" | "userinfo" | "oath";
export type MediaWikiSearchOptions = "nearmatch" | "text" | "title";
export type MediaWikiTokensOptions = "*" | "createaccount" | "csrf" | "login" | "patrol" | "rollback" | "userrights" | "watch";
export type MediaWikiSearchSrPropOptions = "categorysnippet" | "extensiondata" | "hasrelated" | "isfilematch" | "redirectsnippet" | "redirecttitle" | "score" | "sectionsnippet" | "sectiontitle" | "size" | "snippet" | "timestamp" | "titlesnippet" | "wordcount";
/**
 * Options for initializing the MediaWiki client.
 */
export interface MediaWikiOptions {
    /**
     * The base URL of the MediaWiki API (e.g., "https://en.wikipedia.org/w/api.php" or "https://en.wikipedia.org/w").
     * Required.
     */
    baseURL: string;
    /**
     * A string identifying the server responding to the request. (API parameter `servedby`)
     */
    servedby?: boolean | null;
    /**
     * Include the current timestamp in the response. (API parameter `curtimestamp`)
     */
    curtimestamp?: boolean | null;
    /**
     * Provide information about the response's language. (API parameter `responselanginfo`)
     */
    responselanginfo?: boolean | null;
    /**
     * Any request ID to be included in the response. (API parameter `requestid`)
     */
    requestid?: string | null;
    /**
     * The format of the output. Defaults to "json". (API parameter `format`)
     */
    format?: formatOutput | null;
    /**
     * The version of the format to use. Defaults to 2. (API parameter `formatversion`)
     */
    formatversion?: formatVersion | null;
    /**
     * If set, replace non-ASCII characters with escape sequences. (API parameter `ascii`)
     */
    ascii?: boolean | null;
    /**
     * If set, encode response in UTF-8. (API parameter `utf8`)
     */
    utf8?: boolean | null;
}
/**
 * Internal options for the fetchData method.
 */
export interface fetchDataOptions {
    /**
     * HTTP method for the request (e.g., "GET", "POST").
     */
    method: "GET" | "POST";
    /**
     * URL for the request.
     */
    url: string;
    /**
     * Request parameters.
     */
    params?: Record<string, any>;
    /**
     * Request headers.
     */
    headers?: Record<string, string>;
    /**
     * Request body data (for methods like POST).
     */
    data?: any;
}
/**
 * Options for the 'query' action. Specifies what data to retrieve.
 */
export interface MediaWikiPageOptions {
    action?: "query";
    /**
     * A single page title to query.
     * Note: Prefer `titles` for multiple pages or more complex queries.
     * @example "Main Page"
     * @example "Wikipedia"
     */
    title?: string;
    /**
     * Which properties to get for the queried pages. (API parameter `prop`)
     * @example ["info", "extracts"]
     * @example ["categories", "revisions"]
     * @example ["contributors", "revisions", "images"]
     */
    prop?: MediaWikiPageOptionsProp[];
    /**
     * Which lists to get. (API parameter `list`)
     * @example ["allcategories", "recentchanges"]
     * @example ["allimages", "alllinks"]
     * @example ["allusers", "allpages"]
     */
    list?: MediaWikiPageOptionsList[];
    /**
     * Which meta information to get. (API parameter `meta`)
     * @example ["siteinfo"]
     * @example ["userinfo", "tokens"]
     * @example ["languageinfo", "linterstats"]
     */
    meta?: MediaWikiPageOptionsMeta[];
    /**
     * Add the page ID to the response at the top level. (API parameter `indexpageids`)
     * @example true
     * @example false
     */
    indexpageids?: boolean;
    /**
     * Export the queried pages in XML format. (API parameter `export`)
     * @example true
     * @example false
     */
    export?: boolean;
    /**
     * A list of page titles to query. (API parameter `titles`)
     * @example ["Main Page", "Wikipedia"]
     * @example ["Albert Einstein", "Quantum mechanics"]
     * @example ["World War II", "Cold War"]
     */
    titles?: string[];
    /**
     * A list of page IDs to query. (API parameter `pageids`)
     * Note: API expects numbers, but your type is string[].
     * @example ["1", "5", "1337"]
     * @example ["500", "1024", "9001"]
     */
    pageids?: string[];
    /**
     * Resolve redirects in titles and pageids. (API parameter `redirects`)
     * @example true
     * @example false
     * @example "from"  // Resolve redirects from the given page
     * @example "to"    // Resolve redirects to the final page
     */
    redirects?: boolean | string;
    /**
     * Search term to look for in page titles or content.
     * Depending on the search engine used by the server, special search functions may be supported.
     * @example "artificial intelligence"
     * @example "intitle:Machine learning"
     * @example "deep learning insource:/neural/"
     */
    srsearch?: string;
    /**
     * Specify namespaces to search within.
     * @example ["0", "1", "2"]
     * @example ["Main", "Talk"]
     * @example ["User", "Wikipedia"]
     */
    srnamespace?: string[];
    srlimit?: number;
    sroffset?: number;
    srwhat?: MediaWikiSearchOptions;
    rvlimit?: number;
    exintro?: boolean;
    explaintext?: boolean;
    uiprop?: string;
    type?: any;
    srinfo?: "totalhits" | "suggestion" | "rewrittenquery";
    srprop?: MediaWikiSearchSrPropOptions[];
}
export interface MediaWikiErrorCodeResponse {
    code: string;
    info: string;
    docref?: string;
    [key: string]: any;
}
/**
 * Base structure for common MediaWiki API response elements.
 */
export interface MediaWikiBaseResponse {
    /** Indicates if the batch is complete. API might return "" which coerces to true/false. */
    batchcomplete: boolean;
    /** Warnings returned by the API, possibly related to specific modules like 'extracts'. */
    warnings?: {
        /** Warnings specific to the 'extracts' module. */
        extracts?: {
            /** A general warning message. */
            warning: string;
            /** Another field for warnings (structure seems redundant based on type, kept as per your definition). */
            warnings: string;
        };
        /** Other modules might also produce warnings. */
        [module: string]: any;
    };
    errors?: any;
    error?: MediaWikiErrorCodeResponse;
}
/** Defines the general continuation token. */
export interface GeneralContinue {
    continue: string;
}
/** Defines the continuation token for page content. */
export interface PageContentContinue {
    pccontinue: string;
}
/** Defines the continuation token for external links. */
export interface ExternalLinksContinue {
    elcontinue: string;
}
/** Defines the continuation token for interwiki links. */
export interface InterwikiLinksContinue {
    iwcontinue: string;
}
/** Defines the continuation token for page links. */
export interface PageLinksContinue {
    plcontinue: string;
}
/** Defines the continuation token for links here. */
export interface LinksHereContinue {
    lhcontinue: string;
}
/** Defines the continuation token for templates. */
export interface TemplatesContinue {
    tlcontinue: string;
}
/**
 * Describes the comprehensive 'continue' block that may be returned by the MediaWiki API.
 * Fields are based on common continuation parameters. All listed are required as per your example.
 */
export interface MediaWikiComprehensiveContinueBlock extends GeneralContinue, PageContentContinue, ExternalLinksContinue, InterwikiLinksContinue, PageLinksContinue, LinksHereContinue, TemplatesContinue {
    /**
     * Allows for other module-specific continuation tokens (e.g., rncontinue, srcontinue, etc.)
     * @example { "rncontinue": "abcdef", "srcontinue": "12345" }
     */
    [key: string]: string | number | undefined;
}
/**
 * Information about a normalized title from a MediaWiki API query.
 * @example { "fromencoded": false, "from": "main page", "to": "Main Page" }
 */
export interface MediaWikiQueryNormalizedItem {
    /** Indicates if the source title was encoded. */
    fromencoded: boolean;
    /** The original title. */
    from: string;
    /** The normalized title. */
    to: string;
}
/**
 * Information about a redirected title from a MediaWiki API query.
 * @example { "from": "USA", "to": "United States" }
 */
export interface MediaWikiQueryRedirectItem {
    /** Original title. */
    from: string;
    /** Target title. */
    to: string;
    /** Optional fragment on the to link */
    tofragment?: string;
}
/**
 * Item representing an image linked on a page.
 * @example { "ns": 6, "title": "File:Example.jpg" }
 */
export interface MediaWikiQueryPageImageItem {
    /** Namespace ID of the image. */
    ns: number;
    /** Title of the image file. */
    title: string;
}
/**
 * Item representing a category the page belongs to.
 * @example { "ns": 14, "title": "Category:Examples" }
 */
export interface MediaWikiQueryPageCategoryItem {
    /** Namespace ID of the category. */
    ns: number;
    /** Title of the category page. */
    title: string;
}
/**
 * Item representing a contributor to the page.
 * @example { "userid": 123, "name": "ExampleUser" }
 */
export interface MediaWikiQueryPageContributorItem {
    /** User ID of the contributor. */
    userid: number;
    /** User name of the contributor. */
    name: string;
}
/**
 * Item representing an external link from the page.
 * @example { "url": "https://www.example.com" }
 */
export interface MediaWikiQueryPageExtlinkItem {
    /** The URL of the external link. */
    url: string;
}
/**
 * Information about the flagged revisions status of a page.
 */
export interface MediaWikiQueryPageFlaggedDetails {
    /** Stable revision ID. */
    stable_revid: number;
    /** Review level. */
    level: number;
    /** Text representation of the review level. */
    level_text: string;
    /** Page protection level. */
    protection_level: string;
    /** Expiry timestamp for protection. */
    protection_expiry: string;
}
/**
 * Item representing an interwiki link from the page.
 * @example { "prefix": "wikt", "title": "example" }
 */
export interface MediaWikiQueryPageInterwikiLinkItem {
    /** Prefix of the interwiki link. */
    prefix: string;
    /** Title of the page on the other wiki. */
    title: string;
}
/**
 * Item representing a language link from the page.
 * @example { "lang": "de", "title": "Beispiel" }
 */
export interface MediaWikiQueryPageLangLinkItem {
    /** Language code. */
    lang: string;
    /** Title of the page in the other language. */
    title: string;
}
/**
 * Item representing an internal link from the page.
 * @example { "ns": 0, "title": "Another Page" }
 */
export interface MediaWikiQueryPageInternalLinkItem {
    /** Namespace ID of the target page. */
    ns: number;
    /** Title of the target page. */
    title: string;
}
/**
 * Item representing a page that links to the current page.
 * @example { "pageid": 456, "ns": 0, "title": "Linking Page", "redirect": false }
 */
export interface MediaWikiQueryPageLinkHereItem {
    /** Page ID of the linking page. */
    pageid: number;
    /** Namespace ID of the linking page. */
    ns: number;
    /** Title of the linking page. */
    title: string;
    /** Indicates if the link is a redirect. (Marked as optional as per common API behavior) */
    redirect?: boolean;
}
/**
 * Page properties obtained via `prop=pageprops`.
 * @example { "page_image": "Example.jpg", "wikibase_item": "Q42" }
 */
export interface MediaWikiQueryPagePropsDetails {
    /** The page image. */
    page_image: string;
    /** Wikibase badge information (example key). */
    'wikibase-badge-Q17437796': string;
    /** Wikibase item ID. */
    wikibase_item: string;
    /** Allows for other page properties. */
    [key: string]: any;
}
/**
 * Terms associated with the page (e.g., labels, descriptions from Wikibase).
 * @example { "label": ["Example Label"], "description": ["An example description."] }
 */
export interface MediaWikiQueryPageTermsDetails {
    /** Labels associated with the page. */
    label: string[];
    /** Descriptions associated with the page. */
    description: string[];
}
/**
 * Page view data, keyed by date.
 * @example { "2023-01-01": 100, "2023-01-02": 150 }
 */
export interface MediaWikiQueryPageViewsDetails {
    [date: string]: number | null;
}
/**
 * Details of a single page revision.
 */
export interface MediaWikiQueryPageRevisionItem {
    /**
     * The unique identifier for this revision.
     * @example 123456789
     */
    revid: number;
    /**
     * The revision ID of the parent revision (the one this revision was based on).
     * `0` if this is the first revision of the page.
     * @example 123456780
     */
    parentid: number;
    /**
     * Indicates if the revision was marked as a minor edit.
     * `true` for minor, `false` for major.
     * @example true
     */
    minor: boolean;
    /**
     * The username of the user who made this revision.
     * For anonymous users, this will be their IP address.
     * @example "Jimbo Wales"
     * @example "192.168.1.100"
     */
    user: string;
    /**
     * The timestamp when this revision was made, in ISO 8601 format (UTC).
     * @example "2023-10-26T10:30:00Z"
     */
    timestamp: string;
    /**
     * The edit summary (comment) provided by the user for this revision.
     * Can be empty if no summary was provided.
     * @example "Fixed a typo"
     * @example ""
     */
    comment: string;
    /**
     * Allows for other revision properties based on the `rvprop` parameter
     * used in the API query (e.g., `content`, `size`, `tags`, `sha1`).
     * @see https://www.mediawiki.org/wiki/API:Revisions#Parameters
     * @example { "size": 1234, "tags": ["mobile edit", "visualeditor"] }
     */
    [key: string]: any;
}
/**
 * Item representing a template used on the page.
 * @example { "ns": 10, "title": "Template:Example" }
 */
export interface MediaWikiQueryPageTemplateItem {
    /** Namespace ID of the template. */
    ns: number;
    /** Title of the template page. */
    title: string;
}
/**
 * Item representing a page that transcludes the current page.
 * @example { "pageid": 789, "ns": 0, "title": "Transcluding Page", "redirect": false }
 */
export interface MediaWikiQueryPageTranscludedInItem {
    /** Page ID of the transcluding page. */
    pageid: number;
    /** Namespace ID of the transcluding page. */
    ns: number;
    /** Title of the transcluding page. */
    title: string;
    /** Indicates if the transclusion is via a redirect. (Marked as optional) */
    redirect?: boolean;
}
export interface MediaWikiQueryCategoriesItem {
    pageid: number;
    ns: number;
    title: string;
    categories: MediaWikiQueryPageTemplateItem[];
}
export interface MediaWikiQueryRevisionsItem {
    pageid: number;
    ns: number;
    title: string;
    revisions: MediaWikiQueryPageRevisionItem[];
}
export interface MediaWikiQuerySummaryItem {
    pageid: number;
    ns: number;
    title: string;
    extract: string;
}
/** Target title information for CirrusSearch suggestions. */
export interface MediaWikiQueryCirrusTargetTitle {
    title: string;
    namespace: number;
}
/** Suggestion input and weight for CirrusSearch. */
export interface MediaWikiQueryCirrusSuggestInput {
    input: string[];
    weight: number;
}
/** Deeply nested score detail item for CirrusSearch score explanation. */
export interface MediaWikiQueryCirrusScoreDetailItem {
    value: number;
    description: string;
    details?: MediaWikiQueryCirrusScoreDetailItem[];
}
/** Represents the score explanation structure in CirrusSearch suggestions. */
export interface MediaWikiQueryCirrusScoreExplanation {
    value: number;
    description: string;
    details?: MediaWikiQueryCirrusScoreDetailItem[];
}
/** Structure for an item in the `cirruscompsuggestbuilddoc` record. */
export interface MediaWikiQueryCirrusCompSuggestBuildDocItem {
    batch_id: number;
    source_doc_id: string;
    target_title: MediaWikiQueryCirrusTargetTitle;
    suggest: MediaWikiQueryCirrusSuggestInput;
    "suggest-stop": MediaWikiQueryCirrusSuggestInput;
    score_explanation: MediaWikiQueryCirrusScoreExplanation;
}
/** Detailed structure for `cirrusbuilddoc`. */
export interface MediaWikiQueryCirrusBuildDocDetails {
    version: number;
    wiki: string;
    page_id: number;
    namespace: number;
    namespace_text: string;
    title: string;
    timestamp: string;
    create_timestamp: string;
    redirect: any[];
    category: string[];
    external_link: string[];
    outgoing_link: string[];
    template: string[];
    text: string;
    text_bytes: number;
    content_model: string;
    coordinates: any[];
    wikibase_item: string;
    language: string;
    heading: string[];
    opening_text: string;
    auxiliary_text: string[];
    defaultsort: any;
    file_text: any;
    display_title: any;
    [key: string]: any;
}
/** No-operation hints for CirrusSearch build document metadata. */
export interface MediaWikiQueryCirrusBuildDocMetadataNoopHints {
    version: string;
    [key: string]: any;
}
/** Mandatory reduction stats for CirrusSearch size limiter. */
export interface MediaWikiQueryCirrusBuildDocMetadataSizeLimiterMandatoryReduction {
    opening_text: number;
    [key: string]: any;
}
/** Document size stats for CirrusSearch size limiter. */
export interface MediaWikiQueryCirrusBuildDocMetadataSizeLimiterDocument {
    original_length: number;
    new_length: number;
    [key: string]: any;
}
/** Size limiter stats for CirrusSearch build document metadata. */
export interface MediaWikiQueryCirrusBuildDocMetadataSizeLimiterStats {
    mandatory_reduction: MediaWikiQueryCirrusBuildDocMetadataSizeLimiterMandatoryReduction;
    document: MediaWikiQueryCirrusBuildDocMetadataSizeLimiterDocument;
    [key: string]: any;
}
/** Metadata for CirrusSearch build document. */
export interface MediaWikiQueryCirrusBuildDocMetadataDetails {
    cluster_group: string;
    noop_hints: MediaWikiQueryCirrusBuildDocMetadataNoopHints;
    size_limiter_stats: MediaWikiQueryCirrusBuildDocMetadataSizeLimiterStats;
    index_name: string;
    [key: string]: any;
}
/**
 * Detailed information about a single page, as it appears in the `query.pages` object.
 * Uses the decomposed types for its properties.
 * All fields are kept as in your "full" example, many are effectively optional depending on `prop`.
 */
export interface MediaWikiQueryPageFullDetails {
    /** The unique identifier for the page. */
    pageid: number;
    /** The namespace ID of the page. */
    ns: number;
    /** The full title of the page. */
    title: string;
    /** The content model of the page (e.g., "wikitext"). */
    contentmodel: string;
    /** The language code of the page content. */
    pagelanguage: string;
    /** The HTML language code for the page. */
    pagelanguagehtmlcode: string;
    /** The direction of the page language script (e.g., "ltr"). */
    pagelanguagedir: string;
    /** Timestamp of the last time the page was touched. */
    touched: string;
    /** The revision ID of the last revision. */
    lastrevid: number;
    /** The length of the page content in bytes. */
    length: number;
    /** List of images included in the page. */
    images: MediaWikiQueryPageImageItem[];
    /** List of categories the page belongs to. */
    categories: MediaWikiQueryPageCategoryItem[];
    /** Number of anonymous contributors to the page (requires appropriate rights). */
    anoncontributors: number;
    /** List of contributors to the page (requires appropriate rights). */
    contributors: MediaWikiQueryPageContributorItem[];
    /** List of external links from the page. */
    extlinks: MediaWikiQueryPageExtlinkItem[];
    /** Extracted text content of the page (requires `prop=extracts`). */
    extract: string;
    /** Information about the flagged revisions status (requires `prop=flagged`). */
    flagged: MediaWikiQueryPageFlaggedDetails;
    /** List of interwiki links from the page. */
    iwlinks: MediaWikiQueryPageInterwikiLinkItem[];
    /** List of language links from the page. */
    langlinks: MediaWikiQueryPageLangLinkItem[];
    /** Count of language links. */
    langlinkscount: number;
    /** List of internal links from the page. */
    links: MediaWikiQueryPageInternalLinkItem[];
    /** List of pages that link to this page. */
    linkshere: MediaWikiQueryPageLinkHereItem[];
    /** Page properties (requires `prop=pageprops`). */
    pageprops: MediaWikiQueryPagePropsDetails;
    /** Terms associated with the page (e.g., labels, descriptions from Wikibase). */
    terms: MediaWikiQueryPageTermsDetails;
    /** Page view data, keyed by date. */
    pageviews: MediaWikiQueryPageViewsDetails;
    /** List of revisions for the page (requires `prop=revisions`). */
    revisions: MediaWikiQueryPageRevisionItem[];
    /** List of templates used on the page. */
    templates: MediaWikiQueryPageTemplateItem[];
    /** List of pages that transclude this page (e.g., templates). */
    transcludedin: MediaWikiQueryPageTranscludedInItem[];
    /** Short description of the page (requires `prop=description`). */
    description: string;
    /** Source of the short description. */
    descriptionsource: string;
    /** CirrusSearch component suggestion build document data. */
    cirruscompsuggestbuilddoc: Record<string, MediaWikiQueryCirrusCompSuggestBuildDocItem> & Record<string, any>;
    /** CirrusSearch build document data. */
    cirrusbuilddoc: MediaWikiQueryCirrusBuildDocDetails;
    /** CirrusSearch build document metadata. */
    cirrusbuilddoc_metadata: MediaWikiQueryCirrusBuildDocMetadataDetails;
    /** Comment related to the CirrusSearch build document. */
    cirrusbuilddoc_comment: string;
    /** Optional fields like 'missing' or 'invalid' for pages. */
    missing?: boolean | string;
    invalid?: boolean | string;
    invalidreason?: string;
    /** Allows other properties added by `prop` modules. */
    [key: string]: any;
}
/**
 * Item returned by `list=random`.
 * @example { "id": 123, "ns": 0, "title": "Random Page" }
 */
export interface MediaWikiListRandomItem {
    id: number;
    ns: number;
    title: string;
}
/**
 * Item returned by `list=search`.
 * @example { "ns": 0, "title": "Search Result", "pageid": 456, "snippet": "A snippet of the page..." }
 */
export interface MediaWikiListSearchItem {
    ns: number;
    title: string;
    pageid?: number;
    size?: number;
    wordcount?: number;
    timestamp?: string;
    snippet?: string;
    titlesnippet?: string;
    redirecttitle?: string;
    redirectsnippet?: string;
    sectiontitle?: string;
    sectionsnippet?: string;
    isfilematch?: boolean;
    categorysnippet?: string;
    [key: string]: any;
}
/**
 * Metadata for `list=search` results.
 * @example { "totalhits": 100, "suggestion": "corrected search query" }
 */
export interface MediaWikiListSearchInfo {
    totalhits: number;
    suggestion?: string;
    suggestionsnippet?: string;
}
/**
 * Represents a single metadata field returned from MediaWiki's `imageinfo.metadata`.
 */
export interface MediaWikiImageMetadata {
    /**
     * The internal name/key of the metadata field (e.g., "DateTimeOriginal", "Artist").
     */
    name: string;
    /**
     * The raw value of the metadata field (can be string, number, or even base64-encoded data).
     */
    value: string;
    /**
     * Optional human-readable label, if available (e.g., "Original date/time").
     */
    label?: string;
    /**
     * Optional human-readable value with formatting or localization.
     */
    formattedvalue?: string;
    /**
     * Optional source of the metadata (e.g., "exif", "iptc", "xmp").
     */
    source?: string;
    /**
     * Optional name of the metadata space (e.g., "EXIF", "IPTC").
     */
    space?: string;
}
/**
 * Represents simplified metadata returned from `commonmetadata`.
 * Typically includes width, height, resolution, and unit data.
 */
export interface MediaWikiSimpleMetadata {
    /**
     * Name of the metadata field (e.g., "ImageWidth", "XResolution").
     */
    name: string;
    /**
     * The value of the metadata field (e.g., "1920", "72").
     */
    value: string;
    /**
     * Optional source of the field (e.g., "exif").
     */
    source?: string;
}
/**
 * The main `query` object within a MediaWiki API response, using decomposed types.
 */
export interface MediaWikiQueryStructure {
    /** Information about normalized titles. */
    normalized?: MediaWikiQueryNormalizedItem[];
    /** Information about redirected titles. */
    redirects?: MediaWikiQueryRedirectItem[];
    /**
     * Information about the queried pages, keyed by page ID.
     * Populated by `prop` queries. Field itself is optional as not present for all list queries.
     */
    pages?: {
        [pageId: string]: MediaWikiQueryPageFullDetails;
    };
    /** Results from `list=random`. */
    random?: MediaWikiListRandomItem[];
    /** Search results from `list=search`. */
    search?: MediaWikiListSearchItem[];
    /** Metadata about search results from `list=search`. */
    searchinfo?: MediaWikiListSearchInfo;
    /**
     * Allows other data added by `list` or `meta` actions.
     * @example { "allpages": [...], "userinfo": {...} }
     */
    [key: string]: any;
}
/**
 * The complete structure of a response from the MediaWiki API's 'query' action.
 * This combines base elements, continuation data, and the specific query payload.
 */
export interface MediaWikiQueryResponse extends MediaWikiBaseResponse {
    /**
     * Continuation data for paginated results.
     * The presence of this block and its specific fields depend on the query and results.
     */
    continue?: MediaWikiComprehensiveContinueBlock;
    /**
     * The main query results payload. Optional as it might be missing on errors.
     */
    query?: MediaWikiQueryStructure;
    /** Server that responded to the request (if `servedby` parameter was used). */
    servedby?: string;
    /** Current timestamp (if `curtimestamp` parameter was used). */
    curtimestamp?: string;
    /** Language information about the response (if `responselanginfo` parameter was used). */
    responselanginfo?: {
        lang: string;
        dir: string;
        uselang: string;
    };
    /** Request ID (if `requestid` parameter was used). */
    requestid?: string;
    /** General errors returned by the API at the top level (as per your original structure). */
    errors?: any;
    /** Standard MediaWiki API error object, often returned at the top level for critical errors. */
    error?: MediaWikiErrorCodeResponse;
}
export interface MediaWikiQuerySearchResponse extends MediaWikiBaseResponse {
    query: {
        searchInfo: MediaWikiListSearchInfo;
        search: MediaWikiListSearchItem[];
    };
}
/**
 * Defines the structure of the 'query' object specifically for responses
 * from the `client.page` method, which typically requests page properties.
 * This structure expects a 'pages' object.
 */
export interface MediaWikiQueryForPageMethod {
    /** Information about normalized titles, if any. */
    normalized?: MediaWikiQueryNormalizedItem[];
    /** Information about redirected titles, if any. */
    redirects?: MediaWikiQueryRedirectItem[];
    /**
     * Information about the queried pages, keyed by page ID.
     * This is expected to be present and populated.
     */
    pages: Record<string, MediaWikiQueryPageFullDetails>;
    /**
     * Allows other data that might theoretically be added by MediaWiki
     * alongside `pages` in a prop query, though `pages` is the primary focus.
     */
    [key: string]: any;
}
/**
 * The specific response structure for the `client.page` method.
 * It extends the base response and includes a query structure focused on page details.
 */
export interface MediaWikiQueryPageResponse extends MediaWikiBaseResponse {
    /**
     * Continuation data for paginated results, if any.
     */
    continue?: MediaWikiComprehensiveContinueBlock;
    /**
     * The main query results payload, specifically structured for page data.
     */
    query: MediaWikiQueryForPageMethod;
    /** Server that responded to the request (if `servedby` parameter was used). */
    servedby?: string;
    /** Current timestamp (if `curtimestamp` parameter was used). */
    curtimestamp?: string;
    /** Language information about the response (if `responselanginfo` parameter was used). */
    responselanginfo?: {
        lang: string;
        dir: string;
        uselang: string;
    };
    /** Request ID (if `requestid` parameter was used). */
    requestid?: string;
    /** General errors returned by the API at the top level. */
    errors?: any;
    /** Standard MediaWiki API error object. */
    error?: MediaWikiErrorCodeResponse;
}
export declare class MediaWikiQueryPageResponseClass implements MediaWikiQueryPageResponse {
    batchcomplete: boolean;
    query: MediaWikiQueryForPageMethod;
    private wiki;
    private pageDetails;
    constructor(data: MediaWikiQueryPageResponse, wikiInstance: MediaWiki);
    /**
     * Returns the HTML content of the page.
     * @example "<p>Hello <strong>world</strong>!</p>"
     */
    html(): string;
    /**
     * Returns the title of the page.
     * @example "Main Page"
     */
    title(): string;
    /**
     * Returns the page ID of the parsed page.
     * @example 123456
     */
    categories(): string[];
    /**
     * Edits this page.
     * @param options - Options for editing, like new text and summary.
     * @returns A promise resolving to the edit page response.
    */
    edit(options: MediaWikiQueryEditPageOptions): Promise<MediaWikiQueryEditPageResponseClass>;
}
/**
 * Represents the response from the MediaWiki API's `action=query&meta=siteinfo` endpoint.
 * Provides general information about the site such as main page, server settings, and configurations.
 *
 * @see https://www.mediawiki.org/wiki/API:Siteinfo
 */
export interface MediaWikiQuerySiteInfoResponse extends MediaWikiBaseResponse {
    query: {
        /**
         * General information about the wiki site.
         */
        general: {
            /**
             * The name of the main page of the site.
             * @example "Main Page"
             */
            mainpage: string;
            /**
             * The full URL to the main page.
             * @example "https://en.wikipedia.org/wiki/Main_Page"
             */
            base: string;
            /**
             * The name of the site (e.g., Wikipedia).
             * @example "Wikipedia"
             */
            sitename: string;
            /**
             * True if the main page is located at the root of the domain.
             * @example false
             */
            mainpageisdomainroot: boolean;
            /**
             * URL to the site's logo image.
             * @example "//en.wikipedia.org/static/images/project-logos/enwiki.png"
             */
            logo: string;
            /**
             * The version of the MediaWiki software the site is running on.
             * @example "MediaWiki 1.44.0-wmf.28"
             */
            generator: string;
            /**
             * The version of PHP used by the server.
             * @example "8.1.32"
             */
            phpversion: string;
            /**
             * The PHP SAPI (Server API) being used by the server.
             * @example "fpm-fcgi"
             */
            phpsapi: string;
            /**
             * The database type used by the site.
             * @example "mysql"
             */
            dbtype: string;
            /**
             * The version of the database used by the site.
             * @example "10.6.20-MariaDB-log"
             */
            dbversion: string;
            /**
             * Whether image whitelist is enabled.
             * @example false
             */
            imagewhitelistenabled: boolean;
            /**
             * Whether language conversion is enabled.
             * @example true
             */
            langconversion: boolean;
            /**
             * Whether link conversion (e.g., converting URLs to links) is enabled.
             * @example true
             */
            linkconversion: boolean;
            /**
             * Whether title conversion is enabled.
             * @example true
             */
            titleconversion: boolean;
            /**
             * Charset for link prefixes.
             * @example ""
             */
            linkprefixcharset: string;
            /**
             * The prefix for links on the site.
             * @example ""
             */
            linkprefix: string;
            /**
             * The regular expression used to match link trails.
             * @example "/^([a-z]+)(.*)$/sD"
             */
            linktrail: string;
            /**
             * Characters allowed in page titles.
             * @example " %!\"$&'()*,\\-.\\/0-9:;=?@A-Z\\\\^_`a-z~\\x80-\\xFF+"
             */
            legaltitlechars: string;
            /**
             * Characters not allowed in usernames.
             * @example "@:>="
             */
            invalidusernamechars: string;
            /**
             * Whether all Unicode fixes are enabled.
             * @example false
             */
            allunicodefixes: boolean;
            /**
             * Whether Arabic Unicode fix is enabled.
             * @example true
             */
            fixarabicunicode: boolean;
            /**
             * Whether Malayalam Unicode fix is enabled.
             * @example true
             */
            fixmalayalamunicode: boolean;
            /**
             * The Git commit hash for the current version.
             * @example "d4283b99aa40c4726f9ec2dc0a033bf30628eeee"
             */
            "git-hash": string;
            /**
             * The Git branch for the current version.
             * @example "wmf/1.44.0-wmf.28"
             */
            "git-branch": string;
            /**
             * The case used for page titles (e.g., first-letter).
             * @example "first-letter"
             */
            case: string;
            /**
             * The language code for the site (e.g., "en" for English).
             * @example "en"
             */
            lang: string;
            /**
             * An array of fallback languages if the primary language isn't available.
             * @example [{ code: "fr" }]
             */
            fallback: Array<{
                code: string;
            }>;
            /**
             * Whether the site is RTL (Right-to-Left).
             * @example false
             */
            rtl: boolean;
            /**
             * The encoding used for 8-bit characters in fallbacks.
             * @example "windows-1252"
             */
            fallback8bitEncoding: string;
            /**
             * Whether the site is in read-only mode.
             * @example false
             */
            readonly: boolean;
            /**
             * Whether the site has the write API enabled.
             * @example true
             */
            writeapi: boolean;
            /**
             * The maximum allowed article size in bytes.
             * @example 2097152
             */
            maxarticlesize: number;
            /**
             * The site's timezone.
             * @example "UTC"
             */
            timezone: string;
            /**
             * The time offset for the site's timezone.
             * @example 0
             */
            timeoffset: number;
            /**
             * The path to articles on the site.
             * @example "/wiki/$1"
             */
            articlepath: string;
            /**
             * The path to the script used for the site.
             * @example "/w"
             */
            scriptpath: string;
            /**
             * The script used for the site.
             * @example "/w/index.php"
             */
            script: string;
            /**
             * Whether the site has variant article paths enabled.
             * @example false
             */
            variantarticlepath: boolean;
            /**
             * The base server URL of the site.
             * @example "//en.wikipedia.org"
             */
            server: string;
            /**
             * The server name for the site.
             * @example "en.wikipedia.org"
             */
            servername: string;
            /**
             * The unique identifier for the wiki.
             * @example "enwiki"
             */
            wikiid: string;
            /**
             * The current server time.
             * @example "2025-05-14T20:37:02Z"
             */
            time: string;
            /**
             * Whether "miser mode" is enabled (a mode for low resources).
             * @example true
             */
            misermode: boolean;
            /**
             * Whether file uploads are enabled.
             * @example true
             */
            uploadsenabled: boolean;
            /**
             * The maximum allowed upload size in bytes.
             * @example 5368709120
             */
            maxuploadsize: number;
            /**
             * The minimum upload chunk size in bytes.
             * @example 1024
             */
            minuploadchunksize: number;
            /**
             * Options related to image galleries.
             */
            galleryoptions: {
                /**
                 * The number of images to display per row.
                 * @example 0
                 */
                imagesPerRow: number;
                /**
                 * The width of images in the gallery.
                 * @example 120
                 */
                imageWidth: number;
                /**
                 * The height of images in the gallery.
                 * @example 120
                 */
                imageHeight: number;
                /**
                 * Whether to show the caption length in the gallery.
                 * @example true
                 */
                captionLength: boolean;
                /**
                 * Whether to show the file size of images.
                 * @example true
                 */
                showBytes: boolean;
                /**
                 * The mode of the gallery (e.g., traditional).
                 * @example "traditional"
                 */
                mode: string;
                /**
                 * Whether to show image dimensions in the gallery.
                 * @example true
                 */
                showDimensions: boolean;
            };
            /**
             * Limits for thumbnail sizes.
             */
            thumblimits: Record<string, number>;
            /**
             * Image size limits for different resolutions.
             */
            imagelimits: Record<string, {
                width: number;
                height: number;
            }>;
            /**
             * URL to the site's favicon.
             * @example "https://en.wikipedia.org/static/favicon/wikipedia.ico"
             */
            favicon: string;
            /**
             * The provider for the central user authentication system.
             * @example "CentralAuth"
             */
            centralidlookupprovider: string;
            /**
             * A list of all available central user authentication providers.
             * @example ["CentralAuth", "local"]
             */
            allcentralidlookupproviders: string[];
            /**
             * Whether interwiki magic is enabled.
             * @example true
             */
            interwikimagic: boolean;
            /**
             * Magic links configurations for different types.
             */
            magiclinks: {
                /**
                 * Whether ISBN magic links are enabled.
                 * @example false
                 */
                ISBN: boolean;
                /**
                 * Whether PMID magic links are enabled.
                 * @example false
                 */
                PMID: boolean;
                /**
                 * Whether RFC magic links are enabled.
                 * @example false
                 */
                RFC: boolean;
            };
            /**
             * The collation for categories on the site.
             * @example "uca-default-u-kn"
             */
            categorycollation: string;
            /**
             * Whether nofollow links are enabled for external links.
             * @example true
             */
            nofollowlinks: boolean;
            /**
             * Exceptions to nofollow links (list of domains).
             * @example ["mediawiki.org", "wikibooks.org"]
             */
            nofollownsexceptions: string[];
            /**
             * Whether the site uses the Unicode normalization form C.
             * @example true
             */
            unicodeNormalization: boolean;
            /**
             * Options related to the parsing and display of mathematical expressions.
             */
            math: {
                enabled: false;
            } | {
                enabled: true;
                tex: string;
                svg: string;
                png: string;
            };
        };
    };
}
/**
 * Represents the options for the MediaWiki API's `action=opensearch` endpoint.
 * Used to perform a search query on the wiki with specific parameters.
 *
 * @see https://www.mediawiki.org/wiki/API:Opensearch
 */
export interface MediaWikiQueryOpenSearchOptions {
    /**
     * The search query string to be used for the search.
     * @example "JavaScript"
     */
    search: string;
    /**
     * A list of namespace IDs to filter the search results.
     * @example [0, 1, 2]
     */
    namespace: number[];
    /**
     * The maximum number of search results to return.
     * @example 10
     */
    limit: number;
}
/**
 * Represents the response from the MediaWiki API's `action=opensearch` endpoint.
 * Provides search results based on a query string.
 *
 * @see https://www.mediawiki.org/wiki/API:Opensearch
 */
export type MediaWikiQueryOpenSearchResponse = [
    /**
     * The search query string that was used to perform the search.
     * @example "Hello World"
     */
    query: string,
    /**
     * An array of search results titles.
     * @example ["Hello World", "\"Hello, World!\" program", "Hello World (film)", ...]
     */
    results: string[],
    /**
     * An array of descriptions corresponding to each search result.
     * @example ["", "", "", ...]
     */
    descriptions: string[],
    /**
     * An array of URLs corresponding to each search result.
     * @example ["https://en.wikipedia.org/wiki/Hello_World", "https://en.wikipedia.org/wiki/%22Hello,_World!%22_program", ...]
     */
    urls: string[]
];
/**
 * Options for parsing wikitext or page content using the MediaWiki `action=parse` API.
 */
export interface MediaWikiQueryParseOptions {
    /**
     * Title of the page used to interpret the text.
     * Required when using `text`.
     * @example "Main_Page"
     */
    title?: string;
    /**
     * Raw wikitext to parse.
     * Cannot be used together with `page` or `pageid`.
     * @example "Hello '''world'''!"
     */
    text?: string;
    /**
     * Title of an existing page to parse.
     * Cannot be used together with `text` or `title`.
     * @example "Project:Sandbox"
     */
    page?: string;
    /**
     * Page ID of an existing page to parse.
     * Overrides `page` if both are provided.
     * @example 174652
     */
    pageid?: number;
    /**
     * Whether to automatically resolve redirects for `page` or `pageid`.
     * @example true
     */
    redirects?: boolean;
    /**
     * Custom CSS class used to wrap the parsed HTML output.
     * @example "mw-parser-output"
     */
    wrapoutputclass?: string;
}
/**
 * Result returned by the MediaWiki `action=parse` API.
 */
export interface MediaWikiQueryParseResponse {
    warnings?: {
        parse?: {
            warnings: string;
        };
    };
    parse: {
        title: string;
        pageid: number;
        text: string;
        langlinks?: Array<{
            lang: string;
            url: string;
            langname: string;
            autonym: string;
            title: string;
        }>;
        categories?: any[];
        links?: any[];
        templates?: any[];
        images?: string[];
        externallinks?: string[];
        sections?: any[];
        showtoc?: boolean;
        parsewarnings?: string[];
        displaytitle?: string;
        iwlinks?: any[];
        properties?: Record<string, string>;
    };
}
/**
 * A helper class to wrap the parse response and provide convenience methods.
 */
export declare class MediaWikiQueryParseResponseClass implements MediaWikiQueryParseResponse {
    warnings?: {
        parse?: {
            warnings: string;
        };
    };
    parse: MediaWikiQueryParseResponse["parse"];
    constructor(data: MediaWikiQueryParseResponse);
    /**
     * Returns the parsed text content of the page.
     * @example "Hello '''world'''!"
     */
    text(): string;
    /**
     * Returns the parsed HTML content of the page.
     * @example "<p>Hello <strong>world</strong>!</p>"
     */
    html(): string;
    /**
     * Returns the title of the page.
     * @example "Main Page"
     */
    title(): string;
    /**
     * Returns a list of categories for the parsed page.
     * @example ["Living people", "Software developers", "Ukrainians"]
     */
    categories(): string[];
}
/**
 */
export interface MediaWikiQueryCategoriesOptions {
    /**
     * @example "Main_Page"
     */
    title?: string;
}
/**
 * Result returned by the MediaWiki `action=parse` API.
 */
export interface MediaWikiQueryCategoriesResponse {
    /**
     * Continuation token for pagination.
     * This is optional and may not be present in all responses.
     */
    continue: MediaWikiComprehensiveContinueBlock;
    /**
     * The main query result.
     * This contains the categories associated with the specified page.
     */
    query: {
        normalized: MediaWikiQueryNormalizedItem[];
        pages: MediaWikiQueryCategoriesItem[];
    };
}
/**
 * Represents the options for the MediaWiki API's `action=query&prop=revisions` endpoint.
 * Used to retrieve revision history for a specific page.
 */
export interface MediaWikiQueryRevisionsOptions {
    /**
     * The title of the page to retrieve revisions for.
     * @example "JavaScript"
     */
    title: string;
    /**
     * The number of revisions to retrieve.
     * @example 5
     */
    rvlimit: number;
}
/**
 * Result returned by the MediaWiki `action=parse` API.
 * This contains the revisions associated with the specified page.
 */
export interface MediaWikiQueryRevisionsResponse extends MediaWikiBaseResponse {
    /**
     * Continuation token for pagination.
     * This is optional and may not be present in all responses.
     */
    query: {
        /**
         * Information about normalized titles.
         */
        normalized: MediaWikiQueryNormalizedItem[];
        /**
         * Information about the revisions of the page.
         */
        pages: MediaWikiQueryRevisionsItem[];
    };
}
/**
 * Represents the options for the MediaWiki API's `action=query&prop=extracts` endpoint.
 * Used to retrieve a summary of a specific page.
 */
export interface MediaWikiQuerySummaryOptions {
    /**
     * The title of the page to retrieve a summary for.
     * @example "JavaScript"
     */
    title: string;
}
/**
 * Result returned by the MediaWiki `action=parse` API.
 * This contains the summary associated with the specified page.
 */
export interface MediaWikiQuerySummaryResponse extends MediaWikiBaseResponse {
    /**
     * Continuation token for pagination.
     * This is optional and may not be present in all responses.
     */
    query: {
        /**
         * Information about normalized titles.
         */
        normalized: MediaWikiQueryNormalizedItem[];
        /**
         * Information about redirected titles.
         */
        pages: MediaWikiQuerySummaryItem[];
    };
}
/**
 * A helper class to wrap the summary response and provide convenience methods.
 */
export declare class MediaWikiQuerySummaryResponseClass implements MediaWikiQuerySummaryResponse {
    batchcomplete: boolean;
    query: MediaWikiQuerySummaryResponse["query"];
    constructor(data: MediaWikiQuerySummaryResponse);
    /**
     * Returns the text content of the page.
     * @example "JavaScript is a programming language..."
     */
    text(): string;
}
/**
 * Represents the detailed response data received upon a successful user login
 * via the MediaWiki API's `action=login` endpoint.
 * This interface describes the information returned to confirm login and provide necessary tokens.
 */
export interface MediaWikiLoginSuccessDetails {
    /**
     * The result of the login attempt, typically "Success" for a successful login.
     */
    result: string;
    /**
     * The numeric user ID of the successfully logged-in user.
     */
    lguserid: number;
    /**
     * The username of the successfully logged-in user.
     */
    lgusername: string;
    /**
     * A temporary token received upon successful login, often referred to as `logintoken`.
     * This token is usually required for subsequent API actions that modify data
     * (e.g., obtaining a CSRF token for edits).
     */
    token: string;
    /**
     * A descriptive message regarding the login result. For a successful login,
     * this might be empty or a general success message. It is NOT the token type.
     */
    reason: string;
}
/**
 * Represents the full response structure returned by the MediaWiki API's `action=login` endpoint.
 * This interface describes the complete JSON object received after attempting to log in a user.
 */
export interface MediaWikiLoginApiResponse {
    /**
     * Contains the detailed information about the login attempt, including the result status,
     * user ID, username, and any relevant tokens for subsequent API interactions.
     * This property is typically present and populated upon both successful and failed login attempts.
     */
    login: MediaWikiLoginSuccessDetails;
}
/**
 * Represents the structure of the user information returned by the MediaWiki API's `action=query&meta=userinfo` endpoint.
 * This interface defines the shape of the current user's data.
 * @see https://www.mediawiki.org/wiki/API:Userinfo
 */
export interface MediaWikiUser {
    /** The numerical ID of the current user. */
    userId: number;
    /** The username of the current user. */
    userName: string;
}
/**
 * Represents a comprehensive collection of user preferences and settings, typically returned
 * as part of the `userinfo` data from the MediaWiki API's `action=query&meta=userinfo` endpoint.
 * These properties control various aspects of the user's interface experience, editing behavior,
 * notification settings, and more.
 */
export interface MediaWikiQueryUserInfoOptions {
    /**
     * Determines if the Vector skin should render page content with a limited maximum width for readability.
     * `1` (or `true`) enables limited width, `0` (or `false`) enables full width.
     */
    "vector-limited-width": 1 | 0 | boolean;
    /**
     * Controls whether the page tools sidebar in the Vector skin remains pinned (fixed) on scroll.
     * `1` (or `true`) pins the tools, `0` (or `false`) unpins them.
     */
    "vector-page-tools-pinned": 1 | 0 | boolean;
    /**
     * Controls whether the main navigation menu in the Vector skin remains pinned (fixed) on scroll.
     * `1` (or `true`) pins the menu, `0` (or `false`) unpins it.
     */
    "vector-main-menu-pinned": 1 | 0 | boolean;
    /**
     * Controls whether the table of contents (TOC) in the Vector skin remains pinned (fixed) on scroll.
     * `1` (or `true`) pins the TOC, `0` (or `false`) unpins it.
     */
    "vector-toc-pinned": 1 | 0 | boolean;
    /**
     * Controls whether the client-side preferences panel in the Vector skin remains pinned (fixed) on scroll.
     * `1` (or `true`) pins the panel, `0` (or `false`) unpins it.
     */
    "vector-client-prefs-pinned": 1 | 0 | boolean;
    /**
     * Specifies the preferred font size for text display within the Vector skin.
     * The specific values and their interpretation depend on the MediaWiki configuration.
     */
    "vector-font-size": number;
    /**
     * Specifies the preferred theme for the Vector skin, e.g., "dark", "light", or a custom theme name.
     */
    "vector-theme": string;
    /**
     * Indicates whether the user prefers to use the source code editor for editing wikitext.
     * `1` (or `true`) enables it, `0` (or `false`) disables it.
     */
    usecodeeditor: 1 | 0 | boolean;
    /**
     * Indicates whether the user prefers to use the beta toolbar features in the editor.
     */
    usebetatoolbar: boolean;
    /**
     * Controls whether the WikiEditor provides a real-time preview of changes while editing.
     * `1` (or `true`) enables real-time preview, `0` (or `false`) disables it.
     */
    "wikieditor-realtimepreview": 1 | 0 | boolean;
    /**
     * Controls whether VisualEditor should automatically disable itself for certain page types or conditions.
     * `1` (or `true`) enables auto-disable, `0` (or `false`) disables it.
     */
    "visualeditor-autodisable": 1 | 0 | boolean;
    /**
     * Controls a temporary beta disable flag for VisualEditor, typically used during testing or issues.
     * `1` (or `true`) temporarily disables, `0` (or `false`) enables.
     */
    "visualeditor-betatempdisable": 1 | 0 | boolean;
    /**
     * Indicates whether collaborative editing features are enabled for VisualEditor.
     * `1` (or `true`) enables collaboration, `0` (or `false`) disables it.
     */
    "visualeditor-collab": 1 | 0 | boolean;
    /**
     * Specifies the preferred editor interface when using VisualEditor, e.g., "visual", "wikitext".
     */
    "visualeditor-editor": string;
    /**
     * Global toggle for enabling or disabling VisualEditor functionality for the user.
     * `1` (or `true`) enables VisualEditor, `0` (or `false`) disables it.
     */
    "visualeditor-enable": 1 | 0 | boolean;
    /**
     * Controls whether the "Welcome to VisualEditor Beta" dialog should be hidden.
     * `1` (or `true`) hides the welcome dialog, `0` (or `false`) shows it.
     */
    "visualeditor-hidebetawelcome": 1 | 0 | boolean;
    /**
     * Controls whether the tab dialog (e.g., for switching between visual and wikitext modes) should be hidden.
     * `1` (or `true`) hides the tab dialog, `0` (or `false`) shows it.
     */
    "visualeditor-hidetabdialog": 1 | 0 | boolean;
    /**
     * Indicates a preference for using new wikitext editing features within VisualEditor.
     * `1` (or `true`) enables new wikitext features, `0` (or `false`) disables them.
     */
    "visualeditor-newwikitext": 1 | 0 | boolean;
    /**
     * Specifies the display mode for VisualEditor tabs, e.g., "prefer-visual", "prefer-wikitext", "separate-tabs".
     */
    "visualeditor-tabs": string;
    /**
     * Global toggle for enabling or disabling the content translation feature for the user.
     * `1` (or `true`) enables translation, `0` (or `false`) disables it.
     */
    translate: 1 | 0 | boolean;
    /**
     * A string representing a comma-separated list of preferred languages for content translation.
     */
    "translate-editlangs": string;
    /**
     * A string representing a comma-separated list of recently used translation groups.
     */
    "translate-recent-groups": string;
    /**
     * A string representing preferences for Universal Language Selector (ULS), typically in JSON format.
     */
    "uls-preferences": string;
    /**
     * Indicates whether compact language links are enabled, grouping less common language links.
     */
    "compact-language-links": boolean;
    /**
     * Indicates whether the user wants to receive web notifications for failed login attempts.
     */
    "echo-subscriptions-web-login-fail": boolean;
    /**
     * Indicates whether the user wants to receive email notifications for failed login attempts.
     */
    "echo-subscriptions-email-login-fail": boolean;
    /**
     * Indicates whether the user wants to receive web notifications for successful login attempts.
     */
    "echo-subscriptions-web-login-success": boolean;
    /**
     * Indicates whether the user wants to receive email notifications for successful login attempts.
     */
    "echo-subscriptions-email-login-success": boolean;
    /**
     * Indicates whether the user wants to receive web notifications when someone thanks them for an edit.
     */
    "echo-subscriptions-web-edit-thank": boolean;
    /**
     * Indicates whether the user wants to receive email notifications when someone thanks them for an edit.
     */
    "echo-subscriptions-email-edit-thank": boolean;
    /**
     * Specifies the rendering preference for mathematical formulas, e.g., "mathml", "source", "svg".
     */
    math: string;
    /**
     * Controls whether math popups are enabled when hovering over mathematical formulas.
     * `"1"` (or `"true"`) enables popups, `"0"` (or `"false"`) disables them. Can also be other string values.
     */
    "math-popups": "1" | "0" | string;
    /**
     * Specific preference related to Semantic MediaWiki (SMW) for showing an entity issue panel.
     */
    "smw-prefs-general-options-show-entity-issue-panel": boolean;
    /**
     * Specifies the frequency for receiving aggregated email notifications (e.g., daily, weekly).
     * The exact numerical values depend on MediaWiki configuration.
     */
    "echo-email-frequency": number;
    /**
     * Indicates whether the user wants to disable emails for notifications that have already been read on the web.
     */
    "echo-dont-email-read-notifications": boolean;
    /**
     * Indicates whether the user wants to receive a copy (CC) of emails sent to other users through the wiki.
     * `1` (or `true`) enables CC, `0` (or `false`) disables it.
     */
    ccmeonemails: 1 | 0 | boolean;
    /**
     * The user's preferred date format.
     */
    date: string;
    /**
     * Indicates whether only the differences (diff) are shown when comparing revisions, without surrounding context.
     * `1` (or `true`) shows only diff, `0` (or `false`) shows context.
     */
    diffonly: 1 | 0 | boolean;
    /**
     * Specifies the preferred diff view type, e.g., "inline", "side-by-side".
     */
    "diff-type": string;
    /**
     * Indicates whether the user wants to disable all email notifications from the wiki.
     * `1` (or `true`) disables mail, `0` (or `false`) enables it.
     */
    disablemail: 1 | 0 | boolean;
    /**
     * Specifies the preferred font for the editing area.
     */
    editfont: string;
    /**
     * Indicates whether double-clicking on a section of a page will open it for editing.
     * `1` (or `true`) enables edit on double click, `0` (or `false`) disables it.
     */
    editondblclick: 1 | 0 | boolean;
    /**
     * Indicates whether edit recovery features are enabled, allowing restoration of unsaved edits after a crash.
     * `1` (or `true`) enables recovery, `0` (or `false`) disables it.
     */
    editrecovery: 1 | 0 | boolean;
    /**
     * Indicates whether right-clicking on a section of a page will open it for editing.
     * `1` (or `true`) enables edit on right click, `0` (or `false`) disables it.
     */
    editsectiononrightclick: 1 | 0 | boolean;
    /**
     * Indicates whether new users are allowed to send emails to this user.
     * `1` (or `true`) allows, `0` (or `false`) disallows.
     */
    "email-allow-new-users": 1 | 0 | boolean;
    /**
     * Indicates whether the user receives email notifications for minor edits on pages they are watching.
     * `1` (or `true`) enables, `0` (or `false`) disables.
     */
    enotifminoredits: 1 | 0 | boolean;
    /**
     * Indicates whether the user's email address is revealed in email notifications sent to others.
     * `1` (or `true`) reveals, `0` (or `false`) hides.
     */
    enotifrevealaddr: 1 | 0 | boolean;
    /**
     * Indicates whether the user receives email notifications for changes to user talk pages they are watching.
     * `1` (or `true`) enables, `0` (or `false`) disables.
     */
    enotifusertalkpages: 1 | 0 | boolean;
    /**
     * Indicates whether the user receives email notifications for changes to pages on their watchlist.
     * `1` (or `true`) enables, `0` (or `false`) disables.
     */
    enotifwatchlistpages: 1 | 0 | boolean;
    /**
     * Indicates whether the user's watchlist displays all changes, not just the latest.
     * `1` (or `true`) extends watchlist, `0` (or `false`) limits it.
     */
    extendwatchlist: 1 | 0 | boolean;
    /**
     * Indicates whether the user prefers a "fancy signature" (e.g., with custom formatting or links).
     * `1` (or `true`) enables fancy signature, `0` (or `false`) disables.
     */
    fancysig: 1 | 0 | boolean;
    /**
     * Indicates whether the user is forced to enter an edit summary for every edit.
     * `1` (or `true`) forces summary, `0` (or `false`) allows skipping.
     */
    forceeditsummary: 1 | 0 | boolean;
    /**
     * Indicates whether "safe mode" (e.g., disabling user scripts) is always forced for the user.
     * `1` (or `true`) forces safe mode, `0` (or `false`) does not.
     */
    forcesafemode: 1 | 0 | boolean;
    /**
     * The user's self-identified gender, if provided, e.g., "unknown", "male", "female".
     */
    gender: "unknown" | "male" | "female" | string;
    /**
     * Indicates whether hidden categories are displayed for the user.
     * `1` (or `true`) shows hidden categories, `0` (or `false`) hides them.
     */
    hidecategorization: 1 | 0 | boolean;
    /**
     * Indicates whether minor edits are hidden by default in recent changes and watchlists.
     * `1` (or `true`) hides minor edits, `0` (or `false`) shows them.
     */
    hideminor: 1 | 0 | boolean;
    /**
     * Indicates whether patrolled edits are hidden by default in recent changes and watchlists.
     * `1` (or `true`) hides patrolled edits, `0` (or `false`) shows them.
     */
    hidepatrolled: 1 | 0 | boolean;
    /**
     * The user's preferred default image size for display in articles (in pixels).
     */
    imagesize: number;
    /**
     * Indicates whether the "Mark as minor edit" checkbox is checked by default when editing.
     * `1` (or `true`) defaults to minor, `0` (or `false`) defaults to not minor.
     */
    minordefault: 1 | 0 | boolean;
    /**
     * Indicates whether newly created pages are hidden from the user's view if they have been patrolled.
     * `1` (or `true`) hides patrolled new pages, `0` (or `false`) shows them.
     */
    newpageshidepatrolled: 1 | 0 | boolean;
    /**
     * The user's preferred nickname, which may be used in signatures or other contexts.
     */
    nickname: string;
    /**
     * Indicates whether diffs for rollback actions are shown to the user.
     * `1` (or `true`) hides rollback diffs, `0` (or `false`) shows them.
     */
    norollbackdiff: 1 | 0 | boolean;
    /**
     * Indicates whether the user prefers to use HTTPS for all connections to the wiki.
     * `1` (or `true`) prefers HTTPS, `0` (or `false`) allows HTTP.
     */
    prefershttps: 1 | 0 | boolean;
    /**
     * Indicates whether a preview of content is shown automatically when the user first starts editing.
     * `1` (or `true`) shows preview on first edit, `0` (or `false`) does not.
     */
    previewonfirst: 1 | 0 | boolean;
    /**
     * Indicates whether the preview of content is displayed above the edit box.
     * `1` (or `true`) shows preview on top, `0` (or `false`) shows it below.
     */
    previewontop: 1 | 0 | boolean;
    /**
     * Indicates whether user-specific CSS/JS scripts are enabled for the current skin.
     * `1` (or `true`) enables, `0` (or `false`) disables.
     */
    "pst-cssjs": 1 | 0 | boolean;
    /**
     * The number of days to display in the recent changes list.
     */
    rcdays: number;
    /**
     * Indicates whether enhanced filters for recent changes are disabled for the user.
     * `1` (or `true`) disables enhanced filters, `0` (or `false`) enables them.
     */
    "rcenhancedfilters-disable": 1 | 0 | boolean;
    /**
     * The maximum number of entries to display in the recent changes list.
     */
    rclimit: number;
    /**
     * Indicates whether the user is required to have a confirmed email address.
     * `1` (or `true`) requires email, `0` (or `false`) does not.
     */
    requireemail: 1 | 0 | boolean;
    /**
     * Indicates whether search results should match redirects as direct hits.
     */
    "search-match-redirect": boolean;
    /**
     * Specifies the default special page to redirect to from the main search bar, e.g., "search".
     */
    "search-special-page": string;
    /**
     * Indicates whether thumbnails should be shown in search results for extra namespaces.
     */
    "search-thumbnail-extra-namespaces": boolean;
    /**
     * The maximum number of search results to display per page.
     */
    searchlimit: number;
    /**
     * Indicates whether hidden categories are displayed in page information.
     * `1` (or `true`) shows hidden categories, `0` (or `false`) hides them.
     */
    showhiddencats: 1 | 0 | boolean;
    /**
     * Indicates whether the number of users watching a page is displayed.
     * `1` (or `true`) shows count, `0` (or `false`) hides it.
     */
    shownumberswatching: 1 | 0 | boolean;
    /**
     * Indicates whether a confirmation dialog appears before performing a rollback action.
     * `1` (or `true`) shows confirmation, `0` (or `false`) does not.
     */
    showrollbackconfirmation: 1 | 0 | boolean;
    /**
     * The user's currently selected skin (theme) for the wiki interface, e.g., "Vector", "MonoBook".
     */
    skin: string;
    /**
     * Indicates whether the responsive features of the selected skin are enabled.
     * `1` (or `true`) enables responsive design, `0` (or `false`) disables it.
     */
    "skin-responsive": 1 | 0 | boolean;
    /**
     * The user's preferred default thumbnail image size (in pixels).
     */
    thumbsize: number;
    /**
     * Specifies the user's preference for how links are underlined: `0` (never), `1` (always), `2` (browser default).
     */
    underline: number;
    /**
     * Indicates whether an "unsaved changes" warning is displayed when navigating away from an edit page.
     * `1` (or `true`) enables warning, `0` (or `false`) disables it.
     */
    useeditwarning: 1 | 0 | boolean;
    /**
     * Indicates whether live preview functionality is enabled during editing.
     * `1` (or `true`) enables live preview, `0` (or `false`) disables it.
     */
    uselivepreview: 1 | 0 | boolean;
    /**
     * Indicates whether the new recent changes interface is enabled for the user.
     * `1` (or `true`) enables new interface, `0` (or `false`) uses old one.
     */
    usenewrc: 1 | 0 | boolean;
    /**
     * Indicates whether newly created pages by the user are automatically added to their watchlist.
     * `1` (or `true`) watches creations, `0` (or `false`) does not.
     */
    watchcreations: 1 | 0 | boolean;
    /**
     * Indicates whether pages edited by the user are automatically added to their watchlist.
     * `1` (or `true`) watches edited pages, `0` (or `false`) does not.
     */
    watchdefault: 1 | 0 | boolean;
    /**
     * Indicates whether pages deleted by the user are automatically added to their watchlist.
     * `1` (or `true`) watches deletions, `0` (or `false`) does not.
     */
    watchdeletion: 1 | 0 | boolean;
    /**
     * The number of days to display entries in the user's watchlist.
     */
    watchlistdays: number;
    /**
     * Indicates whether edits by anonymous users are hidden from the watchlist.
     * `1` (or `true`) hides anonymous edits, `0` (or `false`) shows them.
     */
    watchlisthideanons: 1 | 0 | boolean;
    /**
     * Indicates whether edits by bots are hidden from the watchlist.
     * `1` (or `true`) hides bot edits, `0` (or `false`) shows them.
     */
    watchlisthidebots: 1 | 0 | boolean;
    /**
     * Indicates whether categorization changes are hidden from the watchlist.
     * `1` (or `true`) hides categorization, `0` (or `false`) shows them.
     */
    watchlisthidecategorization: 1 | 0 | boolean;
    /**
     * Indicates whether edits by logged-in users (other than self) are hidden from the watchlist.
     * `1` (or `true`) hides LIU edits, `0` (or `false`) shows them.
     */
    watchlisthideliu: 1 | 0 | boolean;
    /**
     * Indicates whether minor edits are hidden from the watchlist.
     * `1` (or `true`) hides minor edits, `0` (or `false`) shows them.
     */
    watchlisthideminor: 1 | 0 | boolean;
    /**
     * Indicates whether the user's own edits are hidden from the watchlist.
     * `1` (or `true`) hides own edits, `0` (or `false`) shows them.
     */
    watchlisthideown: 1 | 0 | boolean;
    /**
     * Indicates whether patrolled edits are hidden from the watchlist.
     * `1` (or `true`) hides patrolled edits, `0` (or `false`) shows them.
     */
    watchlisthidepatrolled: 1 | 0 | boolean;
    /**
     * Indicates whether the watchlist should automatically reload for new changes.
     * `1` (or `true`) enables auto-reload, `0` (or `false`) disables it.
     */
    watchlistreloadautomatically: 1 | 0 | boolean;
    /**
     * Indicates whether "unwatch" links are displayed next to watchlist entries.
     * `1` (or `true`) shows unwatch links, `0` (or `false`) hides them.
     */
    watchlistunwatchlinks: 1 | 0 | boolean;
    /**
     * Indicates whether pages moved by the user are automatically added to their watchlist.
     * `1` (or `true`) watches moves, `0` (or `false`) does not.
     */
    watchmoves: 1 | 0 | boolean;
    /**
     * Indicates whether pages that are rolled back by the user are automatically added to their watchlist.
     * `1` (or `true`) watches rollbacks, `0` (or `false`) does not.
     */
    watchrollback: 1 | 0 | boolean;
    /**
     * Indicates whether files uploaded by the user are automatically added to their watchlist.
     * `1` (or `true`) watches uploads, `0` (or `false`) does not.
     */
    watchuploads: 1 | 0 | boolean;
    /**
     * Indicates whether enhanced filters for the watchlist are disabled for the user.
     * `1` (or `true`) disables enhanced filters, `0` (or `false`) enables them.
     */
    "wlenhancedfilters-disable": 1 | 0 | boolean;
    /**
     * The maximum number of entries to display in the user's watchlist.
     */
    wllimit: number;
    /**
     * A string specifying the user's time zone correction, e.g., "0:00", "-5:00", "+2:00".
     */
    timecorrection: string;
    /**
     * The user's preferred interface language code, e.g., "en", "ru", "fr".
     */
    language: string;
    /**
     * The user's preferred language variant (e.g., for Chinese, Serbian, etc.).
     */
    variant: string;
    /**
     * Specific language variant preference for Belarusian (Taraskievica orthography).
     */
    "variant-ban": string;
    /**
     * Specific language variant preference for English (often used for British/American distinctions, though less common).
     */
    "variant-en": string;
    /**
     * Specific language variant preference for Crimean Tatar.
     */
    "variant-crh": string;
    /**
     * Specific language variant preference for Gan Chinese.
     */
    "variant-gan": string;
    /**
     * Specific language variant preference for Inuktitut.
     */
    "variant-iu": string;
    /**
     * Specific language variant preference for Kurdish.
     */
    "variant-ku": string;
    /**
     * Specific language variant preference for Serbo-Croatian.
     */
    "variant-sh": string;
    /**
     * Specific language variant preference for Shilha (Tashelhit).
     */
    "variant-shi": string;
    /**
     * Specific language variant preference for Serbian.
     */
    "variant-sr": string;
    /**
     * Specific language variant preference for Talysh.
     */
    "variant-tg": string;
    /**
     * Specific language variant preference for Talyah.
     */
    "variant-tly": string;
    /**
     * Specific language variant preference for Uzbek.
     */
    "variant-uz": string;
    /**
     * Specific language variant preference for Wu Chinese.
     */
    "variant-wuu": string;
    /**
     * Specific language variant preference for Chinese, encompassing various simplified/traditional options.
     */
    "variant-zh": string;
    /** Includes the main (article) namespace in search. */
    searchNs0: 1 | 0 | boolean;
    /** Includes the Talk namespace in search. */
    searchNs1: 1 | 0 | boolean;
    /** Includes the User namespace in search. */
    searchNs2: 1 | 0 | boolean;
    /** Includes the User talk namespace in search. */
    searchNs3: 1 | 0 | boolean;
    /** Includes the Project/Wiki namespace in search. */
    searchNs4: 1 | 0 | boolean;
    /** Includes the Project talk/Wiki talk namespace in search. */
    searchNs5: 1 | 0 | boolean;
    /** Includes the File/Image namespace in search. */
    searchNs6: 1 | 0 | boolean;
    /** Includes the File talk/Image talk namespace in search. */
    searchNs7: 1 | 0 | boolean;
    /** Includes the MediaWiki namespace (system messages) in search. */
    searchNs8: 1 | 0 | boolean;
    /** Includes the MediaWiki talk namespace in search. */
    searchNs9: 1 | 0 | boolean;
    /** Includes the Template namespace in search. */
    searchNs10: 1 | 0 | boolean;
    /** Includes the Template talk namespace in search. */
    searchNs11: 1 | 0 | boolean;
    /** Includes the Help namespace in search. */
    searchNs12: 1 | 0 | boolean;
    /** Includes the Help talk namespace in search. */
    searchNs13: 1 | 0 | boolean;
    /** Includes the Category namespace in search. */
    searchNs14: 1 | 0 | boolean;
    /** Includes the Category talk namespace in search. */
    searchNs15: 1 | 0 | boolean;
    /** Includes custom namespace 102 (e.g., Module) in search. */
    searchNs102: 1 | 0 | boolean;
    /** Includes custom namespace 103 (e.g., Module talk) in search. */
    searchNs103: 1 | 0 | boolean;
    /** Includes custom namespace 108 (e.g., Book) in search. */
    searchNs108: 1 | 0 | boolean;
    /** Includes custom namespace 109 (e.g., Book talk) in search. */
    searchNs109: 1 | 0 | boolean;
    /** Includes custom namespace 112 (e.g., Draft) in search. */
    searchNs112: 1 | 0 | boolean;
    /** Includes custom namespace 113 (e.g., Draft talk) in search. */
    searchNs113: 1 | 0 | boolean;
    /** Includes custom namespace 114 (e.g., TimedText) in search. */
    searchNs114: 1 | 0 | boolean;
    /** Includes custom namespace 115 (e.g., TimedText talk) in search. */
    searchNs115: 1 | 0 | boolean;
    /** Includes custom namespace 710 (e.g., Labeled Data) in search. */
    searchNs710: 1 | 0 | boolean;
    /** Includes custom namespace 711 (e.g., Labeled Data talk) in search. */
    searchNs711: 1 | 0 | boolean;
    /** Includes custom namespace 828 (e.g., Special) in search. */
    searchNs828: 1 | 0 | boolean;
    /** Includes custom namespace 829 (e.g., Special talk) in search. */
    searchNs829: 1 | 0 | boolean;
    /** Includes custom namespace 1198 (e.g., Gadget) in search. */
    searchNs1198: 1 | 0 | boolean;
    /** Includes custom namespace 1199 (e.g., Gadget talk) in search. */
    searchNs1199: 1 | 0 | boolean;
    /**
     * Indicates whether the Multimedia Viewer is enabled for the user.
     * `1` (or `true`) enables, `0` (or `false`) disables.
     */
    "multimediaviewer-enable": 1 | 0 | boolean;
    /**
     * Specifies the preferred format for email notifications (e.g., "html", "plain-text").
     */
    "echo-email-format": string;
    /**
     * Indicates whether the user receives web notifications for system messages (e.g., site notices).
     */
    "echo-subscriptions-web-system": boolean;
    /**
     * Indicates whether the user receives email notifications for system messages.
     */
    "echo-subscriptions-email-system": boolean;
    /**
     * Indicates whether the user wants to disable email notifications for system messages that have a web notification counterpart.
     */
    "echo-subscriptions-email-system-noemail": boolean;
    /**
     * Indicates whether the user wants to disable web notifications for system messages that have an email notification counterpart.
     */
    "echo-subscriptions-web-system-noemail": boolean;
    /**
     * Indicates whether the user wants to receive only email notifications for system messages, suppressing web notifications.
     */
    "echo-subscriptions-email-system-emailonly": boolean;
    /**
     * Indicates whether the user wants to receive only web notifications for system messages, suppressing email notifications.
     */
    "echo-subscriptions-web-system-emailonly": boolean;
    /**
     * Indicates whether the user receives email notifications for changes to their user rights.
     */
    "echo-subscriptions-email-user-rights": boolean;
    /**
     * Indicates whether the user receives web notifications for changes to their user rights.
     */
    "echo-subscriptions-web-user-rights": boolean;
    /**
     * Indicates whether the user receives email notifications for 'other' general events not covered by specific categories.
     */
    "echo-subscriptions-email-other": boolean;
    /**
     * Indicates whether the user receives web notifications for 'other' general events.
     */
    "echo-subscriptions-web-other": boolean;
    /**
     * Indicates whether the user receives email notifications for edits to their user talk page.
     */
    "echo-subscriptions-email-edit-user-talk": boolean;
    /**
     * Indicates whether the user receives web notifications for edits to their user talk page.
     */
    "echo-subscriptions-web-edit-user-talk": boolean;
    /**
     * Indicates whether the user receives email notifications for edits to their user page.
     */
    "echo-subscriptions-email-edit-user-page": boolean;
    /**
     * Indicates whether the user receives web notifications for edits to their user page.
     */
    "echo-subscriptions-web-edit-user-page": boolean;
    /**
     * Indicates whether the user receives email notifications when their edits are reverted.
     */
    "echo-subscriptions-email-reverted": boolean;
    /**
     * Indicates whether the user receives web notifications when their edits are reverted.
     */
    "echo-subscriptions-web-reverted": boolean;
    /**
     * Indicates whether the user receives email notifications when an article they created or edited is linked to.
     */
    "echo-subscriptions-email-article-linked": boolean;
    /**
     * Indicates whether the user receives web notifications when an article they created or edited is linked to.
     */
    "echo-subscriptions-web-article-linked": boolean;
    /**
     * Indicates whether the user receives email notifications when they are mentioned (e.g., in a talk page comment).
     */
    "echo-subscriptions-email-mention": boolean;
    /**
     * Indicates whether the user receives web notifications when they are mentioned.
     */
    "echo-subscriptions-web-mention": boolean;
    /**
     * Indicates whether the user receives email notifications when someone emails them via the "Email user" feature.
     */
    "echo-subscriptions-email-emailuser": boolean;
    /**
     * Indicates whether the user receives web notifications when someone emails them via the "Email user" feature.
     */
    "echo-subscriptions-web-emailuser": boolean;
    /**
     * Indicates whether the user receives email notifications when someone thanks them for an edit (specific 'thank you' notification).
     */
    "echo-subscriptions-email-thank-you-edit": boolean;
    /**
     * Indicates whether the user receives web notifications when someone thanks them for an edit (specific 'thank you' notification).
     */
    "echo-subscriptions-web-thank-you-edit": boolean;
    /**
     * The timestamp when the user's email address was authenticated, if available.
     * This field is optional and might not be present for all users or API calls.
     */
    emailauthenticated?: string;
    /**
     * The timestamp when the user account was registered, if available.
     * This field is optional and might not be present for all users or API calls.
     */
    registrationdate?: string;
    /**
     * Allows for additional properties not explicitly defined in this interface.
     * This is useful for handling new preferences or site-specific custom preferences
     * that might be returned by the MediaWiki API.
     */
    [key: string]: any;
}
/**
 * Represents the rate limits for various actions in the MediaWiki API.
 * This includes limits for editing, uploading, and other actions.
 */
export interface MediaWikiQueryUserRateLimitValue {
    /** The number of hits allowed within the specified time frame. */
    hits: number;
    /** The time frame in seconds for the rate limit. */
    seconds: number;
}
/**
 * Represents the rate limits for various actions in the MediaWiki API.
 * This includes limits for editing, uploading, and other actions.
 */
export interface MediaWikiQueryUserRateLimitEntry {
    ip?: MediaWikiQueryUserRateLimitValue;
    user?: MediaWikiQueryUserRateLimitValue;
}
/**
 * Represents the rate limits for various actions in the MediaWiki API.
 * This includes limits for editing, uploading, and other actions.
 */
export interface MediaWikiQueryUserRateLimits {
    /**
     * Rate limits for editing actions.
     */
    edit?: MediaWikiQueryUserRateLimitEntry;
    /**
     * Rate limits for uploading actions.
     */
    upload?: MediaWikiQueryUserRateLimitEntry;
    /**
     * Rate limits for moving pages.
     */
    mailpassword?: MediaWikiQueryUserRateLimitEntry;
    /**
     * Rate limits for sending emails.
     */
    sendemail?: MediaWikiQueryUserRateLimitEntry;
    /**
     * Rate limits for purging pages.
     */
    purge?: MediaWikiQueryUserRateLimitEntry;
    /**
     * Rate limits for deleting pages.
     */
    linkpurge?: MediaWikiQueryUserRateLimitEntry;
    /**
     * Rate limits for creating new pages.
     */
    renderfile?: MediaWikiQueryUserRateLimitEntry;
    /**
     * Rate limits for rendering files with non-standard extensions.
     */
    "renderfile-nonstandard"?: MediaWikiQueryUserRateLimitEntry;
    /**
     * Rate limits for editing user talk pages.
     */
    stashedit?: MediaWikiQueryUserRateLimitEntry;
    /**
     * Rate limits for editing user sandbox pages.
     */
    stashbasehtml?: MediaWikiQueryUserRateLimitEntry;
    /**
     * Rate limits for editing user talk pages with a specific namespace.
     */
    changetags?: MediaWikiQueryUserRateLimitEntry;
    /**
     * Rate limits for changing tags on pages.
     */
    [key: string]: MediaWikiQueryUserRateLimitEntry | undefined;
}
/**
 * Represents a single preferred language entry within the user's `acceptlang` preferences,
 * typically returned as part of the `userinfo` data from the MediaWiki API.
 * This structure mirrors an item from an HTTP `Accept-Language` header.
 */
export interface MediaWikiQueryUserAcceptLangItem {
    /**
     * The quality factor (q-value) for the language, indicating preference.
     * A higher number (up to 1.0) means a stronger preference.
     */
    q: number;
    /**
     * The language code (e.g., "en", "ru", "fr-CA").
     */
    code: string;
}
/**
 * Represents the IDs of a user across different MediaWiki contexts.
 * This can include a local wiki ID and a global account ID if applicable.
 */
export interface MediaWikiQueryUserCentralIds {
    /**
     * The unique identifier for the user account on the current local wiki.
     */
    local: number;
    /**
     * The unique identifier for the user's global account (e.g., SUL account ID), if present.
     * This ID is consistent across all wikis participating in the global account system.
     */
    global?: number;
}
/**
 * Indicates whether a global user account is attached or linked to a local account on the current wiki.
 */
export interface MediaWikiQueryUserAttachedLocal {
    /**
     * `true` if the global account is attached to a local account on this wiki; `false` otherwise.
     */
    local: boolean;
}
/**
 * Represents comprehensive detailed information about the current user,
 * as returned by the MediaWiki API's `action=query&meta=userinfo` endpoint.
 * This includes user IDs, names, groups, rights, preferences, and more.
 */
export interface MediaWikiQueryUserInfoDetails {
    /** The unique identifier of the user account. */
    id: number;
    /** The username of the user account. */
    name: string;
    /**
     * Indicates if the user is anonymous (not logged in).
     * This property is typically present and `true` for anonymous users.
     */
    anon?: boolean;
    /**
     * Indicates if the user has new messages on their talk page.
     * This property is typically present and `true` if new messages are available.
     */
    messages?: boolean;
    /** A list of primary groups the user explicitly belongs to (e.g., 'sysop', 'patroller'). */
    groups: string[];
    /**
     * A more detailed list of group memberships, potentially including expiry dates or other metadata.
     * The exact structure of elements within this array depends on the MediaWiki configuration.
     */
    groupmemberships: any[];
    /** A list of implicit groups the user belongs to (e.g., 'user', 'autoconfirmed'). */
    implicitgroups: string[];
    /** A list of specific user rights (permissions) granted to the user (e.g., 'edit', 'delete'). */
    rights: string[];
    /**
     * Information about groups the user can add or remove themselves from,
     * or add/remove other users from.
     */
    changeablegroups: {
        /** Groups that the current user can add others to. */
        add: string[];
        /** Groups that the current user can remove others from. */
        remove: string[];
        /** Groups that the current user can add themselves to. */
        "add-self": string[];
        /** Groups that the current user can remove themselves from. */
        "remove-self": string[];
    };
    /**
     * User-specific preferences and settings, often related to UI appearance (e.g., Vector skin options)
     * or editor behavior.
     */
    options: MediaWikiQueryUserInfoOptions;
    /** The total number of edits made by the user. */
    editcount: number;
    /**
     * Details about the user's current API rate limits (e.g., maximum requests per minute).
     * This reflects actual limits enforced by the API.
     */
    ratelimits: MediaWikiQueryUserRateLimits;
    /**
     * Theoretical rate limits for the user, which might differ from `ratelimits`
     * if certain conditions apply (e.g., bot flags, special permissions).
     */
    theoreticalratelimits?: MediaWikiQueryUserRateLimits;
    /** The user's real name, if provided and publicly accessible. */
    realname?: string;
    /** The user's email address, if provided and publicly accessible (e.g., for confirmed users). */
    email?: string;
    /**
     * The timestamp when the user's email address was authenticated, in ISO 8601 format.
     * Present only if the email address has been confirmed.
     */
    emailauthenticated?: string;
    /** The timestamp when the user registered, in ISO 8601 format. */
    registrationdate?: string;
    /**
     * An array of language codes representing the user's accepted languages,
     * often derived from their browser settings or user preferences.
     */
    acceptlang?: MediaWikiQueryUserAcceptLangItem[];
    /**
     * The number of unread notifications or messages for the user.
     * Present only if notifications are enabled and there are unread items.
     */
    unreadcount?: number;
    /**
     * Contains local and/or global IDs for the user, useful for identifying accounts
     * across different wikis or central user management systems.
     */
    centralids?: MediaWikiQueryUserCentralIds;
    /**
     * Indicates whether a global account is linked to the local account on the current wiki.
     * This is useful for understanding the global account integration status.
     */
    attachedlocal?: MediaWikiQueryUserAttachedLocal;
    /**
     * Indicates whether the current user is able to create new user accounts.
     * This is typically `true` for administrators or users with specific permissions.
     */
    cancreateaccount?: boolean;
}
/**
 * Represents various security tokens required for performing specific write actions
 * or authenticated operations on the MediaWiki API. These tokens prevent CSRF attacks
 * and ensure requests are legitimate.
 */
export interface MediaWikiQueryTokensDetails {
    /**
     * A token required for creating new user accounts.
     * Used with the `action=createaccount` endpoint.
     */
    createaccounttoken: string;
    /**
     * The Cross-Site Request Forgery (CSRF) token, also known as `edittoken` or `token`.
     * Essential for most write actions (e.g., editing, deleting, moving pages).
     */
    csrftoken: string;
    /**
     * A token specifically for login actions.
     * Used with the `action=login` endpoint.
     */
    logintoken: string;
    /**
     * A token used for patrolling recent changes.
     * Used with the `action=patrol` endpoint.
     */
    patroltoken: string;
    /**
     * A token used for rolling back edits.
     * Used with the `action=rollback` endpoint.
     */
    rollbacktoken: string;
    /**
     * A token required for modifying user rights or group memberships.
     * Used with the `action=userrights` endpoint.
     */
    userrightstoken: string;
    /**
     * A token used for watching or unwatching pages.
     * Used with the `action=watch` endpoint.
     */
    watchtoken: string;
}
/**
 * Represents the detailed response for a successful page edit operation via the MediaWiki API.
 * This structure typically indicates that an edit request has been processed and saved.
 */
export interface MediaWikiQueryEditPageDetails {
    /**
     * The result of the edit operation. For a successful edit.
     */
    result: string;
    /** The unique identifier of the page that was edited. */
    pageid: number;
    /** The canonical title of the page that was edited. */
    title: string;
    /** The content model of the page (e.g., 'wikitext' for standard wiki pages). */
    contentmodel: "wikitext";
    /** The revision ID of the page before the current edit. */
    oldrevid: number;
    /** The revision ID of the new version of the page after the edit. */
    newrevid: number;
    /**
     * The timestamp of the new revision, in ISO 8601 format.
     * This indicates when the edit was officially recorded.
     */
    newtimestamp: string;
    /**
     * Indicates whether the edited page is now on the current user's watchlist.
     * `true` if watched, `false` otherwise.
     */
    watched: boolean;
}
/**
 * Represents the full response structure returned by the MediaWiki API's
 * `action=query&meta=userinfo` endpoint. It extends a base response type
 * and specifically contains detailed information about the current user.
 */
export interface MediaWikiQueryUserInfoResponse extends MediaWikiBaseResponse {
    /**
     * The main query object containing the specific data requested.
     */
    query: {
        /**
         * An object containing comprehensive details about the current user,
         * including their ID, name, groups, rights, preferences, and more.
         */
        userinfo: MediaWikiQueryUserInfoDetails;
    };
}
/**
 * A utility class for handling and accessing user information retrieved from the
 * MediaWiki API's `action=query&meta=userinfo` endpoint.
 * It provides convenient methods to extract key user details.
 */
export declare class MediaWikiQueryUserInfoResponseClass implements MediaWikiQueryUserInfoResponse {
    /**
     * Indicates whether the entire batch of requests completed successfully.
     * For single requests, this is typically `true` upon success.
     */
    batchcomplete: boolean;
    /**
     * The main query object containing the specific data requested,
     * including detailed user information.
     */
    query: {
        /**
         * An object containing comprehensive details about the current user.
         */
        userinfo: MediaWikiQueryUserInfoDetails;
    };
    /**
     * Optional warnings returned by the API during the request processing.
     * This field is present if warnings occurred.
     */
    warnings?: any;
    /**
     * Optional errors returned by the API during the request processing.
     * This field is present if errors occurred.
     */
    errors?: any;
    /**
     * Constructs an instance of `MediaWikiQueryUserInfoResponseClass`.
     * @param data The raw response object from the MediaWiki API's user info query.
     */
    constructor(data: MediaWikiQueryUserInfoResponse);
    /**
     * Checks if the current user is anonymous (not logged in).
     * An anonymous user typically has `anon` flag set to `true` or an `id` of `0`.
     * @returns `true` if the user is anonymous, `false` otherwise.
     */
    isAnonymous(): boolean;
    /**
     * Retrieves the unique numerical ID of the current user.
     * For anonymous users, this will typically be `0`.
     * @returns The user's ID.
     */
    getUserId(): number;
    /**
     * Retrieves the username of the current user.
     * For anonymous users, this might be their IP address.
     * @returns The user's name.
     */
    getUserName(): string;
    /**
     * Retrieves the complete detailed information object for the current user.
     * @returns An object containing all available user details.
     */
    getUserInfo(): MediaWikiQueryUserInfoDetails;
    /**
     * Retrieves the user-specific preferences and settings.
     * These options often relate to UI appearance or editor behavior.
     * @returns An object containing the user's preferences.
     */
    getUserOptions(): MediaWikiQueryUserInfoOptions;
}
/**
 * Represents the options for the MediaWiki API's `action=query&meta=tokens` endpoint.
 * This interface defines the parameters used to specify which types of tokens to retrieve.
 */
export interface MediaWikiQueryTokensOptions {
    /**
     * An array of strings specifying the types of tokens to retrieve.
     * Each string should correspond to a valid token type supported by the API (e.g., 'csrf', 'watch', 'patrol').
     * The API will return all requested tokens if available for the current user.
     */
    type: string[];
}
/**
 * Represents the full response structure returned by the MediaWiki API's
 * `action=query&meta=tokens` endpoint. It extends a base response type
 * and specifically contains an object with various security tokens.
 */
export interface MediaWikiQueryTokensResponse extends MediaWikiBaseResponse {
    /**
     * The main query object containing the specific data requested.
     */
    query: {
        /**
         * An object containing a collection of requested security tokens,
         * such as CSRF, login, patrol, and watch tokens.
         */
        tokens: MediaWikiQueryTokensDetails;
    };
}
/**
 * A utility class for handling and accessing security tokens retrieved from the
 * MediaWiki API's `action=query&meta=tokens` endpoint.
 * It provides direct access to the requested token details.
 */
export declare class MediaWikiQueryTokensResponseClass implements MediaWikiQueryTokensResponse {
    /**
     * Indicates whether the entire batch of requests completed successfully.
     * For single requests, this is typically `true` upon success.
     */
    batchcomplete: boolean;
    /**
     * The main query object containing the specific data requested,
     * including detailed token information.
     */
    query: {
        /**
         * An object containing various security tokens required for authenticated
         * or write operations on the MediaWiki API.
         */
        tokens: MediaWikiQueryTokensDetails;
    };
    /**
     * Optional warnings returned by the API during the request processing.
     * This field is present if warnings occurred.
     */
    warnings?: any;
    /**
     * Optional errors returned by the API during the request processing.
     * This field is present if errors occurred.
     */
    errors?: any;
    /**
     * Constructs an instance of `MediaWikiQueryTokensResponseClass`.
     * @param data The raw response object from the MediaWiki API's tokens query.
     */
    constructor(data: MediaWikiQueryTokensResponse);
    /**
     * Retrieves the Cross-Site Request Forgery (CSRF) token.
     * This token is essential for most write actions (e.g., editing, deleting, moving pages)
     * to prevent unauthorized requests. It is also aliased as `edittoken`.
     * @returns The CSRF token string.
     */
    getCsrfToken(): string;
    /**
     * Retrieves the token required for watching or unwatching pages.
     * Use this token with the `action=watch` endpoint.
     * @returns The watch token string.
     */
    getWatchToken(): string;
    /**
     * Retrieves the token used for patrolling recent changes.
     * This token is necessary for the `action=patrol` endpoint.
     * @returns The patrol token string.
     */
    getPatrolToken(): string;
    /**
     * Retrieves the token used for rolling back edits on a page.
     * Use this token with the `action=rollback` endpoint.
     * @returns The rollback token string.
     */
    getRollbackToken(): string;
    /**
     * Retrieves the token required for modifying user rights or group memberships.
     * This token is used with the `action=userrights` endpoint.
     * @returns The user rights token string.
     */
    getUserRightsToken(): string;
    /**
     * Retrieves the token specifically designed for login actions.
     * This token is used with the `action=login` endpoint.
     * @returns The login token string.
     */
    getLoginToken(): string;
    /**
     * Retrieves the token required for creating new user accounts.
     * This token is used with the `action=createaccount` endpoint.
     * @returns The create account token string.
     */
    getCreateAccountToken(): string;
    /**
     * Retrieves the edit token. This is an alias for the CSRF token,
     * which is required for making edits to pages.
     * @returns The edit token (CSRF token) string.
     */
    getEditToken(): string;
}
/**
 * Represents the options and parameters available for making an edit to a MediaWiki page
 * via the `action=edit` API endpoint. These options control various aspects of the edit,
 * such as content, summary, flags, and conflict resolution.
 */
export interface MediaWikiQueryEditPageOptions {
    /**
     * The title of the page to edit.
     * Use either `title` or `pageid`, but not both.
     */
    title?: string;
    /**
     * The ID of the page to edit.
     * Use either `title` or `pageid`, but not both.
     */
    pageid?: number;
    /**
     * The section number to edit.
     * Use `section` or `sectiontitle`, but not both.
     */
    section?: string;
    /**
     * The title of the section to edit.
     * Use `section` or `sectiontitle`, but not both.
     */
    sectiontitle?: string;
    /**
     * The new content for the page or section.
     * This is the primary content to be saved.
     */
    text: string;
    /**
     * An optional summary for the edit, displayed in the page history.
     */
    summary?: string;
    /**
     * A comma-separated list of tags to apply to the edit.
     * Requires the `applytags` right.
     */
    tags?: string;
    /**
     * Set to `true` to mark the edit as a minor edit.
     * Mutually exclusive with `notminor`.
     */
    minor?: boolean;
    /**
     * Set to `true` to mark the edit as not a minor edit.
     * Mutually exclusive with `minor`. Useful for explicitly overriding user preferences.
     */
    notminor?: boolean;
    /**
     * Set to `true` to mark the edit as a bot edit.
     * Requires the `bot` right.
     */
    bot?: boolean;
    /**
     * The base revision ID. If specified, the edit will only be saved if the
     * current revision ID matches this value, preventing edit conflicts.
     */
    baserevid?: number;
    /**
     * Set to `true` to allow recreation of a deleted page.
     * By default, editing a deleted page results in an error unless `recreate` or `createonly` is set.
     */
    recreate?: boolean;
    /**
     * Set to `true` to create the page only if it does not already exist.
     * If the page exists, an error will be returned. Mutually exclusive with `nocreate`.
     */
    createonly?: boolean;
    /**
     * Set to `true` to prevent the page from being created if it does not already exist.
     * If the page does not exist, an error will be returned. Mutually exclusive with `createonly`.
     */
    nocreate?: boolean;
    /**
     * Content to prepend to the existing page content.
     * Cannot be used with `text`, `section`, or `sectiontitle`.
     */
    prependtext?: string;
    /**
     * Content to append to the existing page content.
     * Cannot be used with `text`, `section`, or `sectiontitle`.
     */
    appendtext?: string;
}
/**
 * Represents the full response structure returned by the MediaWiki API's
 * `action=edit` endpoint. It extends a base response type
 * and specifically contains details about the result of the edit operation.
 */
export interface MediaWikiQueryEditPageResponse extends MediaWikiBaseResponse {
    /**
     * The main query object containing the specific data requested.
     */
    query: {
        /**
         * An object containing detailed information about the outcome of the edit operation,
         * such as the new revision ID, timestamp, and page details.
         */
        edit: MediaWikiQueryEditPageDetails;
    };
}
/**
 * A utility class for handling and accessing the response from a MediaWiki page edit operation.
 * It provides convenient methods to extract key details about the edit result.
 */
export declare class MediaWikiQueryEditPageResponseClass implements MediaWikiQueryEditPageResponse {
    /**
     * Indicates whether the entire batch of requests completed successfully.
     * For single requests, this is typically `true` upon success.
     */
    batchcomplete: boolean;
    /**
     * The main query object containing the specific data requested,
     * including details about the edit.
     */
    query: {
        /**
         * An object containing detailed information about the edit operation.
         */
        edit: MediaWikiQueryEditPageDetails;
    };
    /**
     * Optional warnings returned by the API during the request processing.
     * This field is present if warnings occurred.
     */
    warnings?: any;
    /**
     * Optional errors returned by the API during the request processing.
     * This field is present if errors occurred.
     */
    errors?: any;
    /**
     * Constructs an instance of `MediaWikiQueryEditPageResponseClass`.
     * @param data The raw response object from the MediaWiki API's edit query.
     */
    constructor(data: MediaWikiQueryEditPageResponse | null | undefined);
    /**
     * Retrieves the result status of the edit operation.
     * For a successful edit, this will be "Success".
     * @returns The result string of the edit.
     */
    getResult(): string;
    /**
     * Retrieves the unique identifier of the page that was edited.
     * @returns The page ID.
     */
    getPageId(): number;
    /**
     * Retrieves the canonical title of the page that was edited.
     * @returns The page title.
     */
    getTitle(): string;
    /**
     * Retrieves the content model of the edited page (e.g., 'wikitext').
     * @returns The content model string.
     */
    getContentModel(): string;
    /**
     * Retrieves the revision ID of the page *before* the current edit.
     * @returns The old revision ID.
     */
    getOldRevisionId(): number;
    /**
     * Retrieves the revision ID of the *new* version of the page after the edit.
     * @returns The new revision ID.
     */
    getNewRevisionId(): number;
    /**
     * Retrieves the timestamp of the new revision in ISO 8601 format.
     * This indicates when the edit was officially recorded.
     * @returns The new timestamp string.
     */
    getNewTimestamp(): string;
    /**
     * Checks if the edited page is currently on the user's watchlist.
     * @returns `true` if the page is watched, `false` otherwise.
     */
    isWatched(): boolean;
    /**
     * Checks if the API response contains any warnings.
     * @returns `true` if warnings are present, `false` otherwise.
     */
    hasWarnings(): boolean;
    /**
     * Retrieves any warnings returned by the API.
     * The structure of warnings can vary based on the API response.
     * @returns An object containing warnings, or `undefined` if none.
     */
    getWarnings(): any;
    /**
     * Checks if the API response indicates any errors.
     * Note: This checks for API-level errors within the response payload, not HTTP errors.
     * @returns `true` if errors are present, `false` otherwise.
     */
    hasErrors(): boolean;
    /**
     * Retrieves any errors returned by the API.
     * The structure of errors can vary based on the API response.
     * @returns An object containing errors, or `undefined` if none.
     */
    getErrors(): any;
}
export interface MediaWikiQueryRandomResponse extends MediaWikiBaseResponse {
    /**
     * The main query object containing the specific data requested.
     */
    query: {
        /**
         * An array of random page titles.
         */
        random: MediaWikiListRandomItem[];
    };
}
export interface MediaWikiQueryUploadFileOptions {
    /**
     * The name to assign to the uploaded file (i.e., the destination filename on the wiki).
     * This becomes the title of the File page.
     */
    filename?: string;
    /**
     * Optional text to include in the upload log and file description.
     * Often used as the initial page content.
     */
    comment?: string;
    /**
     * Optional tags to apply to the upload action.
     * These are used for tagging the edit (e.g., 'api', 'upload', etc.).
     */
    tags?: string;
    /**
     * The text to use as the initial content of the file description page.
     * This is often used to provide context or information about the file.
     */
    text?: string;
    /**
     * The action to take regarding the file's watchlist status.
     * Can be 'preferences' (default), 'nochange', 'watch', or 'unwatch'.
     */
    watchlist?: "preferences" | "nochange" | "watch" | "unwatch";
    /**
     * Whether to ignore warnings during upload (e.g., overwriting an existing file).
     * If set to true, the upload proceeds despite any warnings.
     */
    ignorewarnings?: boolean;
    /**
     * The file content to upload.
     * Must be a Buffer (for in-memory files) or a ReadableStream (e.g., from fs.createReadStream).
     * This is required unless using a previously uploaded file via `filekey` or uploading by `url`.
     */
    file?: Buffer | ReadableStream;
    /**
     * A URL to fetch the file from for uploading.
     * Used when uploading from a remote source instead of sending the file directly.
     */
    url?: string;
    /**
     * A file key returned from a previous upload step (used in stash-based uploads).
     * This allows continuing a previously started upload.
     */
    filekey?: string;
    /**
     * Whether the upload should be handled asynchronously.
     * Useful for large files or for background processing.
     */
    async?: boolean;
    /**
     * Whether to mark the upload as a bot edit.
     * Only has an effect if the user is flagged as a bot.
     */
    bot?: boolean;
    /**
     * The MIME type of the uploaded file (e.g., 'image/png', 'application/pdf').
     * Required when using the `file` parameter to upload.
     */
    mimeType?: string;
}
/**
 * Interface representing the response from a MediaWiki API file upload request.
 */
export interface MediaWikiQueryUploadFileResponse extends MediaWikiBaseResponse {
    /**
     * Contains upload result details, only present if the upload succeeded or partially succeeded.
     */
    upload?: {
        warnings: string[];
        /**
         * Upload result status.
         *
         * - `Success`: Upload completed successfully.
         * - `Warning`: Upload completed with a warning (e.g., file already exists).
         * - `Error`: Upload failed (details should be in `error`).
         */
        result: "Success" | "Warning" | "Error";
        /**
         * The name of the uploaded file, which may differ from the original filename
         * if the server renamed it (e.g., due to conflicts).
         */
        filename: string;
        /**
         * Detailed metadata and information about the uploaded image.
         */
        imageinfo: {
            /**
             * ISO 8601 formatted upload timestamp (e.g., "2025-05-25T02:28:36Z").
             */
            timestamp: string;
            /**
             * Username of the user who uploaded the file.
             */
            user: string;
            /**
             * User ID of the uploader.
             */
            userid: number;
            /**
             * Total size of the uploaded file in bytes.
             */
            size: number;
            /**
             * Width of the uploaded image in pixels.
             */
            width: number;
            /**
             * Height of the uploaded image in pixels.
             */
            height: number;
            /**
             * The comment provided by the uploader, after being parsed/cleaned by the server.
             */
            parsedcomment: string;
            /**
             * The raw, unparsed comment provided during upload.
             */
            comment: string;
            /**
             * A block of raw HTML representing a preview of the uploaded file and warnings.
             * May include thumbnails, links, and warnings.
             */
            html: string;
            /**
             * The canonical page title for the uploaded file (e.g., "File:Test.png").
             */
            canonicaltitle: string;
            /**
             * Direct URL to access the uploaded image file.
             */
            url: string;
            /**
             * URL to the MediaWiki file description page for this file.
             */
            descriptionurl: string;
            /**
             * SHA-1 hash of the uploaded file content.
             */
            sha1: string;
            /**
             * Array of low-level metadata extracted from the file.
             * May include EXIF data, resolution info, color type, etc.
             */
            metadata: MediaWikiImageMetadata[];
            /**
             * Common image metadata fields such as resolution and units.
             */
            commonmetadata: MediaWikiSimpleMetadata[];
            /**
             * Extended metadata including structured EXIF-style tags.
             */
            extmetadata: Record<string, {
                /**
                 * Value of the metadata field (can be raw HTML or plain text).
                 */
                value: string;
                /**
                 * Indicates how the value was generated (e.g., "mediawiki-metadata").
                 */
                source: string;
                /**
                 * If set, this field is considered hidden in the UI.
                 */
                hidden?: string;
            }>;
            /**
             * MIME type of the uploaded file (e.g., "image/png").
             */
            mime: string;
            /**
             * General media type (e.g., "BITMAP", "AUDIO", "VIDEO").
             */
            mediatype: string;
            /**
             * Bit depth of the image file (e.g., 8, 16).
             */
            bitdepth: number;
        };
    };
    /**
     * If the upload failed, this object provides details about the error,
     * such as the error code and message.
     */
    error?: MediaWikiErrorCodeResponse;
}
/**
 * A utility class for handling and accessing the response from a MediaWiki file upload operation.
 * Provides convenient methods to extract key details about the upload result.
 */
export declare class MediaWikiQueryUploadFileResponseClass implements MediaWikiQueryUploadFileResponse {
    batchcomplete: boolean;
    upload?: {
        warnings: string[];
        result: "Success" | "Warning" | "Error";
        filename: string;
        imageinfo: {
            timestamp: string;
            user: string;
            userid: number;
            size: number;
            width: number;
            height: number;
            parsedcomment: string;
            comment: string;
            html: string;
            canonicaltitle: string;
            url: string;
            descriptionurl: string;
            sha1: string;
            metadata: MediaWikiImageMetadata[];
            commonmetadata: MediaWikiSimpleMetadata[];
            extmetadata: Record<string, {
                value: string;
                source: string;
                hidden?: string;
            }>;
            mime: string;
            mediatype: string;
            bitdepth: number;
        };
    };
    error?: MediaWikiErrorCodeResponse;
    constructor(data: MediaWikiQueryUploadFileResponse | null | undefined);
    getResult(): string;
    getFilename(): string;
    getCanonicalTitle(): string;
    getFileUrl(): string;
    getDescriptionUrl(): string;
    getSha1(): string;
    getMime(): string;
    getMediaType(): string;
    getError(): MediaWikiErrorCodeResponse | undefined;
}
interface MediaWikiQuerySearchTitlesOptions {
    query: string;
    limit: number;
    namespace?: string | string[] | number | number[];
}
/**
 * Custom error class for MediaWiki API-specific errors.
 * This class extends the standard `Error` and provides additional properties
 * to better convey the nature of API failures, including HTTP status,
 * MediaWiki error codes, and detailed information.
 */
export declare class MediaWikiApiError extends Error {
    /**
     * The HTTP status code of the response that caused the error.
     * E.g., 400, 403, 500.
     */
    status: number;
    /**
     * The specific MediaWiki API error code (e.g., 'badtoken', 'permissiondenied').
     * This is present if the API itself returned a structured error.
     */
    code?: string;
    /**
     * A more detailed human-readable description of the API error,
     * often accompanying the `code`.
     */
    info?: string;
    /**
     * The raw response text from the API, useful for debugging.
     */
    responseText: string;
    /**
     * The parsed JSON response data from the API, if available and applicable.
     * This might contain the `error` object directly.
     */
    responseData?: any;
    /**
     * Constructs a new `MediaWikiApiError` instance.
     * @param message A general error message.
     * @param status The HTTP status code.
     * @param responseText The raw response text from the API.
     * @param responseData Optional: The parsed JSON response data, which might contain `error.code` and `error.info`.
     */
    constructor(message: string, status: number, responseText: string, responseData?: any);
}
interface MediaWikiClient {
    parent: MediaWiki;
    query(options: MediaWikiPageOptions): Promise<MediaWikiQueryResponse>;
    page(titles: string[]): Promise<MediaWikiQueryPageResponseClass>;
    search(srsearch: string, srnamespace?: string[] | null, srlimit?: number | null): Promise<MediaWikiQuerySearchResponse>;
    siteInfo(): Promise<MediaWikiQuerySiteInfoResponse>;
    opensearch(options: MediaWikiQueryOpenSearchOptions): Promise<MediaWikiQueryOpenSearchResponse>;
    parse(options: MediaWikiQueryParseOptions): Promise<MediaWikiQueryParseResponseClass>;
    categories(options: MediaWikiQueryCategoriesOptions): Promise<MediaWikiQueryCategoriesResponse>;
    revisions(options: MediaWikiQueryRevisionsOptions): Promise<MediaWikiQueryRevisionsResponse>;
    summary(options: MediaWikiQuerySummaryOptions): Promise<MediaWikiQuerySummaryResponseClass>;
    userInfo(): Promise<MediaWikiQueryUserInfoResponseClass>;
    getToken(options: MediaWikiQueryTokensOptions): Promise<MediaWikiQueryTokensResponseClass>;
    editPage(options: MediaWikiQueryEditPageOptions): Promise<MediaWikiQueryEditPageResponseClass>;
    random(): Promise<MediaWikiQueryRandomResponse>;
    uploadFile(options: MediaWikiQueryUploadFileOptions): Promise<MediaWikiQueryUploadFileResponseClass>;
    searchTitles(options: MediaWikiQuerySearchTitlesOptions): Promise<string[]>;
}
/**
 * A client for interacting with the MediaWiki API.
 * Provides methods for common API actions.
 */
export declare class MediaWiki {
    private baseURL;
    private params;
    private cookieStore;
    private authorized;
    private siteInfo;
    client: MediaWikiClient;
    private parent;
    /**
     * Creates an instance of the MediaWiki client.
     * @param options - The configuration options for the client.
     * @throws {Error} If baseURL is not provided in options.
     *
     * @example
     * const client = new MediaWiki({ baseURL: "https://en.wikipedia.org/w/api.php" });
     */
    constructor(options: MediaWikiOptions);
    /**
     * Fetches data from the MediaWiki API endpoint.
     * This is a private helper method.
     * @param options - Options for the fetch request, including method, URL, params, etc.
     * @returns A promise that resolves with the response data from the API.
     * @throws {Error} If the fetch operation fails.
     */
    private fetchData;
    private filterParams;
    private assertSiteInfo;
    private formURLEncoder;
    /**
     * Logs in a user to the MediaWiki API using the provided username and password.
     * It is recommended to use BotPasswords for authentication to ensure security and avoid issues with 2FA-enabled accounts.
     *
     * @param username - The username of the MediaWiki account.
     * @param password - The password or BotPassword for the MediaWiki account.
     * @returns A promise resolving to the logged-in user's details, including user ID and username.
     * @throws {Error} If the login token cannot be retrieved or the login fails.
     *
     * @example
     * // Using BotPasswords for authentication
     * const mediaWiki = new MediaWiki({ baseURL: "https://en.wikipedia.org/w/api.php" });
     * mediaWiki.login("MyBotUsername@MyBot", "my_bot_password")
     *     .then(user => {
     *         console.log(`Logged in as ${user.userName} (ID: ${user.userId})`);
     *     })
     *     .catch(error => {
     *         console.error("Login failed:", error);
     *     });
     */
    login(username: string, password: string): Promise<MediaWikiUser>;
    /**
     * Logs out the current user from the MediaWiki API.
     * Requires that the client is currently authorized (logged in).
     *
     * @returns A promise resolving to true if logout was successful.
     * @throws {Error} If not authorized or if the logout operation fails.
     *
     * @example
     * await mediaWiki.logout();
     */
    logout(): Promise<boolean | Error>;
    /**
     * Returns whether the client is currently authorized (logged in).
     *
     * @returns True if authorized, false otherwise.
     *
     * @example
     * if (mediaWiki.isAuthorized()) {
     *     console.log("User is logged in.");
     * }
     */
    isAuthorized(): boolean;
    /**
     * Checks if the current user is logged in by querying user info.
     *
     * @returns A promise resolving to true if logged in, false if anonymous.
     *
     * @example
     * mediaWiki.isLoggedIn()
     *     .then(loggedIn => console.log(loggedIn ? "Logged in" : "Anonymous user"));
     */
    isLoggedIn(): Promise<boolean>;
    /**
     * Gets the base URL of the MediaWiki API endpoint.
     *
     * @returns The API base URL string.
     */
    getBaseURL(): string;
    /**
     * Returns a copy of the default request parameters used for API calls.
     *
     * @returns The default parameters object.
     */
    getParams(): Record<string, any>;
    /**
     * Retrieves the cookies stored for the MediaWiki API endpoint.
     *
     * @returns An array of cookies currently stored.
     */
    getCookies(): Cookie[];
    /**
     * Returns debug information about the client state.
     *
     * @returns An object containing baseURL, params, authorization state, and cookies.
     */
    getDebugInfo(): object;
    /**
     * Gets the site name from the loaded site info.
     * Throws if site info is not loaded.
     *
     * @returns The site name string or null if unavailable.
     */
    getSiteName(): string | null;
    /**
     * Gets the list of namespaces from the loaded site info.
     * Throws if site info is not loaded.
     *
     * @returns An object mapping namespace IDs to namespace data, or null.
     */
    getNamespaceList(): Record<string, any> | null;
    /**
     * Returns an array of namespaces with their IDs and names.
     * Throws if site info is not loaded.
     *
     * @returns Array of objects with `id` and `name` for each namespace.
     */
    getNamespaceArray(): {
        id: number;
        name: string;
    }[];
}
export {};
