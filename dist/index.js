"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaWiki = exports.MediaWikiApiError = exports.MediaWikiQueryEditPageResponseClass = exports.MediaWikiQueryTokensResponseClass = exports.MediaWikiQueryUserInfoResponseClass = exports.MediaWikiQuerySummaryResponseClass = exports.MediaWikiQueryParseResponseClass = exports.MediaWikiQueryPageResponseClass = void 0;
const cookie_store_js_1 = require("./cookie-store.js");
class MediaWikiQueryPageResponseClass {
    batchcomplete;
    query;
    wiki;
    pageDetails;
    constructor(data, wikiInstance) {
        this.batchcomplete = data.batchcomplete;
        this.query = data.query;
        this.wiki = wikiInstance;
        if (data.query?.pages) {
            const pageIds = Object.keys(data.query.pages);
            if (pageIds.length > 0) {
                this.pageDetails = data.query.pages[pageIds[0]];
            }
        }
    }
    /**
     * Returns the HTML content of the page.
     * @example "<p>Hello <strong>world</strong>!</p>"
     */
    html() {
        return this.query?.pages[0]?.extract ?? "";
    }
    /**
     * Returns the title of the page.
     * @example "Main Page"
     */
    title() {
        return this.query?.pages[0]?.title ?? "";
    }
    /**
     * Returns the page ID of the parsed page.
     * @example 123456
     */
    categories() {
        return this.query?.pages[0]?.categories?.map((c) => c["*"]) ?? [];
    }
    /**
     * Edits this page.
     * @param options - Options for editing, like new text and summary.
     * @returns A promise resolving to the edit page response.
    */
    async edit(options) {
        if (!this.pageDetails) {
            throw new Error("Page details not available for editing.");
        }
        if (!this.pageDetails.title && !this.pageDetails.pageid) {
            throw new Error("Page title or ID is required for editing.");
        }
        const editPayload = {
            ...options,
        };
        if (this.pageDetails.pageid) {
            editPayload.pageid = this.pageDetails.pageid;
        }
        else {
            editPayload.title = this.pageDetails.title;
        }
        if (typeof options.text !== 'string') {
            throw new Error("Parameter 'text' is required for editing.");
        }
        return this.wiki.client.editPage(editPayload);
    }
}
exports.MediaWikiQueryPageResponseClass = MediaWikiQueryPageResponseClass;
/**
 * A helper class to wrap the parse response and provide convenience methods.
 */
class MediaWikiQueryParseResponseClass {
    warnings;
    parse;
    constructor(data) {
        Object.assign(this, data);
        this.parse = data.parse;
        this.warnings = data.warnings;
    }
    /**
     * Returns the parsed text content of the page.
     * @example "Hello '''world'''!"
     */
    text() {
        return this.parse?.text ?? "";
    }
    /**
     * Returns the parsed HTML content of the page.
     * @example "<p>Hello <strong>world</strong>!</p>"
     */
    html() {
        return this.parse?.text ?? "";
    }
    /**
     * Returns the title of the page.
     * @example "Main Page"
     */
    title() {
        return this.parse?.title ?? "";
    }
    /**
     * Returns the page ID of the parsed page.
     * @example 123456
     */
    categories() {
        return this.parse?.categories?.map((c) => c["*"]) ?? [];
    }
}
exports.MediaWikiQueryParseResponseClass = MediaWikiQueryParseResponseClass;
/**
 * A helper class to wrap the summary response and provide convenience methods.
 */
class MediaWikiQuerySummaryResponseClass {
    batchcomplete;
    query;
    constructor(data) {
        Object.assign(this, data);
        this.query = data.query;
        this.batchcomplete = data.batchcomplete;
    }
    /**
     * Returns the text content of the page.
     * @example "JavaScript is a programming language..."
     */
    text() {
        return this.query?.pages[0].extract ?? "";
    }
}
exports.MediaWikiQuerySummaryResponseClass = MediaWikiQuerySummaryResponseClass;
/**
 * A utility class for handling and accessing user information retrieved from the
 * MediaWiki API's `action=query&meta=userinfo` endpoint.
 * It provides convenient methods to extract key user details.
 */
class MediaWikiQueryUserInfoResponseClass {
    /**
     * Indicates whether the entire batch of requests completed successfully.
     * For single requests, this is typically `true` upon success.
     */
    batchcomplete;
    /**
     * The main query object containing the specific data requested,
     * including detailed user information.
     */
    query;
    /**
     * Optional warnings returned by the API during the request processing.
     * This field is present if warnings occurred.
     */
    warnings;
    /**
     * Optional errors returned by the API during the request processing.
     * This field is present if errors occurred.
     */
    errors;
    /**
     * Constructs an instance of `MediaWikiQueryUserInfoResponseClass`.
     * @param data The raw response object from the MediaWiki API's user info query.
     */
    constructor(data) {
        this.batchcomplete = data.batchcomplete;
        this.query = data.query;
        if (data.warnings)
            this.warnings = data.warnings;
        if (data.errors)
            this.errors = data.errors;
    }
    /**
     * Checks if the current user is anonymous (not logged in).
     * An anonymous user typically has `anon` flag set to `true` or an `id` of `0`.
     * @returns `true` if the user is anonymous, `false` otherwise.
     */
    isAnonymous() {
        if (this.query.userinfo.anon === true) {
            return true;
        }
        if (this.query.userinfo.id === 0) {
            return true;
        }
        return false;
    }
    /**
     * Retrieves the unique numerical ID of the current user.
     * For anonymous users, this will typically be `0`.
     * @returns The user's ID.
     */
    getUserId() {
        return this.query.userinfo.id;
    }
    /**
     * Retrieves the username of the current user.
     * For anonymous users, this might be their IP address.
     * @returns The user's name.
     */
    getUserName() {
        return this.query.userinfo.name;
    }
    /**
     * Retrieves the complete detailed information object for the current user.
     * @returns An object containing all available user details.
     */
    getUserInfo() {
        return this.query.userinfo;
    }
    /**
     * Retrieves the user-specific preferences and settings.
     * These options often relate to UI appearance or editor behavior.
     * @returns An object containing the user's preferences.
     */
    getUserOptions() {
        return this.query.userinfo.options;
    }
}
exports.MediaWikiQueryUserInfoResponseClass = MediaWikiQueryUserInfoResponseClass;
/**
 * A utility class for handling and accessing security tokens retrieved from the
 * MediaWiki API's `action=query&meta=tokens` endpoint.
 * It provides direct access to the requested token details.
 */
class MediaWikiQueryTokensResponseClass {
    /**
     * Indicates whether the entire batch of requests completed successfully.
     * For single requests, this is typically `true` upon success.
     */
    batchcomplete;
    /**
     * The main query object containing the specific data requested,
     * including detailed token information.
     */
    query;
    /**
     * Optional warnings returned by the API during the request processing.
     * This field is present if warnings occurred.
     */
    warnings;
    /**
     * Optional errors returned by the API during the request processing.
     * This field is present if errors occurred.
     */
    errors;
    /**
     * Constructs an instance of `MediaWikiQueryTokensResponseClass`.
     * @param data The raw response object from the MediaWiki API's tokens query.
     */
    constructor(data) {
        this.batchcomplete = data.batchcomplete;
        this.query = data.query;
        if (data.warnings)
            this.warnings = data.warnings;
        if (data.errors)
            this.errors = data.errors;
    }
    /**
     * Retrieves the Cross-Site Request Forgery (CSRF) token.
     * This token is essential for most write actions (e.g., editing, deleting, moving pages)
     * to prevent unauthorized requests. It is also aliased as `edittoken`.
     * @returns The CSRF token string.
     */
    getCsrfToken() {
        return this.query.tokens.csrftoken;
    }
    /**
     * Retrieves the token required for watching or unwatching pages.
     * Use this token with the `action=watch` endpoint.
     * @returns The watch token string.
     */
    getWatchToken() {
        return this.query.tokens.watchtoken;
    }
    /**
     * Retrieves the token used for patrolling recent changes.
     * This token is necessary for the `action=patrol` endpoint.
     * @returns The patrol token string.
     */
    getPatrolToken() {
        return this.query.tokens.patroltoken;
    }
    /**
     * Retrieves the token used for rolling back edits on a page.
     * Use this token with the `action=rollback` endpoint.
     * @returns The rollback token string.
     */
    getRollbackToken() {
        return this.query.tokens.rollbacktoken;
    }
    /**
     * Retrieves the token required for modifying user rights or group memberships.
     * This token is used with the `action=userrights` endpoint.
     * @returns The user rights token string.
     */
    getUserRightsToken() {
        return this.query.tokens.userrightstoken;
    }
    /**
     * Retrieves the token specifically designed for login actions.
     * This token is used with the `action=login` endpoint.
     * @returns The login token string.
     */
    getLoginToken() {
        return this.query.tokens.logintoken;
    }
    /**
     * Retrieves the token required for creating new user accounts.
     * This token is used with the `action=createaccount` endpoint.
     * @returns The create account token string.
     */
    getCreateAccountToken() {
        return this.query.tokens.createaccounttoken;
    }
    /**
     * Retrieves the edit token. This is an alias for the CSRF token,
     * which is required for making edits to pages.
     * @returns The edit token (CSRF token) string.
     */
    getEditToken() {
        return this.query.tokens.csrftoken;
    }
}
exports.MediaWikiQueryTokensResponseClass = MediaWikiQueryTokensResponseClass;
/**
 * A utility class for handling and accessing the response from a MediaWiki page edit operation.
 * It provides convenient methods to extract key details about the edit result.
 */
class MediaWikiQueryEditPageResponseClass {
    /**
     * Indicates whether the entire batch of requests completed successfully.
     * For single requests, this is typically `true` upon success.
     */
    batchcomplete;
    /**
     * The main query object containing the specific data requested,
     * including details about the edit.
     */
    query;
    /**
     * Optional warnings returned by the API during the request processing.
     * This field is present if warnings occurred.
     */
    warnings;
    /**
     * Optional errors returned by the API during the request processing.
     * This field is present if errors occurred.
     */
    errors;
    /**
     * Constructs an instance of `MediaWikiQueryEditPageResponseClass`.
     * @param data The raw response object from the MediaWiki API's edit query.
     */
    constructor(data) {
        this.batchcomplete = data.batchcomplete;
        this.query = data.query;
        if (data.warnings)
            this.warnings = data.warnings;
        if (data.errors)
            this.errors = data.errors;
    }
    /**
     * Retrieves the result status of the edit operation.
     * For a successful edit, this will be "Success".
     * @returns The result string of the edit.
     */
    getResult() {
        return this.query.edit.result;
    }
    /**
     * Retrieves the unique identifier of the page that was edited.
     * @returns The page ID.
     */
    getPageId() {
        return this.query.edit.pageid;
    }
    /**
     * Retrieves the canonical title of the page that was edited.
     * @returns The page title.
     */
    getTitle() {
        return this.query.edit.title;
    }
    /**
     * Retrieves the content model of the edited page (e.g., 'wikitext').
     * @returns The content model string.
     */
    getContentModel() {
        return this.query.edit.contentmodel;
    }
    /**
     * Retrieves the revision ID of the page *before* the current edit.
     * @returns The old revision ID.
     */
    getOldRevisionId() {
        return this.query.edit.oldrevid;
    }
    /**
     * Retrieves the revision ID of the *new* version of the page after the edit.
     * @returns The new revision ID.
     */
    getNewRevisionId() {
        return this.query.edit.newrevid;
    }
    /**
     * Retrieves the timestamp of the new revision in ISO 8601 format.
     * This indicates when the edit was officially recorded.
     * @returns The new timestamp string.
     */
    getNewTimestamp() {
        return this.query.edit.newtimestamp;
    }
    /**
     * Checks if the edited page is currently on the user's watchlist.
     * @returns `true` if the page is watched, `false` otherwise.
     */
    isWatched() {
        return this.query.edit.watched;
    }
    /**
     * Checks if the API response contains any warnings.
     * @returns `true` if warnings are present, `false` otherwise.
     */
    hasWarnings() {
        return this.warnings !== undefined;
    }
    /**
     * Retrieves any warnings returned by the API.
     * The structure of warnings can vary based on the API response.
     * @returns An object containing warnings, or `undefined` if none.
     */
    getWarnings() {
        return this.warnings;
    }
    /**
     * Checks if the API response indicates any errors.
     * Note: This checks for API-level errors within the response payload, not HTTP errors.
     * @returns `true` if errors are present, `false` otherwise.
     */
    hasErrors() {
        return this.errors !== undefined;
    }
    /**
     * Retrieves any errors returned by the API.
     * The structure of errors can vary based on the API response.
     * @returns An object containing errors, or `undefined` if none.
     */
    getErrors() {
        return this.errors;
    }
}
exports.MediaWikiQueryEditPageResponseClass = MediaWikiQueryEditPageResponseClass;
/**
 * Custom error class for MediaWiki API-specific errors.
 * This class extends the standard `Error` and provides additional properties
 * to better convey the nature of API failures, including HTTP status,
 * MediaWiki error codes, and detailed information.
 */
class MediaWikiApiError extends Error {
    /**
     * The HTTP status code of the response that caused the error.
     * E.g., 400, 403, 500.
     */
    status;
    /**
     * The specific MediaWiki API error code (e.g., 'badtoken', 'permissiondenied').
     * This is present if the API itself returned a structured error.
     */
    code;
    /**
     * A more detailed human-readable description of the API error,
     * often accompanying the `code`.
     */
    info;
    /**
     * The raw response text from the API, useful for debugging.
     */
    responseText;
    /**
     * The parsed JSON response data from the API, if available and applicable.
     * This might contain the `error` object directly.
     */
    responseData;
    /**
     * Constructs a new `MediaWikiApiError` instance.
     * @param message A general error message.
     * @param status The HTTP status code.
     * @param responseText The raw response text from the API.
     * @param responseData Optional: The parsed JSON response data, which might contain `error.code` and `error.info`.
     */
    constructor(message, status, responseText, responseData) {
        super(message);
        this.name = "MediaWikiApiError";
        this.status = status;
        this.responseText = responseText;
        this.responseData = responseData;
        if (responseData && responseData.error) {
            this.code = responseData.error.code;
            this.info = responseData.error.info;
            // Refine the error message if more specific API error details are available
            if (this.info && message.startsWith("Request failed")) {
                this.message = `Request failed with status ${status}: ${this.info} (Code: ${this.code || "N/A"})`;
            }
            else if (this.code && message.startsWith("Request failed")) {
                this.message = `Request failed with status ${status} (Code: ${this.code})`;
            }
        }
    }
}
exports.MediaWikiApiError = MediaWikiApiError;
/**
 * A client for interacting with the MediaWiki API.
 * Provides methods for common API actions.
 */
class MediaWiki {
    baseURL;
    params;
    cookieStore;
    authorized;
    siteInfo;
    /**
     * Creates an instance of the MediaWiki client.
     * @param options - The configuration options for the client.
     * @throws {Error} If baseURL is not provided in options.
     *
     * @example
     * const client = new MediaWiki({ baseURL: "https://en.wikipedia.org/w/api.php" });
     */
    constructor(options) {
        if (!options.baseURL) {
            throw new Error("baseURL is required");
        }
        this.cookieStore = new cookie_store_js_1.CookieStore();
        this.baseURL = options.baseURL.endsWith("/api.php") ? options.baseURL : `${options.baseURL}/api.php`;
        this.params = {
            servedby: options.servedby,
            curtimestamp: options.curtimestamp,
            responselanginfo: options.responselanginfo,
            requestid: options.requestid,
            format: options.format ?? "json",
            formatversion: options.formatversion ?? 2,
            ascii: options.ascii,
            utf8: options.utf8
        };
        this.authorized = false;
        this.siteInfo = null;
        if (options.format && options.format !== "json") {
            throw new Error(`Expected "json" format but got "${options.format}". The library only speaks JSON...`);
        }
    }
    /**
     * Fetches data from the MediaWiki API endpoint.
     * This is a private helper method.
     * @param options - Options for the fetch request, including method, URL, params, etc.
     * @returns A promise that resolves with the response data from the API.
     * @throws {Error} If the fetch operation fails.
     */
    async fetchData(options) {
        try {
            const params = {};
            for (const key in options.params) {
                if (options.params[key] !== undefined && options.params[key] !== null) {
                    params[key] = options.params[key];
                }
            }
            for (const key in this.params) {
                if (params[key] === undefined && this.params[key] !== undefined && this.params[key] !== null) {
                    params[key] = this.params[key];
                }
            }
            const urlObj = new URL(options.url);
            Object.entries(params).forEach(([key, value]) => {
                urlObj.searchParams.append(key, value);
            });
            const cookieObjects = this.cookieStore.getCookieHeader(this.baseURL);
            const headers = {
                ...options.headers,
            };
            if (cookieObjects && cookieObjects.length > 0) {
                const cookieString = cookieObjects.map(cookie => `${cookie.name}=${cookie.value}`).join("; ");
                headers["Cookie"] = cookieString;
            }
            const res = await fetch(urlObj.toString(), {
                method: options.method,
                headers,
                body: options.method !== "GET" && options.data
                    ? typeof options.data === "string"
                        ? options.data
                        : JSON.stringify(options.data)
                    : undefined,
            });
            const setCookie = res.headers.getSetCookie?.() || res.headers.get?.("set-cookie");
            if (setCookie) {
                const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
                for (const header of cookies) {
                    this.cookieStore.parseSetCookie(header, new URL(this.baseURL).hostname);
                }
            }
            if (!res.ok) {
                const text = await res.text();
                let responseData;
                try {
                    responseData = JSON.parse(text);
                }
                catch {
                    // ignore if text is not json lol
                }
                let errorMessage = `Request failed with status ${res.status}`;
                throw new MediaWikiApiError(errorMessage, res.status, text, responseData);
            }
            return await res.json();
        }
        catch (error) {
            throw error;
        }
    }
    filterParams(params) {
        const filteredParams = {};
        for (const key in params) {
            if (params[key] !== undefined && params[key] !== null) {
                filteredParams[key] = params[key];
            }
        }
        return filteredParams;
    }
    assertSiteInfo() {
        if (!this.siteInfo) {
            throw new Error("siteInfo not loaded. Call siteInfo() first.");
        }
    }
    formURLEncoder(data) {
        const urlParams = new URLSearchParams();
        for (const key in data) {
            if (data[key] !== undefined && data[key] !== null) {
                urlParams.append(key, data[key]);
            }
        }
        return urlParams.toString();
    }
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
    async login(username, password) {
        const initialTokenResponse = await this.fetchData({
            method: "GET",
            url: this.baseURL,
            params: {
                action: "query",
                meta: "tokens",
                type: "login",
            }
        });
        const initialLoginToken = initialTokenResponse?.query?.tokens?.logintoken;
        if (!initialLoginToken) {
            throw new Error("Failed to retrieve initial login token");
        }
        let loginResponse = await this.fetchData({
            method: "POST",
            url: this.baseURL,
            data: this.formURLEncoder({
                action: "login",
                lgname: username,
                lgpassword: password,
                lgtoken: initialLoginToken,
                format: this.params.format,
            }),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });
        if (loginResponse.login.result === "NeedToken") {
            const challengeToken = loginResponse.login.token;
            if (!challengeToken) {
                throw new Error(`Login responded with "NeedToken" but did not provide the required challenge token in response.login.token.`);
            }
            loginResponse = await this.fetchData({
                method: "POST",
                url: this.baseURL,
                data: this.formURLEncoder({
                    action: "login",
                    lgname: username,
                    lgpassword: password,
                    lgtoken: challengeToken,
                    format: this.params.format,
                }),
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            });
        }
        const result = loginResponse?.login?.result;
        const loginDetails = loginResponse?.login;
        if (result !== "Success" || !loginDetails) {
            const reason = loginResponse?.login?.reason || "Unknown reason";
            throw new Error(`Login failed. Result: ${result}, Reason: ${reason}. Full response: ${JSON.stringify(loginResponse)}`);
        }
        const loggedInUser = {
            userId: loginDetails.lguserid,
            userName: loginDetails.lgusername
        };
        this.authorized = true;
        return loggedInUser;
    }
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
    async logout() {
        if (!this.authorized)
            throw new Error("You are not authorized.");
        const tokenResponse = await this.client.getToken({
            type: ["csrf"]
        });
        const logoutToken = tokenResponse?.query.tokens?.csrftoken;
        if (!logoutToken) {
            throw new Error("Failed to retrieve login token");
        }
        const logoutResponse = await this.fetchData({
            method: "POST",
            url: this.baseURL,
            data: this.formURLEncoder({
                action: "logout",
                token: logoutToken
            }),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });
        const error = logoutResponse.error;
        if (error) {
            throw new Error(`Response: ${JSON.stringify(logoutResponse)}`);
        }
        this.authorized = false;
        return true;
    }
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
    isAuthorized() {
        return this.authorized;
    }
    /**
     * Checks if the current user is logged in by querying user info.
     *
     * @returns A promise resolving to true if logged in, false if anonymous.
     *
     * @example
     * mediaWiki.isLoggedIn()
     *     .then(loggedIn => console.log(loggedIn ? "Logged in" : "Anonymous user"));
     */
    async isLoggedIn() {
        const userInfo = await this.client.userInfo();
        return userInfo.query.userinfo.anon ? userInfo.query.userinfo.anon : false;
    }
    /**
     * Gets the base URL of the MediaWiki API endpoint.
     *
     * @returns The API base URL string.
     */
    getBaseURL() {
        return this.baseURL;
    }
    /**
     * Returns a copy of the default request parameters used for API calls.
     *
     * @returns The default parameters object.
     */
    getParams() {
        return { ...this.params };
    }
    /**
     * Retrieves the cookies stored for the MediaWiki API endpoint.
     *
     * @returns An array of cookies currently stored.
     */
    getCookies() {
        return this.cookieStore.getCookieHeader(this.baseURL);
    }
    /**
     * Returns debug information about the client state.
     *
     * @returns An object containing baseURL, params, authorization state, and cookies.
     */
    getDebugInfo() {
        return {
            baseURL: this.baseURL,
            params: this.params,
            authorized: this.authorized,
            cookies: this.getCookies()
        };
    }
    /**
     * Gets the site name from the loaded site info.
     * Throws if site info is not loaded.
     *
     * @returns The site name string or null if unavailable.
     */
    getSiteName() {
        this.assertSiteInfo();
        return this.siteInfo?.general?.sitename ?? null;
    }
    /**
     * Gets the list of namespaces from the loaded site info.
     * Throws if site info is not loaded.
     *
     * @returns An object mapping namespace IDs to namespace data, or null.
     */
    getNamespaceList() {
        this.assertSiteInfo();
        return this.siteInfo?.namespaces ?? null;
    }
    /**
     * Returns an array of namespaces with their IDs and names.
     * Throws if site info is not loaded.
     *
     * @returns Array of objects with `id` and `name` for each namespace.
     */
    getNamespaceArray() {
        this.assertSiteInfo();
        if (!this.siteInfo?.namespaces)
            return [];
        return Object.entries(this.siteInfo.namespaces).map(([id, ns]) => ({
            id: parseInt(id, 10),
            name: ns["*"]
        }));
    }
    /**
     * API client methods.
     */
    client = {
        /**
         * Executes a full MediaWiki API query with various combinations of prop, meta, and list options.
         *
         * @param options - The detailed query options.
         * @returns A promise resolving to the full MediaWiki API response.
         * @throws {Error} If required options are missing or incompatible.
         *
         * @example
         * mediaWiki.client.query({
         *   titles: ["Main Page"],
         *   prop: ["extracts", "categories"],
         *   indexpageids: true
         * }).then(response => {
         *   console.log(response);
         * });
         */
        query: async (options) => {
            if (!options) {
                throw new Error("Options are required for the query method.");
            }
            if (options.title && options.titles) {
                throw new Error(`Use either "title" or "titles", not both.`);
            }
            if (options.titles && options.pageids) {
                throw new Error(`Cannot use both "titles" and "pageids". Use only one identifier method.`);
            }
            if (options.titles && (!options.prop && !options.meta && options.list)) {
                throw new Error(`"titles" provided but no "prop", "meta", or "list" specified. Nothing to retrieve.`);
            }
            if (!options.titles && options.export) {
                throw new Error(`"export" requires "titles" to be set.`);
            }
            if (options.indexpageids && (!options.titles && !options.pageids)) {
                throw new Error(`"indexpageids" only works with "titles" or "pageids".`);
            }
            if (options.redirects && (!options.titles && !options.title && !options.pageids)) {
                throw new Error(`"redirects" has no effect without "titles", "pageids", or "title".`);
            }
            if (options.prop && (!options.titles && !options.pageids)) {
                throw new Error(`"prop" requires either "titles", "pageids".`);
            }
            const queryParams = {
                action: "query",
                prop: options.prop?.join("|"),
                list: options.list?.join("|"),
                meta: options.meta?.join("|"),
                indexpageids: options.indexpageids,
                export: options.export,
                titles: options.titles?.join("|"),
                pageids: options.pageids?.join("|"),
                srsearch: options.srsearch,
                srnamespace: options.srnamespace?.join("|"),
                srlimit: options.srlimit,
                srprop: options.srprop?.join("|"),
                srwhat: options.srwhat,
                srinfo: options.srinfo,
                rvlimit: options.rvlimit,
                exintro: options.exintro,
                explaintext: options.explaintext,
                uiprop: options.uiprop
            };
            const filteredParams = this.filterParams(queryParams);
            return this.fetchData({
                method: "GET",
                params: filteredParams,
                url: this.baseURL
            });
        },
        /**
         * Retrieves basic content and metadata for one or more pages by title.
         * Uses 'query' with predefined props such as 'extracts', 'categories', 'revisions'.
         *
         * @param titles - List of page titles to retrieve.
         * @returns A promise resolving to the page response data.
         * @throws {Error} If titles is missing or empty.
         *
         * @example
         * mediaWiki.client.page(["Main Page"])
         *   .then(pageData => console.log(pageData));
         */
        page: async (titles) => {
            if (!titles || titles.length === 0) {
                throw new Error("Missing or empty 'titles' - must be a non-empty.");
            }
            const query = {
                prop: ["info", "extracts", "categories", "revisions"],
                titles: titles,
                indexpageids: true
            };
            const res = await this.client.query(query);
            if (!res || !res.query) {
                return new MediaWikiQueryPageResponseClass(res, this);
            }
            return new MediaWikiQueryPageResponseClass(res, this);
        },
        /**
         * Searches the wiki using the 'search' list API.
         * @param srsearch - The search query string; must be non-empty.
         * @param srnamespace - Optional array of namespaces to limit the search.
         * @param srlimit - Optional number to limit the number of results (default 10).
         * @returns Promise resolving to the search results response.
         */
        search: async (srsearch, srnamespace, srlimit) => {
            if (!srsearch || srsearch.trim() === "") {
                throw new Error(`Missing "srsearch" - must be a non-empty string.`);
            }
            const query = {
                list: ["search"],
                srsearch,
                srnamespace: srnamespace ?? [],
                srlimit: srlimit ?? 10
            };
            const res = await this.client.query(query);
            if (!res || !res.query) {
                return res;
            }
            return res;
        },
        /**
         * Fetches general site metadata via 'meta=siteinfo'.
         * Includes site name, generator, case sensitivity, and namespaces.
         * @returns Promise resolving to site info data.
         * @example
         * async function getSiteDetails() {
         *   const client = new MediaWiki({ baseURL: "https://en.wikipedia.org/w/api.php" });
         *   try {
         *     const siteInfo = await client.client.siteInfo();
         *     console.log(siteInfo.query.general.sitename);
         *   } catch (error) {
         *     console.error("Failed to get site info:", error);
         *   }
         * }
         * getSiteDetails();
         * @see https://www.mediawiki.org/wiki/API:Siteinfo
         */
        siteInfo: async () => {
            const query = {
                meta: ["siteinfo"]
            };
            const res = await this.client.query(query);
            this.siteInfo = res?.query ?? null;
            if (!this.siteInfo || !this.siteInfo.general) {
                return res;
            }
            return res;
        },
        /**
        * Performs a legacy 'opensearch' API call for autocomplete-like suggestions.
        * @param options - Object containing 'search' string and optional 'limit', 'namespace', 'suggest'.
        * @returns Promise resolving to OpenSearch formatted results.
        * @throws If options or search term is missing.
        */
        opensearch: async (options) => {
            if (!options) {
                throw new Error("Options are required for the opensearch method.");
            }
            if (!options.search) {
                throw new Error("A search is required for the opensearch method.");
            }
            const query = {
                action: "opensearch",
                ...options
            };
            const filteredParams = this.filterParams(query);
            const res = await this.fetchData({
                method: "GET",
                url: this.baseURL,
                params: filteredParams
            });
            if (!res || !res.query) {
                return res;
            }
            return res;
        },
        /**
         * Parses a page or text content using the 'parse' API action.
         * Can return rendered HTML, sections, categories, etc.
         * @param options - Must include at least one of 'page', 'pageid', or 'text'.
         * @returns Promise resolving to the parsed content response class instance.
         * @throws If required parameters are missing.
         */
        parse: async (options) => {
            if (!options) {
                throw new Error(`Options are required for the parse method.`);
            }
            if (!options.page && !options.pageid && !options.text) {
                throw new Error(`You must provide either "page", "pageid" or "text" for the parse method.`);
            }
            const query = {
                action: "parse",
                ...options
            };
            const filteredParams = this.filterParams(query);
            const res = await this.fetchData({
                method: "GET",
                url: this.baseURL,
                params: filteredParams
            });
            if (!res || !res.parse) {
                return new MediaWikiQueryParseResponseClass(res);
            }
            return new MediaWikiQueryParseResponseClass(res);
        },
        /**
         * Retrieves categories of a wiki page by its title.
         * @param options - Must include a non-empty 'title' string.
         * @returns Promise resolving to categories response.
         * @throws If 'title' is missing or invalid.
         */
        categories: async (options) => {
            if (!options || !options.title) {
                throw new Error(`Missing or invalid "title" - must be a non-empty string.`);
            }
            const query = {
                titles: [options.title],
                prop: ["categories"]
            };
            const res = await this.client.query(query);
            if (!res || !res.query || !res.query.normalized || !res.query.pages || typeof res.query.pages !== "object") {
                return res;
            }
            const pagesArr = Object.values(res.query.pages ?? {});
            return {
                continue: res.continue,
                query: {
                    normalized: res.query.normalized ?? [],
                    pages: pagesArr
                }
            };
        },
        /**
         * Retrieves revision history of a page by its title.
         * @param options - Must include a non-empty 'title' string; optionally 'rvlimit'.
         * @returns Promise resolving to revisions response.
         * @throws If 'title' is missing or invalid.
         */
        revisions: async (options) => {
            if (!options || !options.title) {
                throw new Error(`Missing or invalid "title" - must be a non-empty string.`);
            }
            const query = {
                titles: [options.title],
                prop: ["revisions"],
                rvlimit: options.rvlimit
            };
            const res = await this.client.query(query);
            if (!res || !res.query || !res.query.normalized || !res.query.pages || typeof res.query.pages !== "object") {
                return res;
            }
            const pagesArr = Object.values(res.query.pages);
            return {
                batchcomplete: res.batchcomplete,
                query: {
                    normalized: res.query.normalized,
                    pages: pagesArr
                }
            };
        },
        /**
         * Retrieves a summary extract (intro paragraph) of a page.
         * @param options - Must include a non-empty 'title' string.
         * @returns Promise resolving to a summary response class instance.
         * @throws If 'title' is missing or invalid.
         */
        summary: async (options) => {
            if (!options || !options.title) {
                throw new Error(`Missing or invalid "title" - must be a non-empty string.`);
            }
            const query = {
                titles: [options.title],
                prop: ["extracts"],
                exintro: true,
                explaintext: true
            };
            const res = await this.client.query(query);
            if (!res || !res.query) {
                return new MediaWikiQuerySummaryResponseClass(res);
            }
            if (!res || !res.query || !res.query.normalized || !res.query.pages || typeof res.query.pages !== "object") {
                return new MediaWikiQuerySummaryResponseClass(res);
            }
            const pagesArr = Object.values(res.query.pages ?? {});
            return new MediaWikiQuerySummaryResponseClass({
                batchcomplete: res.batchcomplete,
                query: {
                    normalized: res.query.normalized,
                    pages: pagesArr
                }
            });
        },
        /**
         * Retrieves information about the current user.
         * @returns Promise resolving to user info response class instance.
         */
        userInfo: async () => {
            const query = {
                meta: ["userinfo"],
                uiprop: "*"
            };
            const res = await this.client.query(query);
            if (!res || !res.query) {
                return new MediaWikiQueryUserInfoResponseClass(res);
            }
            return new MediaWikiQueryUserInfoResponseClass(res);
        },
        /**
         * Retrieves tokens for given types, such as CSRF tokens.
         * @param options - Object with 'type' specifying token types to fetch.
         * @returns Promise resolving to tokens response class instance.
         */
        getToken: async (options) => {
            const query = {
                meta: ["tokens"],
                type: options.type
            };
            const res = await this.client.query(query);
            if (!res || !res.query) {
                return new MediaWikiQueryTokensResponseClass(res);
            }
            return new MediaWikiQueryTokensResponseClass(res);
        },
        /**
         * Edits a page by providing 'title' or 'pageid' and new 'text'.
         * Requires a CSRF token.
         * @param options - Must include either 'title' or 'pageid', and 'text'.
         * @returns Promise resolving to the edit page response class instance.
         * @throws If required parameters are missing.
         */
        editPage: async (options) => {
            if (!options) {
                throw new Error("Options are required for the editpage method.");
            }
            if (!options.title && !options.pageid && !options.text) {
                throw new Error(`You must provide either "page", "pageid" or "text" for the editpage method.`);
            }
            const csrfResponse = await this.client.getToken({ type: ["csrf"] });
            const query = {
                token: csrfResponse.query.tokens.csrftoken,
                action: "edit",
                ...options
            };
            const filteredParams = this.filterParams(query);
            const res = await this.fetchData({
                method: "POST",
                url: this.baseURL,
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                data: this.formURLEncoder(filteredParams)
            });
            if (!res || !res.query) {
                return new MediaWikiQueryEditPageResponseClass(res);
            }
            return new MediaWikiQueryEditPageResponseClass(res);
        },
    };
}
exports.MediaWiki = MediaWiki;
