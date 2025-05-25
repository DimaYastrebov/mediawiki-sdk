import {
    MediaWiki,
    MediaWikiApiError,
    MediaWikiOptions,
    MediaWikiPageOptions,
    MediaWikiQueryResponse,
    MediaWikiQueryPageResponse,
    MediaWikiQuerySiteInfoResponse,
    MediaWikiQueryOpenSearchOptions,
    MediaWikiQueryOpenSearchResponse,
    MediaWikiQueryParseOptions,
    MediaWikiQueryParseResponse,
    MediaWikiQueryCategoriesOptions,
    MediaWikiQueryCategoriesResponse,
    MediaWikiQueryRevisionsOptions,
    MediaWikiQueryRevisionsResponse,
    MediaWikiQuerySummaryOptions,
    MediaWikiQuerySummaryResponse,
    MediaWikiQueryUserInfoResponse,
    MediaWikiQueryTokensOptions,
    MediaWikiQueryTokensResponse,
    MediaWikiQueryEditPageOptions,
    MediaWikiQueryEditPageResponse,
    MediaWikiQueryPageResponseClass,
    MediaWikiQueryParseResponseClass,
    MediaWikiQuerySummaryResponseClass,
    MediaWikiQueryUserInfoResponseClass,
    MediaWikiQueryTokensResponseClass,
    MediaWikiQueryEditPageResponseClass,
    MediaWikiQueryPageFullDetails,
    MediaWikiQueryForPageMethod,
    MediaWikiQueryUserInfoDetails,
    MediaWikiQueryTokensDetails,
    MediaWikiQueryEditPageDetails,
    MediaWikiErrorCodeResponse,
    MediaWikiListSearchItem,
    MediaWikiListSearchInfo,
    MediaWikiQueryNormalizedItem,
    MediaWikiQueryRedirectItem,
    MediaWikiComprehensiveContinueBlock,
    Cookie,
    CookieStore
} from '../src/index';

const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockFetchResolved = (data: any, headers?: HeadersInit) => {
    mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(data),
        text: jest.fn().mockResolvedValue(JSON.stringify(data)),
        headers: new Headers(headers),
    });
};

const mockFetchRejected = (status: number, errorData?: MediaWikiErrorCodeResponse, textResponse?: string) => {
    const responseBody = textResponse ?? (errorData ? JSON.stringify({ error: errorData }) : `Error ${status}`);
    const isJsonLike = responseBody.trim().startsWith('{') || responseBody.trim().startsWith('[');

    mockFetch.mockResolvedValue({
        ok: false,
        status,
        json: jest.fn().mockImplementation(async () => {
            if (errorData) return { error: errorData };
            if (isJsonLike) {
                try {
                    return JSON.parse(responseBody);
                } catch (e) { }
            }
            return { rawErrorText: responseBody };
        }),
        text: jest.fn().mockResolvedValue(responseBody),
        headers: new Headers(),
    });
};

const BASE_URL_WITH_API = 'https://en.wikipedia.org/w/api.php';
const BASE_URL_WITHOUT_API = 'https://en.wikipedia.org/w';

describe('MediaWiki Class', () => {
    beforeEach(() => {
        mockFetch.mockReset();
    });

    describe('Constructor', () => {
        it('should initialize with baseURL ending in /api.php', () => {
            const wiki = new MediaWiki({ baseURL: BASE_URL_WITH_API });
            expect(wiki.getBaseURL()).toBe(BASE_URL_WITH_API);
        });

        it('should append /api.php if baseURL does not end with it', () => {
            const wiki = new MediaWiki({ baseURL: BASE_URL_WITHOUT_API });
            expect(wiki.getBaseURL()).toBe(BASE_URL_WITH_API);
        });

        it('should throw error if baseURL is not provided', () => {
            expect(() => new MediaWiki({} as MediaWikiOptions)).toThrow('baseURL is required');
        });

        it('should set default params (format, formatversion)', () => {
            const wiki = new MediaWiki({ baseURL: BASE_URL_WITH_API });
            const params = wiki.getParams();
            expect(params.format).toBe('json');
            expect(params.formatversion).toBe(2);
        });

        it('should override default params if provided', () => {
            const options: MediaWikiOptions = {
                baseURL: BASE_URL_WITH_API,
                format: 'json', // format: 'xml' will throw an error now as per code
                formatversion: 1,
                servedby: true,
            };
            const wiki = new MediaWiki(options);
            const params = wiki.getParams();
            expect(params.format).toBe('json');
            expect(params.formatversion).toBe(1);
            expect(params.servedby).toBe(true);
        });

        it('should throw error for non-json format', () => {
            const options: MediaWikiOptions = {
                baseURL: BASE_URL_WITH_API,
                format: 'xml' as any, // Cast to any to bypass type checking for test
            };
            expect(() => new MediaWiki(options)).toThrow('Expected "json" format but got "xml". The library only speaks JSON...');
        });
    });

    describe('Simple Methods', () => {
        let wiki: MediaWiki;
        beforeEach(() => {
            wiki = new MediaWiki({ baseURL: BASE_URL_WITH_API });
        });

        it('isAuthorized() should be false initially', () => {
            expect(wiki.isAuthorized()).toBe(false);
        });

        it('getBaseURL() should return the correct baseURL', () => {
            expect(wiki.getBaseURL()).toBe(BASE_URL_WITH_API);
        });

        it('getParams() should return a copy of params', () => {
            const params = wiki.getParams();
            expect(params).toEqual({
                servedby: undefined,
                curtimestamp: undefined,
                responselanginfo: undefined,
                requestid: undefined,
                format: 'json',
                formatversion: 2,
                ascii: undefined,
                utf8: undefined,
            });
            params.format = 'xml'; // Modify copy
            expect(wiki.getParams().format).toBe('json'); // Original should be unchanged
        });

        it('getCookies() should return cookies from CookieStore', () => {
            // Mock CookieStore or just check it returns empty array initially
            expect(wiki.getCookies()).toEqual([]);
        });

        it('getDebugInfo() should return debug information', () => {
            const debugInfo = wiki.getDebugInfo() as any;
            expect(debugInfo.baseURL).toBe(BASE_URL_WITH_API);
            expect(debugInfo.params).toBeDefined();
            expect(debugInfo.authorized).toBe(false);
            expect(debugInfo.cookies).toEqual([]);
        });

        describe('isLoggedIn()', () => {
            it('should return false if user is anonymous', async () => {
                mockFetchResolved({
                    batchcomplete: true,
                    query: { userinfo: { id: 0, name: '127.0.0.1', anon: true } },
                });
                expect(await wiki.isLoggedIn()).toBe(true); // anon property exists, so it will be true
            });

            it('should return true if user is logged in (anon is not present or false)', async () => {
                mockFetchResolved({
                    batchcomplete: true,
                    query: { userinfo: { id: 123, name: 'TestUser' /* no anon implies logged in */ } },
                });
                // Current logic: `userInfo.query.userinfo.anon ? userInfo.query.userinfo.anon : false;`
                // If anon is undefined, it returns false. If anon is true, it returns true.
                // This means isLoggedIn actually checks if `anon` is literally `true`.
                expect(await wiki.isLoggedIn()).toBe(false); // anon is undefined, so treated as not anonymous (logged in by common sense, but method returns !anon)

                mockFetchResolved({
                    batchcomplete: true,
                    query: { userinfo: { id: 123, name: 'TestUser', anon: false } },
                });
                expect(await wiki.isLoggedIn()).toBe(false); // anon is false
            });
        });


        describe('Site Info Dependent Methods', () => {
            const siteInfoData = {
                query: {
                    general: { sitename: 'TestWiki' },
                    namespaces: {
                        '0': { id: 0, '*': '', canonical: 'Main' },
                        '1': { id: 1, '*': 'Talk', canonical: 'Talk' },
                    },
                },
            };

            it('returns [] if namespaces is not an object', () => {
                (wiki as any).siteInfo = {
                    namespaces: 'lol'
                };
                const result = wiki.getNamespaceArray();
                expect(result).toEqual([]);
            });

            it('returns [] if namespaces is null', () => {
                (wiki as any).siteInfo = {
                    namespaces: null
                };
                const result = wiki.getNamespaceArray();
                expect(result).toEqual([]);
            });

            it('getSiteName() should return null when siteInfo is loaded but general is missing (direct set)', () => {
                (wiki as any).siteInfo = {
                    namespaces: {
                        '0': { id: 0, '*': '', canonical: 'Main' },
                    },
                };
                expect(wiki.getSiteName()).toBeNull();
            });

            it('getSiteName() should return null when siteInfo.general exists but sitename is missing (direct set)', () => {
                (wiki as any).siteInfo = {
                    general: {},
                    namespaces: {
                        '0': { id: 0, '*': '', canonical: 'Main' },
                    },
                };
                expect(wiki.getSiteName()).toBeNull();
            });

            it('getSiteName() should return null when siteInfo.general or sitename is explicitly null (direct set)', () => {
                (wiki as any).siteInfo = {
                    general: null,
                    namespaces: {}
                };
                expect(wiki.getSiteName()).toBeNull();

                (wiki as any).siteInfo = {
                    general: { sitename: null },
                    namespaces: {}
                };
                expect(wiki.getSiteName()).toBeNull();
            });

            it('getSiteName() should throw if siteInfo not loaded', () => {
                expect(() => wiki.getSiteName()).toThrow('siteInfo not loaded. Call siteInfo() first.');
            });

            it('getNamespaceList() should throw if siteInfo not loaded', () => {
                expect(() => wiki.getNamespaceList()).toThrow('siteInfo not loaded. Call siteInfo() first.');
            });

            it('getNamespaceArray() should throw if siteInfo not loaded', () => {
                expect(() => wiki.getNamespaceArray()).toThrow('siteInfo not loaded. Call siteInfo() first.');
            });

            it('getSiteName() should return site name after siteInfo is loaded', async () => {
                mockFetchResolved(siteInfoData);
                await wiki.client.siteInfo();
                expect(wiki.getSiteName()).toBe('TestWiki');
            });

            it('getSiteName() should return null if sitename is missing after siteInfo is loaded', async () => {
                mockFetchResolved({ query: { general: {} } }); // No sitename
                await wiki.client.siteInfo();
                expect(wiki.getSiteName()).toBeNull();
            });

            it('getNamespaceList() should return namespace list after siteInfo is loaded', async () => {
                mockFetchResolved(siteInfoData);
                await wiki.client.siteInfo();
                expect(wiki.getNamespaceList()).toEqual(siteInfoData.query.namespaces);
            });

            it('getNamespaceList() should return null if namespaces are missing after siteInfo is loaded', async () => {
                mockFetchResolved({ query: { general: { sitename: 'TestWiki' } } }); // No namespaces
                await wiki.client.siteInfo();
                expect(wiki.getNamespaceList()).toBeNull();
            });

            it('getNamespaceArray() should return namespace array after siteInfo is loaded', async () => {
                mockFetchResolved(siteInfoData);
                await wiki.client.siteInfo();
                expect(wiki.getNamespaceArray()).toEqual([
                    { id: 0, name: '' },
                    { id: 1, name: 'Talk' },
                ]);
            });

            it('getNamespaceArray() should return empty array if namespaces are missing after siteInfo is loaded', async () => {
                mockFetchResolved({ query: { general: { sitename: 'TestWiki' } } }); // No namespaces
                await wiki.client.siteInfo();
                expect(wiki.getNamespaceArray()).toEqual([]);
            });

            it('getSiteName() should return null if general info is missing after siteInfo is loaded', async () => {
                mockFetchResolved({
                    query: {
                        namespaces: {}
                    }
                });

                await wiki.client.siteInfo();
                expect(wiki.getSiteName()).toBeNull();
            });
        });
    });

    describe('client object', () => {
        let wiki: MediaWiki;

        beforeEach(() => {
            wiki = new MediaWiki({ baseURL: BASE_URL_WITHOUT_API });
            mockFetch.mockReset();
        });

        describe('fetchData (indirectly via public methods)', () => {
            it('should handle successful GET request', async () => {
                const mockResponseData = { data: 'success' };
                mockFetchResolved(mockResponseData);
                const response = await wiki.client.siteInfo(); // siteInfo uses GET
                expect(mockFetch).toHaveBeenCalledTimes(1);
                expect(mockFetch.mock.calls[0][0]).toContain(BASE_URL_WITH_API);
                expect(mockFetch.mock.calls[0][1]?.method).toBe('GET'); // Not directly checkable from client.siteInfo
                expect(response).toEqual(mockResponseData);
            });

            it('should handle successful POST request', async () => {
                const csrfTokenValue = 'testtoken';
                const mockEditResponseData = { query: { edit: { result: 'Success' } } };

                mockFetch
                    .mockResolvedValueOnce({
                        ok: true,
                        json: jest.fn().mockResolvedValueOnce({ query: { tokens: { csrftoken: csrfTokenValue } } }),
                        text: jest.fn().mockResolvedValueOnce(JSON.stringify({ query: { tokens: { csrftoken: csrfTokenValue } } })),
                        headers: new Headers(),
                    })
                    .mockResolvedValueOnce({
                        ok: true,
                        json: jest.fn().mockResolvedValueOnce(mockEditResponseData),
                        text: jest.fn().mockResolvedValueOnce(JSON.stringify(mockEditResponseData)),
                        headers: new Headers(),
                    });

                await wiki.client.editPage({ title: 'Test', text: 'Hello' });

                expect(mockFetch).toHaveBeenCalledTimes(2);
                const editCallArgs = mockFetch.mock.calls[1];
                const bodyParams = new URLSearchParams(editCallArgs[1]?.body);
                expect(bodyParams.get('token')).toBe(csrfTokenValue);
            });

            it('should include default and client-specific params', async () => {
                const customWiki = new MediaWiki({ baseURL: BASE_URL_WITH_API, requestid: '123' });
                mockFetchResolved({ query: {} });
                await customWiki.client.query({ titles: ['Test'], prop: ['info'] });

                const calledUrl = new URL(mockFetch.mock.calls[0][0]);
                expect(calledUrl.searchParams.get('format')).toBe('json');
                expect(calledUrl.searchParams.get('formatversion')).toBe('2');
                expect(calledUrl.searchParams.get('requestid')).toBe('123'); // From constructor
                expect(calledUrl.searchParams.get('action')).toBe('query');
                expect(calledUrl.searchParams.get('titles')).toBe('Test');
                expect(calledUrl.searchParams.get('prop')).toBe('info');
            });


            it('should throw MediaWikiApiError on API error response', async () => {
                const errorResp: MediaWikiErrorCodeResponse = { code: 'testerror', info: 'This is a test error' };
                mockFetchRejected(400, errorResp);
                try {
                    await wiki.client.siteInfo();
                } catch (e) {
                    expect(e).toBeInstanceOf(MediaWikiApiError);
                    const mwError = e as MediaWikiApiError;
                    expect(mwError.status).toBe(400);
                    expect(mwError.code).toBe('testerror');
                    expect(mwError.info).toBe('This is a test error');
                    expect(mwError.message).toContain('This is a test error (Code: testerror)');
                    expect(mwError.responseData).toEqual({ error: errorResp });
                }
            });

            it('should throw MediaWikiApiError on network or non-JSON error', async () => {
                mockFetchRejected(500, undefined, "Server meltdown");
                try {
                    await wiki.client.siteInfo();
                } catch (e) {
                    expect(e).toBeInstanceOf(MediaWikiApiError);
                    const mwError = e as MediaWikiApiError;
                    expect(mwError.status).toBe(500);
                    expect(mwError.code).toBeUndefined();
                    expect(mwError.info).toBeUndefined();
                    expect(mwError.message).toContain('Request failed with status 500');
                    expect(mwError.responseText).toBe("Server meltdown");
                }
            });

            it('should handle cookies correctly (set-cookie and sending)', async () => {
                const cookieName = 'testsession';
                const cookieValue = '12345abcde';
                mockFetchResolved(
                    { query: { tokens: { logintoken: 'fakelogintoken' } } },
                    { 'Set-Cookie': `${cookieName}=${cookieValue}; Path=/; HttpOnly` }
                );

                // First call to get a cookie
                await wiki.client.getToken({ type: ['login'] });
                expect(wiki.getCookies().length).toBe(1);
                expect(wiki.getCookies()[0].name).toBe(cookieName);
                expect(wiki.getCookies()[0].value).toBe(cookieValue);

                mockFetch.mockClear(); // Clear previous call
                mockFetchResolved({ query: { userinfo: { id: 1, name: 'User' } } });

                // Second call, should send the cookie
                await wiki.client.userInfo();
                expect(mockFetch).toHaveBeenCalledTimes(1);
                const headers = mockFetch.mock.calls[0][1]?.headers as Record<string, string>;
                expect(headers['Cookie']).toBe(`${cookieName}=${cookieValue}`);
            });

            it('should send raw string data as body for non-GET requests if options.data is a string', async () => {
                const rawStringContent = 'This is some raw string content for the body.';
                const mockSuccessResponse = { success: true, message: 'Raw content sent.' };

                mockFetchResolved(mockSuccessResponse);

                const result = await (wiki as any).fetchData({
                    'method': 'POST',
                    params: {},
                    data: rawStringContent,
                    url: 'https://example.com'
                });

                expect(mockFetch).toHaveBeenCalledTimes(1);
                const [url, fetchOptions] = mockFetch.mock.calls[0];

                expect(fetchOptions.method).toBe('POST');
                expect(fetchOptions.body).toBe(rawStringContent);
                expect(result).toEqual(mockSuccessResponse);
            });

            it('should send JSON stringified data as body for non-GET requests if options.data is an object', async () => {
                const objectContent = { key: 'value', another_key: 123 };
                const mockSuccessResponse = { success: true, message: 'JSON object sent.' };

                mockFetchResolved(mockSuccessResponse);

                const result = await (wiki as any).fetchData({
                    'method': 'POST',
                    params: {},
                    data: objectContent,
                    url: 'https://example.com'
                });

                expect(mockFetch).toHaveBeenCalledTimes(1);
                const [url, fetchOptions] = mockFetch.mock.calls[0];

                expect(fetchOptions.method).toBe('POST');
                expect(fetchOptions.body).toBe(JSON.stringify(objectContent));
                expect(result).toEqual(mockSuccessResponse);
            });

            it('should handle both getSetCookie(), get("set-cookie"), and get?.("set-cookie") for response headers', async () => {
                const cookieHeader = 'testcookie=abc123; Path=/; HttpOnly';
                const mockHeaders = {
                    getSetCookie: jest.fn().mockReturnValue([cookieHeader]),
                    get: jest.fn().mockReturnValue(cookieHeader)
                };
                mockFetch.mockResolvedValue({
                    ok: true,
                    json: jest.fn().mockResolvedValue({ query: { tokens: { csrftoken: 'tok' } } }),
                    text: jest.fn().mockResolvedValue(JSON.stringify({ query: { tokens: { csrftoken: 'tok' } } })),
                    headers: mockHeaders
                });

                await wiki.client.getToken({ type: ['csrf'] });

                expect(mockHeaders.getSetCookie).toHaveBeenCalled();
                expect(wiki.getCookies().some(c => c.name === 'testcookie' && c.value === 'abc123')).toBe(true);

                const wiki2 = new MediaWiki({ baseURL: BASE_URL_WITH_API });
                const mockHeaders2 = {
                    getSetCookie: undefined,
                    get: jest.fn().mockReturnValue(cookieHeader)
                };
                mockFetch.mockResolvedValue({
                    ok: true,
                    json: jest.fn().mockResolvedValue({ query: { tokens: { csrftoken: 'tok2' } } }),
                    text: jest.fn().mockResolvedValue(JSON.stringify({ query: { tokens: { csrftoken: 'tok2' } } })),
                    headers: mockHeaders2
                });

                await wiki2.client.getToken({ type: ['csrf'] });
                expect(mockHeaders2.get).toHaveBeenCalledWith('set-cookie');
                expect(wiki2.getCookies().some(c => c.name === 'testcookie' && c.value === 'abc123')).toBe(true);

                const wiki3 = new MediaWiki({ baseURL: BASE_URL_WITH_API });
                const multiCookieHeaders = {
                    getSetCookie: jest.fn().mockReturnValue([cookieHeader, 'anothercookie=val; Path=/']),
                    get: jest.fn()
                };
                mockFetch.mockResolvedValue({
                    ok: true,
                    json: jest.fn().mockResolvedValue({ query: { tokens: { csrftoken: 'tok3' } } }),
                    text: jest.fn().mockResolvedValue(JSON.stringify({ query: { tokens: { csrftoken: 'tok3' } } })),
                    headers: multiCookieHeaders
                });

                await wiki3.client.getToken({ type: ['csrf'] });
                expect(wiki3.getCookies().some(c => c.name === 'testcookie')).toBe(true);
                expect(wiki3.getCookies().some(c => c.name === 'anothercookie')).toBe(true);

                const wiki4 = new MediaWiki({ baseURL: BASE_URL_WITH_API });
                const mockHeaders4 = {
                    getSetCookie: undefined,
                    get: undefined
                };
                Object.defineProperty(mockHeaders4, 'get', {
                    value: undefined,
                    writable: true,
                    configurable: true
                });
                mockHeaders4.get = undefined;
                mockFetch.mockResolvedValue({
                    ok: true,
                    json: jest.fn().mockResolvedValue({ query: { tokens: { csrftoken: 'tok4' } } }),
                    text: jest.fn().mockResolvedValue(JSON.stringify({ query: { tokens: { csrftoken: 'tok4' } } })),
                    headers: mockHeaders4
                });

                await wiki4.client.getToken({ type: ['csrf'] });
                expect(wiki4.getCookies().length).toBe(0);

                const wiki5 = new MediaWiki({ baseURL: BASE_URL_WITH_API });
                const mockHeaders5 = {
                    getSetCookie: undefined,
                    get: jest.fn().mockReturnValue(cookieHeader)
                };
                mockFetch.mockResolvedValue({
                    ok: true,
                    json: jest.fn().mockResolvedValue({ query: { tokens: { csrftoken: 'tok5' } } }),
                    text: jest.fn().mockResolvedValue(JSON.stringify({ query: { tokens: { csrftoken: 'tok5' } } })),
                    headers: mockHeaders5
                });
                await wiki5.client.getToken({ type: ['csrf'] });
                expect(wiki5.getCookies().some(c => c.name === 'testcookie')).toBe(true);
            });
        });

        describe('client.query()', () => {
            it('should throw error if titles is set but prop/meta are missing and list is present', async () => {
                await expect(wiki.client.query({
                    titles: ['Example'],
                    list: ["allcategories"]
                })).rejects.toThrow('"titles" provided but no "prop", "meta", or "list" specified. Nothing to retrieve.');
            });


            it('should make a basic query successfully', async () => {
                const mockResponse: MediaWikiQueryResponse = { batchcomplete: true, query: { pages: {} } };
                mockFetchResolved(mockResponse);
                const response = await wiki.client.query({ titles: ['Main Page'], prop: ['info'] });
                expect(response).toEqual(mockResponse);
                const calledUrl = new URL(mockFetch.mock.calls[0][0]);
                expect(calledUrl.searchParams.get('action')).toBe('query');
                expect(calledUrl.searchParams.get('titles')).toBe('Main Page');
                expect(calledUrl.searchParams.get('prop')).toBe('info');
            });

            it('should handle list parameter', async () => {
                const mockResponse: MediaWikiQueryResponse = { batchcomplete: true, query: { allpages: [] } };
                mockFetchResolved(mockResponse);
                await wiki.client.query({ list: ['allpages'] });
                const calledUrl = new URL(mockFetch.mock.calls[0][0]);
                expect(calledUrl.searchParams.get('list')).toBe('allpages');
            });

            it('should handle meta parameter', async () => {
                const mockResponse: MediaWikiQueryResponse = { batchcomplete: true, query: { userinfo: {} as MediaWikiQueryUserInfoDetails } };
                mockFetchResolved(mockResponse);
                await wiki.client.query({ meta: ['userinfo'] });
                const calledUrl = new URL(mockFetch.mock.calls[0][0]);
                expect(calledUrl.searchParams.get('meta')).toBe('userinfo');
            });

            // Error cases for client.query
            const errorTestCases: { name: string, opts: MediaWikiPageOptions, errorMsg: string }[] = [
                { name: 'options undefined', opts: undefined as any, errorMsg: 'Options are required for the query method.' },
                { name: 'title and titles', opts: { title: 'A', titles: ['B'] }, errorMsg: 'Use either "title" or "titles", not both.' },
                { name: 'titles and pageids', opts: { titles: ['A'], pageids: ['1'] }, errorMsg: 'Cannot use both "titles" and "pageids".' },
                // { name: 'titles without prop/meta/list', opts: { titles: ['A'] }, errorMsg: '"titles" provided but no "prop", "meta", or "list" specified.' }, // This check isn't strictly true, a query with just titles is valid for some backend modules like CirrusSearch dump
                { name: 'export without titles', opts: { export: true }, errorMsg: '"export" requires "titles" to be set.' },
                { name: 'indexpageids without titles/pageids', opts: { indexpageids: true }, errorMsg: '"indexpageids" only works with "titles" or "pageids".' },
                { name: 'redirects without titles/pageids/title', opts: { redirects: true }, errorMsg: '"redirects" has no effect without "titles", "pageids", or "title".' },
                { name: 'prop without titles/pageids', opts: { prop: ['info'] }, errorMsg: '"prop" requires either "titles", "pageids".' },
            ];

            errorTestCases.forEach(tc => {
                it(`should throw error for: ${tc.name}`, async () => {
                    await expect(wiki.client.query(tc.opts)).rejects.toThrow(tc.errorMsg);
                });
            });

            it('should handle "pageids" parameter', async () => {
                const mockResponse: MediaWikiQueryResponse = { batchcomplete: true, query: { pages: {} } };
                mockFetchResolved(mockResponse);
                await wiki.client.query({ pageids: ['1', '2'], prop: ['info'] });
                const calledUrl = new URL(mockFetch.mock.calls[0][0]);
                expect(calledUrl.searchParams.get('pageids')).toBe('1|2');
            });

            it('should handle "srprop" parameter', async () => {
                const mockResponse: MediaWikiQueryResponse = { batchcomplete: true, query: {} };
                mockFetchResolved(mockResponse);
                await wiki.client.query({
                    list: ['search'],
                    srsearch: 'test',
                    srprop: ['snippet', 'titlesnippet']
                });
                const calledUrl = new URL(mockFetch.mock.calls[0][0]);
                expect(calledUrl.searchParams.get('srprop')).toBe('snippet|titlesnippet');
            });
        });

        describe('client.page()', () => {
            it('should fetch page data and return MediaWikiQueryPageResponseClass instance', async () => {
                const mockPageData: MediaWikiQueryPageFullDetails = { pageid: 1, ns: 0, title: 'Main Page' } as MediaWikiQueryPageFullDetails;
                const mockResponse: MediaWikiQueryPageResponse = {
                    batchcomplete: true,
                    query: { pages: { '1': mockPageData } }
                };
                mockFetchResolved(mockResponse);
                const response = await wiki.client.page(['Main Page']);
                expect(response).toBeInstanceOf(MediaWikiQueryPageResponseClass);
                expect(response.query.pages['1'].title).toBe('Main Page');
                const calledUrl = new URL(mockFetch.mock.calls[0][0]);
                expect(calledUrl.searchParams.get('prop')).toContain('info');
                expect(calledUrl.searchParams.get('prop')).toContain('extracts');
            });

            it('should throw error if titles is empty or missing', async () => {
                await expect(wiki.client.page([])).rejects.toThrow("Missing or empty 'titles' - must be a non-empty.");
                await expect(wiki.client.page(undefined as any)).rejects.toThrow("Missing or empty 'titles' - must be a non-empty.");
            });
        });

        describe('client.search()', () => {
            it('should perform a search', async () => {
                const mockResponse: MediaWikiQueryResponse = { // Adapting to MediaWikiQuerySearchResponse
                    batchcomplete: true,
                    query: {
                        searchinfo: { totalhits: 1 } as MediaWikiListSearchInfo,
                        search: [{ ns: 0, title: 'Result' } as MediaWikiListSearchItem]
                    }
                };
                mockFetchResolved(mockResponse);
                const response = await wiki.client.search('test query', ['0'], 5);
                expect(response.query.search[0].title).toBe('Result');
                const calledUrl = new URL(mockFetch.mock.calls[0][0]);
                expect(calledUrl.searchParams.get('list')).toBe('search');
                expect(calledUrl.searchParams.get('srsearch')).toBe('test query');
                expect(calledUrl.searchParams.get('srnamespace')).toBe('0');
                expect(calledUrl.searchParams.get('srlimit')).toBe('5');
            });

            it('should use default srlimit if not provided', async () => {
                mockFetchResolved({ batchcomplete: true, query: { search: [] } });
                await wiki.client.search('test query');
                const calledUrl = new URL(mockFetch.mock.calls[0][0]);
                expect(calledUrl.searchParams.get('srlimit')).toBe('10');
            });

            it('should throw error if srsearch is empty', async () => {
                await expect(wiki.client.search('')).rejects.toThrow('Missing "srsearch" - must be a non-empty string.');
            });

            it('should return as-is when response is null', async () => {
                mockFetchResolved(null as any);
                const response = await wiki.client.search('s3o65me536356655363 quer1243y');
                expect(response).toBeNull();
            });
        });

        describe('client.siteInfo()', () => {
            it('should fetch site info and populate internal siteInfo property', async () => {
                const mockSiteInfo: MediaWikiQuerySiteInfoResponse = {
                    batchcomplete: true,
                    query: { general: { sitename: 'MyWiki' } } as any,
                };
                mockFetchResolved(mockSiteInfo);
                const response = await wiki.client.siteInfo();
                expect(response).toEqual(mockSiteInfo);
                expect((wiki as any).siteInfo).toEqual(mockSiteInfo.query); // Check internal property
                const calledUrl = new URL(mockFetch.mock.calls[0][0]);
                expect(calledUrl.searchParams.get('meta')).toBe('siteinfo');
            });

            it('should set siteInfo to null if response or query is missing', async () => {
                mockFetchResolved(null as any);
                const response = await wiki.client.siteInfo();
                expect(response).toBeNull();
                expect((wiki as any).siteInfo).toBeNull();
            });

        });

        describe('client.opensearch()', () => {
            const opensearchOpts: MediaWikiQueryOpenSearchOptions = { search: 'hello', limit: 5, namespace: [0] };
            it('should perform an opensearch query', async () => {
                const mockResponse: MediaWikiQueryOpenSearchResponse = ['hello', ['Hello Page'], ['Description'], ['url']] as any; // Simplified mock
                mockFetchResolved(mockResponse);
                const response = await wiki.client.opensearch(opensearchOpts);
                expect(response[0]).toBe('hello');
                const calledUrl = new URL(mockFetch.mock.calls[0][0]);
                expect(calledUrl.searchParams.get('action')).toBe('opensearch');
                expect(calledUrl.searchParams.get('search')).toBe('hello');
                expect(calledUrl.searchParams.get('limit')).toBe('5');
            });

            it('should throw if options is missing', async () => {
                await expect(wiki.client.opensearch(undefined as any)).rejects.toThrow('Options are required for the opensearch method.');
            });
            it('should throw if options.search is missing', async () => {
                await expect(wiki.client.opensearch({} as any)).rejects.toThrow('A search is required for the opensearch method.');
            });

            it('should return response as-is when query is missing', async () => {
                const mockResponse = { someOther: 'value' };
                mockFetchResolved(mockResponse);
                const res = await wiki.client.opensearch(opensearchOpts);
                expect(res).toEqual(mockResponse);
            });

            it('should return response as MediaWikiQueryOpenSearchResponse when query is present', async () => {
                const mockResponse = { query: { some: 'data' } } as any;
                mockFetchResolved(mockResponse);
                const res = await wiki.client.opensearch(opensearchOpts);
                expect(res).toEqual(mockResponse);
            });
        });

        describe('client.parse()', () => {
            const parseOpts: MediaWikiQueryParseOptions = { page: 'TestPage' };
            it('should parse page content and return MediaWikiQueryParseResponseClass', async () => {
                const mockResponse: MediaWikiQueryParseResponse = { parse: { title: 'TestPage', text: '<p>Content</p>' } } as any;
                mockFetchResolved(mockResponse);
                const response = await wiki.client.parse(parseOpts);
                expect(response).toBeInstanceOf(MediaWikiQueryParseResponseClass);
                expect(response.parse.title).toBe('TestPage');
                const calledUrl = new URL(mockFetch.mock.calls[0][0]);
                expect(calledUrl.searchParams.get('action')).toBe('parse');
                expect(calledUrl.searchParams.get('page')).toBe('TestPage');
            });
            it('should work with text option', async () => {
                const mockResponse: MediaWikiQueryParseResponse = { parse: { title: 'Dynamic Content', text: 'parsed text' } } as any;
                mockFetchResolved(mockResponse);
                await wiki.client.parse({ text: 'some wikitext', title: 'Dynamic Content' }); // title is required with text for context
                const calledUrl = new URL(mockFetch.mock.calls[0][0]);
                expect(calledUrl.searchParams.get('text')).toBe('some wikitext');
            });

            it('should throw if options missing', async () => {
                await expect(wiki.client.parse(undefined as any)).rejects.toThrow('Options are required for the parse method.');
            });
            it('should throw if page, pageid, and text are all missing', async () => {
                await expect(wiki.client.parse({} as any)).rejects.toThrow('You must provide either "page", "pageid" or "text" for the parse method.');
            });
            it('should return MediaWikiQueryParseResponseClass even if parse property is missing', async () => {
                const mockResponse = { someOther: 'value' };
                mockFetchResolved(mockResponse);
                const res = await wiki.client.parse(parseOpts);
                expect(res).toBeInstanceOf(MediaWikiQueryParseResponseClass);
            });
        });

        describe('client.categories()', () => {
            it('should fetch categories for a page', async () => {
                const mockPageDetails: Partial<MediaWikiQueryPageFullDetails> = {
                    pageid: 1, ns: 0, title: 'Test Page',
                    categories: [{ ns: 14, title: 'Category:TestCat' }]
                };
                const mockResponse: MediaWikiQueryResponse = {
                    batchcomplete: true,
                    query: {
                        normalized: [{ from: 'test page', to: 'Test Page' } as MediaWikiQueryNormalizedItem],
                        pages: { '1': mockPageDetails as MediaWikiQueryPageFullDetails }
                    }
                };
                mockFetchResolved(mockResponse);
                const response = await wiki.client.categories({ title: 'test page' });
                expect(response.query.pages[0].title).toBe('Test Page');
                expect(response.query.pages[0].categories[0].title).toBe('Category:TestCat');
                const calledUrl = new URL(mockFetch.mock.calls[0][0]);
                expect(calledUrl.searchParams.get('prop')).toBe('categories');
            });

            it('should throw if title is missing', async () => {
                await expect(wiki.client.categories({} as any)).rejects.toThrow('Missing or invalid "title" - must be a non-empty string.');
                await expect(wiki.client.categories(undefined as any)).rejects.toThrow('Missing or invalid "title" - must be a non-empty string.');
            });

            it('should return default structure when query or pages is missing', async () => {
                const mockResponse = { someOther: 'value' };
                mockFetchResolved(mockResponse);
                const res = await wiki.client.categories({ title: 'some page' });
                expect(res).toEqual({
                    continue: {} as MediaWikiComprehensiveContinueBlock,
                    query: {
                        normalized: [],
                        pages: []
                    }
                });
            });

            it('should return empty normalized and pages arrays if they are missing in response', async () => {
                const mockResponse = {
                    continue: { cmcontinue: 'page|12345', continue: '-||' },
                    query: {}
                };
                mockFetchResolved(mockResponse);
                const res = await wiki.client.categories({ title: 'test page' });
                expect(res.query.normalized).toEqual([]);
                expect(res.query.pages).toEqual([]);
            });

            it('should handle null or undefined pages safely with ?? {} and ?? []', async () => {
                const mockResponse = {
                    continue: {},
                    query: {
                        normalized: undefined,
                        pages: null
                    }
                };
                mockFetchResolved(mockResponse);
                const res = await wiki.client.categories({ title: 'another page' });
                expect(Array.isArray(res.query.normalized)).toBe(true);
                expect(Array.isArray(res.query.pages)).toBe(true);
            });
        });

        describe('client.revisions()', () => {
            it('should fetch revisions for a page', async () => {
                const mockPageDetails: Partial<MediaWikiQueryPageFullDetails> = {
                    pageid: 1, ns: 0, title: 'Test Page',
                    revisions: [{ revid: 123, user: 'UserA', timestamp: 'ts' } as any]
                };
                const mockResponse: MediaWikiQueryResponse = {
                    batchcomplete: true,
                    query: {
                        normalized: [{ from: 'test page', to: 'Test Page' } as MediaWikiQueryNormalizedItem],
                        pages: { '1': mockPageDetails as MediaWikiQueryPageFullDetails }
                    }
                };
                mockFetchResolved(mockResponse);
                const response = await wiki.client.revisions({ title: 'test page', rvlimit: 5 });
                expect(response.query.pages[0].revisions[0].revid).toBe(123);
                const calledUrl = new URL(mockFetch.mock.calls[0][0]);
                expect(calledUrl.searchParams.get('prop')).toBe('revisions');
                expect(calledUrl.searchParams.get('rvlimit')).toBe('5');
            });
            it('should throw if title is missing', async () => {
                await expect(wiki.client.revisions({} as any)).rejects.toThrow('Missing or invalid "title" - must be a non-empty string.');
            });
            it('should return default structure if response is invalid or missing query/pages', async () => {
                mockFetchResolved({});
                const res1 = await wiki.client.revisions({ title: 'bad page', rvlimit: 10 });
                expect(res1).toEqual({
                    batchcomplete: false,
                    query: {
                        normalized: [],
                        pages: []
                    }
                });

                mockFetchResolved({ query: {} });
                const res2 = await wiki.client.revisions({ title: 'bad page 2', rvlimit: 10 });
                expect(res2).toEqual({
                    batchcomplete: false,
                    query: {
                        normalized: [],
                        pages: []
                    }
                });

                mockFetchResolved({ query: { pages: null } });
                const res3 = await wiki.client.revisions({ title: 'bad page 3', rvlimit: 10 });
                expect(res3).toEqual({
                    batchcomplete: false,
                    query: {
                        normalized: [],
                        pages: []
                    }
                });
            });
            it('should handle null or missing pages and normalized', async () => {
                mockFetchResolved({
                    batchcomplete: false,
                    query: {
                        normalized: undefined,
                        pages: {}
                    }
                });
                const res = await wiki.client.revisions({ title: 'test page', rvlimit: 5 });
                expect(Array.isArray(res.query.normalized)).toBe(true); // normalized -> []
                expect(Array.isArray(res.query.pages)).toBe(true); // pages -> []
            });
            it('should default batchcomplete to false if missing', async () => {
                mockFetchResolved({
                    query: {
                        normalized: [],
                        pages: {}
                    }
                });
                const res = await wiki.client.revisions({ title: 'test page', rvlimit: 10 });
                expect(res.batchcomplete).toBe(false);
            });

        });

        describe('client.summary()', () => {
            it('should fetch summary for a page and return MediaWikiQuerySummaryResponseClass', async () => {
                const mockPageDetails: Partial<MediaWikiQueryPageFullDetails> = {
                    pageid: 1, ns: 0, title: 'Test Page', extract: 'This is a summary.'
                };
                const mockResponse: MediaWikiQueryResponse = {
                    batchcomplete: true,
                    query: {
                        normalized: [{ from: 'test page', to: 'Test Page' } as MediaWikiQueryNormalizedItem],
                        pages: { '1': mockPageDetails as MediaWikiQueryPageFullDetails }
                    }
                };
                mockFetchResolved(mockResponse);
                const response = await wiki.client.summary({ title: 'test page' });
                expect(response).toBeInstanceOf(MediaWikiQuerySummaryResponseClass);
                expect(response.text()).toBe('This is a summary.');
                const calledUrl = new URL(mockFetch.mock.calls[0][0]);
                expect(calledUrl.searchParams.get('prop')).toBe('extracts');
                expect(calledUrl.searchParams.get('exintro')).toBe('true');
            });
            it('should throw if title is missing', async () => {
                await expect(wiki.client.summary({} as any)).rejects.toThrow('Missing or invalid "title" - must be a non-empty string.');
            });
            it('should return empty summary response class if response or query is missing', async () => {
                mockFetchResolved(null);
                const res1 = await wiki.client.summary({ title: 'bad page' });
                expect(res1).toBeInstanceOf(MediaWikiQuerySummaryResponseClass);

                mockFetchResolved({});
                const res2 = await wiki.client.summary({ title: 'bad page 2' });
                expect(res2).toBeInstanceOf(MediaWikiQuerySummaryResponseClass);
            });
            it('should return empty summary response class if query.pages or normalized missing or invalid', async () => {
                mockFetchResolved({
                    query: {
                        pages: {}
                    }
                });
                const res1 = await wiki.client.summary({ title: 'bad page 3' });
                expect(res1).toBeInstanceOf(MediaWikiQuerySummaryResponseClass);

                mockFetchResolved({
                    query: {
                        normalized: [],
                    }
                });
                const res2 = await wiki.client.summary({ title: 'bad page 4' });
                expect(res2).toBeInstanceOf(MediaWikiQuerySummaryResponseClass);

                mockFetchResolved({
                    query: {
                        normalized: [],
                        pages: null
                    }
                });
                const res3 = await wiki.client.summary({ title: 'bad page 5' });
                expect(res3).toBeInstanceOf(MediaWikiQuerySummaryResponseClass);
            });
            it('should handle empty pages object gracefully', async () => {
                mockFetchResolved({
                    batchcomplete: true,
                    query: {
                        normalized: [],
                        pages: {}
                    }
                });
                const res = await wiki.client.summary({ title: 'empty pages' });
                expect(res).toBeInstanceOf(MediaWikiQuerySummaryResponseClass);
            });
        });

        describe('client.userInfo()', () => {
            it('should fetch user info and return MediaWikiQueryUserInfoResponseClass', async () => {
                const mockUserInfo: MediaWikiQueryUserInfoDetails = { id: 1, name: 'TestUser' } as MediaWikiQueryUserInfoDetails;
                const mockResponse: MediaWikiQueryUserInfoResponse = {
                    batchcomplete: true,
                    query: { userinfo: mockUserInfo }
                };
                mockFetchResolved(mockResponse);
                const response = await wiki.client.userInfo();
                expect(response).toBeInstanceOf(MediaWikiQueryUserInfoResponseClass);
                expect(response.getUserName()).toBe('TestUser');
                const calledUrl = new URL(mockFetch.mock.calls[0][0]);
                expect(calledUrl.searchParams.get('meta')).toBe('userinfo');
                expect(calledUrl.searchParams.get('uiprop')).toBe('*');
            });

            it('should return empty response class if response or query is missing', async () => {
                mockFetchResolved(null);
                const res1 = await wiki.client.userInfo();
                expect(res1).toBeInstanceOf(MediaWikiQueryUserInfoResponseClass);

                mockFetchResolved({});
                const res2 = await wiki.client.userInfo();
                expect(res2).toBeInstanceOf(MediaWikiQueryUserInfoResponseClass);
            });
        });

        describe('client.getToken()', () => {
            it('should fetch tokens and return MediaWikiQueryTokensResponseClass', async () => {
                const mockTokens: MediaWikiQueryTokensDetails = { csrftoken: 'testtoken123' } as MediaWikiQueryTokensDetails;
                const mockResponse: MediaWikiQueryTokensResponse = {
                    batchcomplete: true,
                    query: { tokens: mockTokens }
                };
                mockFetchResolved(mockResponse);
                const response = await wiki.client.getToken({ type: ['csrf'] });
                expect(response).toBeInstanceOf(MediaWikiQueryTokensResponseClass);
                expect(response.getCsrfToken()).toBe('testtoken123');
                const calledUrl = new URL(mockFetch.mock.calls[0][0]);
                expect(calledUrl.searchParams.get('meta')).toBe('tokens');
                expect(calledUrl.searchParams.get('type')).toBe('csrf');
            });

            it('should throw if response is null or missing query or tokens', async () => {
                mockFetchResolved(null);
                await expect(wiki.client.getToken({ type: ['csrf'] })).rejects.toThrow(/Failed to retrieve tokens/);

                mockFetchResolved({});
                await expect(wiki.client.getToken({ type: ['csrf'] })).rejects.toThrow(/Failed to retrieve tokens/);

                mockFetchResolved({ query: {} });
                await expect(wiki.client.getToken({ type: ['csrf'] })).rejects.toThrow(/Failed to retrieve tokens/);
            });
        });

        describe('client.editPage()', () => {
            const editOptions: MediaWikiQueryEditPageOptions = { title: 'EditThis', text: 'New content' };
            const csrfToken = 'samplecsrftoken';

            beforeEach(() => {
                jest.clearAllMocks();
            });

            it('should throw if options missing', async () => {
                await expect(wiki.client.editPage(undefined as any)).rejects.toThrow('Options are required for the editpage method.');
            });

            it('should throw if title/pageid and text are missing', async () => {
                await expect(wiki.client.editPage({} as any)).rejects.toThrow('You must provide either "page", "pageid" or "text" for the editpage method.');
            });

            it('should fetch csrf token before editing', async () => {
                const csrfToken = 'samplecsrftoken';
                const mockTokenResponse = {
                    batchcomplete: true, // Добавь, если класс ожидает
                    query: { tokens: { csrftoken: csrfToken } as MediaWikiQueryTokensDetails }
                };
                // Мокаем getToken, чтобы он вернул инстанс класса, как и должен
                jest.spyOn(wiki.client, 'getToken').mockResolvedValue(
                    new MediaWikiQueryTokensResponseClass(mockTokenResponse as MediaWikiQueryTokensResponse)
                );

                // А вот это мок для самого запроса на редактирование (POST)
                const mockEditApiResponse = { edit: { result: 'Success', pageid: 1, title: 'Edited Page', contentmodel: 'wikitext', oldrevid: 10, newrevid: 11, newtimestamp: '2023Z', watched: false } };
                mockFetchResolved({ query: mockEditApiResponse }); // Убедись, что mockFetchResolved правильно мокает fetch для POST

                const response = await wiki.client.editPage({ title: 'EditThis', text: 'New content' });

                expect(wiki.client.getToken).toHaveBeenCalledWith({ type: ['csrf'] });
                expect(mockFetch).toHaveBeenCalledTimes(1);
                const [url, fetchOptions] = mockFetch.mock.calls[0];
                expect(fetchOptions?.method).toBe('POST');
                const bodyParams = new URLSearchParams(fetchOptions?.body as string);
                expect(bodyParams.get('action')).toBe('edit');
                expect(bodyParams.get('token')).toBe(csrfToken);

                expect(response).toBeInstanceOf(MediaWikiQueryEditPageResponseClass);
                expect(response.getResult()).toBe('Success');
            });

            it('should return MediaWikiQueryEditPageResponseClass even if res.query is missing', async () => {
                const csrfToken = 'samplecsrftoken';
                const editOptions: MediaWikiQueryEditPageOptions = { title: 'EditThis', text: 'New content' };

                jest.spyOn(wiki.client, 'getToken').mockResolvedValue({
                    query: { tokens: { csrftoken: csrfToken } }
                } as any);

                const mockApiResponseForEditPost = {
                    batchcomplete: true,
                };

                mockFetchResolved(
                    mockApiResponseForEditPost,
                    new Headers({ 'Content-Type': 'application/json' })
                );

                const response = await wiki.client.editPage(editOptions);

                expect(response).toBeInstanceOf(MediaWikiQueryEditPageResponseClass);
                expect(response.batchcomplete).toBe(true);
                expect(response.getResult()).toBe("Unknown");
                expect(response.getPageId()).toBe(0);
            });
        });
    });
});

describe('Response Wrapper Classes', () => {
    const mockWikiInstance = new MediaWiki({ baseURL: BASE_URL_WITH_API });
    (mockWikiInstance.client as any).editPage = jest.fn();

    describe('MediaWikiQueryPageResponseClass', () => {
        const pageDetails: MediaWikiQueryPageFullDetails = {
            pageid: 1, ns: 0, title: 'Test Page', extract: '<p>Hello</p>',
            categories: [{ ns: 14, title: 'Category:A' }, { '*': 'Category:B' }]
        } as MediaWikiQueryPageFullDetails;
        const responseData: MediaWikiQueryPageResponse = {
            batchcomplete: true,
            query: { pages: { '1': pageDetails } }
        };
        const pageResponse = new MediaWikiQueryPageResponseClass(responseData, mockWikiInstance);

        it('should handle API response with empty query.pages object', async () => {
            const mockWiki = new MediaWiki({ baseURL: BASE_URL_WITH_API });
            const mockResponseWithEmptyPages: MediaWikiQueryPageResponse = {
                batchcomplete: true,
                query: {
                    pages: {}
                }
            };
            mockFetchResolved(mockResponseWithEmptyPages);

            const response = await mockWiki.client.page(['Fdfdfdfdfdfdfdfdfsdadyd']);

            expect(response).toBeInstanceOf(MediaWikiQueryPageResponseClass);
            expect((response as any).pageDetails).toBeUndefined();
            expect(response.html()).toBe("");
            expect(response.title()).toBe("");
            expect(response.categories()).toEqual([]);
        });

        it('should handle API response where query.pages is undefined', async () => {
            const mockWiki = new MediaWiki({ baseURL: BASE_URL_WITH_API });
            const mockResponseWithoutPages: MediaWikiQueryPageResponse = {
                batchcomplete: true,
                query: {
                    // pages отсутствует
                } as MediaWikiQueryForPageMethod
            };
            mockFetchResolved(mockResponseWithoutPages);

            const response = await mockWiki.client.page(['Another Page']);

            expect(response).toBeInstanceOf(MediaWikiQueryPageResponseClass);
            expect((response as any).pageDetails).toBeUndefined();
            expect(response.html()).toBe("");
            expect(response.title()).toBe("");
            expect(response.categories()).toEqual([]);
        });

        it('should handle API response where data.query itself is undefined', async () => {
            const mockWiki = new MediaWiki({ baseURL: BASE_URL_WITH_API });
            const mockResponseWithoutQuery: MediaWikiQueryPageResponse = {
                batchcomplete: true,
            } as unknown as MediaWikiQueryPageResponse;
            mockFetchResolved(mockResponseWithoutQuery);
            const response = await mockWiki.client.page(['PageWhenQueryIsMissing']);

            expect(response).toBeInstanceOf(MediaWikiQueryPageResponseClass);
            expect((response as any).pageDetails).toBeUndefined();
            expect(response.html()).toBe("");
            expect(response.title()).toBe("");
            expect(response.categories()).toEqual([]);
            expect(response.query).toBeUndefined();
        });

        it('html() should return extract', () => {
            expect(pageResponse.html()).toBe('<p>Hello</p>');
        });

        it('html() should return empty string if no extract', () => {
            const noExtractData: MediaWikiQueryPageResponse = {
                batchcomplete: true, query: { pages: { '1': { ...pageDetails, extract: undefined } as any } }
            };
            const resp = new MediaWikiQueryPageResponseClass(noExtractData, mockWikiInstance);
            expect(resp.html()).toBe('');
        });

        it('title() should return title', () => {
            expect(pageResponse.title()).toBe('Test Page');
        });

        it('title() should return empty string if no title', () => {
            const noTitleData: MediaWikiQueryPageResponse = {
                batchcomplete: true, query: { pages: { '1': { ...pageDetails, title: undefined } as any } }
            };
            const resp = new MediaWikiQueryPageResponseClass(noTitleData, mockWikiInstance);
            expect(resp.title()).toBe('');
        });

        it('categories() should return category titles', () => {
            // Note: The current code in MediaWikiQueryPageResponseClass.categories() is `this.query?.pages[0]?.categories?.map((c: any) => c["*"]) ?? [];`
            // It expects `pages[0]` which might not be robust if page IDs are not sequential or if `indexpageids` is not used.
            // Assuming for this test that pageDetails is effectively pages[0] due to single page response.
            const specificResponseData: MediaWikiQueryPageResponse = {
                batchcomplete: true,
                query: {
                    pages: {
                        // Using a specific key 'somePageId' to simulate real API if indexpageids is not used,
                        // but the current class implementation relies on Object.keys(pages)[0]
                        '1': { // Re-aligning with how the class constructor gets pageDetails
                            ...pageDetails,
                            categories: [{ ns: 14, title: "Category:RealTitle" }]
                        } as MediaWikiQueryPageFullDetails
                    }
                }
            };
            const resp = new MediaWikiQueryPageResponseClass(specificResponseData, mockWikiInstance);
            expect(resp.categories()).toEqual(["Category:RealTitle"]);
        });

        it('categories() should return empty array if no categories', () => {
            const noCatData: MediaWikiQueryPageResponse = {
                batchcomplete: true, query: { pages: { '1': { ...pageDetails, categories: undefined } as any } }
            };
            const resp = new MediaWikiQueryPageResponseClass(noCatData, mockWikiInstance);
            expect(resp.categories()).toEqual([]);
        });

        describe('edit() method', () => {
            const editOpts = { text: 'new content for edit', summary: 'test edit' };

            it('should call wiki.client.editPage with correct params', async () => {
                (mockWikiInstance.client.editPage as jest.Mock).mockResolvedValueOnce({}); // Mock successful edit
                await pageResponse.edit(editOpts);
                expect(mockWikiInstance.client.editPage).toHaveBeenCalledWith({
                    pageid: pageDetails.pageid, // Uses pageid from the page data
                    ...editOpts
                });
            });

            it('should use title if pageid is not available', async () => {
                const noPageIdDetails: MediaWikiQueryPageFullDetails = { ...pageDetails, pageid: undefined as any, title: "FallbackTitle" };
                const noPageIdResponseData: MediaWikiQueryPageResponse = {
                    batchcomplete: true,
                    query: { pages: { 'somekey': noPageIdDetails } }
                };
                const noPageIdPageResponse = new MediaWikiQueryPageResponseClass(noPageIdResponseData, mockWikiInstance);

                (mockWikiInstance.client.editPage as jest.Mock).mockResolvedValueOnce({});
                await noPageIdPageResponse.edit(editOpts);
                expect(mockWikiInstance.client.editPage).toHaveBeenCalledWith({
                    title: "FallbackTitle",
                    ...editOpts
                });
            });

            it('should throw if page details are not available', async () => {
                const noPageDetailsData: MediaWikiQueryPageResponse = { batchcomplete: true, query: { pages: {} } }; // Empty pages
                const resp = new MediaWikiQueryPageResponseClass(noPageDetailsData, mockWikiInstance);
                await expect(resp.edit(editOpts)).rejects.toThrow("Page details not available for editing.");
            });

            it('should throw if page title or ID is missing for editing', async () => {
                const noIdentifiersData: MediaWikiQueryPageResponse = {
                    batchcomplete: true, query: { pages: { '1': { ...pageDetails, title: undefined, pageid: undefined } as any } }
                };
                const resp = new MediaWikiQueryPageResponseClass(noIdentifiersData, mockWikiInstance);
                await expect(resp.edit(editOpts)).rejects.toThrow("Page title or ID is required for editing.");
            });

            it('should throw if text is not a string', async () => {
                await expect(pageResponse.edit({ text: 123 as any })).rejects.toThrow("Parameter 'text' is required for editing.");
            });
        });
    });

    describe('MediaWikiQueryParseResponseClass', () => {
        const parseData: MediaWikiQueryParseResponse = {
            parse: { title: 'Parsed Page', text: 'HTML Content', pageid: 10, categories: [{ '*': 'Cat1' }] } as any
        };
        const parseResponse = new MediaWikiQueryParseResponseClass(parseData);

        it('text() should return parsed text', () => expect(parseResponse.text()).toBe('HTML Content'));
        it('html() should return parsed text (as per current code)', () => expect(parseResponse.html()).toBe('HTML Content'));
        it('title() should return title', () => expect(parseResponse.title()).toBe('Parsed Page'));
        it('categories() should return category star values', () => expect(parseResponse.categories()).toEqual(['Cat1']));
        it('categories() should return empty array if no categories', () => {
            const noCatData: MediaWikiQueryParseResponse = { parse: { ...parseData.parse, categories: undefined } };
            const resp = new MediaWikiQueryParseResponseClass(noCatData);
            expect(resp.categories()).toEqual([]);
        });
        it('text(), html(), title() should return empty string if parse data is missing', () => {
            const parseDataWithoutParseField: MediaWikiQueryParseResponse = {
            } as unknown as MediaWikiQueryParseResponse;

            const parseResponse = new MediaWikiQueryParseResponseClass(parseDataWithoutParseField);

            expect(parseResponse.text()).toBe('');
            expect(parseResponse.html()).toBe('');
            expect(parseResponse.title()).toBe('');
        });

        it('text(), html(), title() should return empty string if respective fields are missing in parse data', () => {
            const parseDataWithMissingFields: MediaWikiQueryParseResponse = {
                parse: {
                    pageid: 10,
                } as any
            };

            const parseResponse = new MediaWikiQueryParseResponseClass(parseDataWithMissingFields);

            expect(parseResponse.text()).toBe('');
            expect(parseResponse.html()).toBe('');
            expect(parseResponse.title()).toBe('');
        });

        it('categories() should return empty array if no categories and parse data is missing', () => {
            const parseDataWithoutParseField: MediaWikiQueryParseResponse = { /* 'parse' field is missing */ } as unknown as MediaWikiQueryParseResponse;
            const resp = new MediaWikiQueryParseResponseClass(parseDataWithoutParseField);
            expect(resp.categories()).toEqual([]);
        });
    });

    describe('MediaWikiQuerySummaryResponseClass', () => {
        const summaryData: MediaWikiQuerySummaryResponse = {
            batchcomplete: true,
            query: { pages: [{ pageid: 1, ns: 0, title: 'Summary Page', extract: 'This is the summary.' }] } as any
        };
        const summaryResponse = new MediaWikiQuerySummaryResponseClass(summaryData);
        it('text() should return extract from the first page', () => expect(summaryResponse.text()).toBe('This is the summary.'));
        it('text() should return empty string if no pages or extract', () => {
            const summaryDataWithEmptyExtract: MediaWikiQuerySummaryResponse = {
                batchcomplete: true,
                query: { normalized: [], pages: [{ pageid: 1, ns: 0, title: 'Summary Page', extract: '' }] }
            };
            const resp1 = new MediaWikiQuerySummaryResponseClass(summaryDataWithEmptyExtract);
            expect(resp1.text()).toBe('');

            const summaryDataNoPages: MediaWikiQuerySummaryResponse = {
                batchcomplete: true,
                query: { normalized: [], pages: [] }
            };
            const resp2 = new MediaWikiQuerySummaryResponseClass(summaryDataNoPages);
            expect(resp2.text()).toBe('');

            const summaryDataNoExtractField: MediaWikiQuerySummaryResponse = {
                batchcomplete: true,
                query: { normalized: [], pages: [{ pageid: 1, ns: 0, title: 'Summary Page' } as any] }
            };
            const resp3 = new MediaWikiQuerySummaryResponseClass(summaryDataNoExtractField);
            expect(resp3.text()).toBe('');
        });
        it('text() should return empty string if query is missing or undefined', () => {
            const summaryDataWithoutQueryField: MediaWikiQuerySummaryResponse = {
                batchcomplete: true,
            } as unknown as MediaWikiQuerySummaryResponse;

            const resp1 = new MediaWikiQuerySummaryResponseClass(summaryDataWithoutQueryField);
            expect(resp1.text()).toBe('');

            const summaryDataWithUndefinedQuery: MediaWikiQuerySummaryResponse = {
                batchcomplete: true,
                query: undefined as any
            };
            const resp2 = new MediaWikiQuerySummaryResponseClass(summaryDataWithUndefinedQuery);
            expect(resp2.text()).toBe('');
        });
        it('constructor should correctly assign warnings and errors if present', () => {
            const dataWithWarningsAndErrors: MediaWikiQueryUserInfoResponse = {
                batchcomplete: true,
                query: { userinfo: { id: 123, name: 'TestUser' } as any },
                warnings: {
                    main: { '*': 'This is a test warning.' },
                    custom: { '*': 'Another warning.' }
                },
                errors: [
                    { code: 'test_error_code', info: 'This is a test error message.' }
                ]
            };

            const response = new MediaWikiQueryUserInfoResponseClass(dataWithWarningsAndErrors);

            expect(response.warnings).toEqual(dataWithWarningsAndErrors.warnings);
            expect(response.errors).toEqual(dataWithWarningsAndErrors.errors);
        });

        it('constructor should not assign warnings or errors if not present in data', () => {
            const dataWithoutWarningsOrErrors: MediaWikiQueryUserInfoResponse = {
                batchcomplete: true,
                query: { userinfo: { id: 123, name: 'TestUser' } as any }
            };
            const response = new MediaWikiQueryUserInfoResponseClass(dataWithoutWarningsOrErrors);
            expect(response.warnings).toBeUndefined();
            expect(response.errors).toBeUndefined();
        });
    });

    describe('MediaWikiQueryUserInfoResponseClass', () => {
        const userInfo: MediaWikiQueryUserInfoDetails = { id: 123, name: 'TestUser', options: {} } as MediaWikiQueryUserInfoDetails;
        const anonInfo: MediaWikiQueryUserInfoDetails = { id: 0, name: '1.2.3.4', anon: true, options: {} } as MediaWikiQueryUserInfoDetails;

        const userData: MediaWikiQueryUserInfoResponse = { batchcomplete: true, query: { userinfo: userInfo } };
        const anonData: MediaWikiQueryUserInfoResponse = { batchcomplete: true, query: { userinfo: anonInfo } };

        const userResponse = new MediaWikiQueryUserInfoResponseClass(userData);
        const anonResponse = new MediaWikiQueryUserInfoResponseClass(anonData);

        it('isAnonymous() should return true for anonymous user', () => expect(anonResponse.isAnonymous()).toBe(true));
        it('isAnonymous() should return false for logged-in user (id != 0 and anon is false/undefined)', () => {
            expect(userResponse.isAnonymous()).toBe(false); // anon is undefined
            const userExplicitlyNotAnon = new MediaWikiQueryUserInfoResponseClass({
                batchcomplete: true, query: { userinfo: { ...userInfo, anon: false } }
            });
            expect(userExplicitlyNotAnon.isAnonymous()).toBe(false); // anon is false
        });
        it('getUserId() should return user ID', () => expect(userResponse.getUserId()).toBe(123));
        it('getUserName() should return user name', () => expect(userResponse.getUserName()).toBe('TestUser'));
        it('getUserInfo() should return full user info object', () => expect(userResponse.getUserInfo()).toEqual(userInfo));
        it('getUserOptions() should return user options', () => expect(userResponse.getUserOptions()).toEqual(userInfo.options));
        it('isAnonymous() should return true for anonymous user with anon: true', () => {
            const anonDataWithAnonTrue: MediaWikiQueryUserInfoResponse = {
                batchcomplete: true,
                query: { userinfo: { id: 0, name: '1.2.3.4', anon: true, options: {} } as any }
            };
            const resp = new MediaWikiQueryUserInfoResponseClass(anonDataWithAnonTrue);
            expect(resp.isAnonymous()).toBe(true);
        });

        it('isAnonymous() should return true for anonymous user with id: 0 (and anon is not true)', () => {
            const anonDataWithIdZero: MediaWikiQueryUserInfoResponse = {
                batchcomplete: true,
                query: { userinfo: { id: 0, name: 'Anon User by ID', options: {} } as any }
            };
            const resp = new MediaWikiQueryUserInfoResponseClass(anonDataWithIdZero);
            expect(resp.isAnonymous()).toBe(true);
        });

        it('isAnonymous() should return false for logged-in user (id != 0 and anon is false/undefined)', () => {
            const loggedInUser1: MediaWikiQueryUserInfoResponse = {
                batchcomplete: true,
                query: { userinfo: { id: 123, name: 'TestUser', options: {} } as any }
            };
            const resp1 = new MediaWikiQueryUserInfoResponseClass(loggedInUser1);
            expect(resp1.isAnonymous()).toBe(false);

            const loggedInUser2: MediaWikiQueryUserInfoResponse = {
                batchcomplete: true,
                query: { userinfo: { id: 456, name: 'AnotherUser', anon: false, options: {} } as any }
            };
            const resp2 = new MediaWikiQueryUserInfoResponseClass(loggedInUser2);
            expect(resp2.isAnonymous()).toBe(false);
        });
    });

    describe('MediaWikiQueryTokensResponseClass', () => {
        const tokens: MediaWikiQueryTokensDetails = {
            csrftoken: 'csrf1', watchtoken: 'watch1', patroltoken: 'patrol1',
            rollbacktoken: 'roll1', userrightstoken: 'user1', logintoken: 'login1',
            createaccounttoken: 'create1'
        };
        const tokensData: MediaWikiQueryTokensResponse = { batchcomplete: true, query: { tokens } };
        const tokensResponse = new MediaWikiQueryTokensResponseClass(tokensData);

        it('getCsrfToken()', () => expect(tokensResponse.getCsrfToken()).toBe('csrf1'));
        it('getWatchToken()', () => expect(tokensResponse.getWatchToken()).toBe('watch1'));
        it('getPatrolToken()', () => expect(tokensResponse.getPatrolToken()).toBe('patrol1'));
        it('getRollbackToken()', () => expect(tokensResponse.getRollbackToken()).toBe('roll1'));
        it('getUserRightsToken()', () => expect(tokensResponse.getUserRightsToken()).toBe('user1'));
        it('getLoginToken()', () => expect(tokensResponse.getLoginToken()).toBe('login1'));
        it('getCreateAccountToken()', () => expect(tokensResponse.getCreateAccountToken()).toBe('create1'));
        it('getEditToken() (alias for csrf)', () => expect(tokensResponse.getEditToken()).toBe('csrf1'));
        it('constructor should correctly assign warnings and errors if present', () => {
            const dataWithWarningsAndErrors: MediaWikiQueryTokensResponse = {
                batchcomplete: true,
                query: { tokens: { csrftoken: 'test' } as any },
                warnings: {
                    main: { '*': 'A test warning for tokens.' }
                },
                errors: [
                    { code: 'token_error', info: 'Failed to get token.' }
                ]
            };

            const response = new MediaWikiQueryTokensResponseClass(dataWithWarningsAndErrors);

            expect(response.warnings).toEqual(dataWithWarningsAndErrors.warnings);
            expect(response.errors).toEqual(dataWithWarningsAndErrors.errors);
        });

        it('constructor should not assign warnings or errors if not present in data', () => {
            const dataWithoutWarningsOrErrors: MediaWikiQueryTokensResponse = {
                batchcomplete: true,
                query: { tokens: { csrftoken: 'test' } as any }
            };
            const response = new MediaWikiQueryTokensResponseClass(dataWithoutWarningsOrErrors);

            expect(response.warnings).toBeUndefined();
            expect(response.errors).toBeUndefined();
        });
    });

    describe('MediaWikiQueryEditPageResponseClass', () => {
        const editDetails: MediaWikiQueryEditPageDetails = {
            result: 'Success', pageid: 1, title: 'Edited Page', contentmodel: 'wikitext',
            oldrevid: 10, newrevid: 11, newtimestamp: '2023Z', watched: false
        };
        const editResponseData: MediaWikiQueryEditPageResponse = { batchcomplete: true, query: { edit: editDetails } };
        const editResponse = new MediaWikiQueryEditPageResponseClass(editResponseData);

        it('getResult()', () => expect(editResponse.getResult()).toBe('Success'));
        it('getPageId()', () => expect(editResponse.getPageId()).toBe(1));
        it('getTitle()', () => expect(editResponse.getTitle()).toBe('Edited Page'));
        it('getContentModel()', () => expect(editResponse.getContentModel()).toBe('wikitext'));
        it('getOldRevisionId()', () => expect(editResponse.getOldRevisionId()).toBe(10));
        it('getNewRevisionId()', () => expect(editResponse.getNewRevisionId()).toBe(11));
        it('getNewTimestamp()', () => expect(editResponse.getNewTimestamp()).toBe('2023Z'));
        it('isWatched()', () => expect(editResponse.isWatched()).toBe(false));

        it('hasWarnings() and getWarnings()', () => {
            const warnData = { ...editResponseData, warnings: { main: { '*': 'A warning' } } };
            const warnResponse = new MediaWikiQueryEditPageResponseClass(warnData);
            expect(warnResponse.hasWarnings()).toBe(true);
            expect(warnResponse.getWarnings()).toEqual({ main: { '*': 'A warning' } });
            expect(editResponse.hasWarnings()).toBe(false);
            expect(editResponse.getWarnings()).toBeUndefined();
        });

        it('hasErrors() and getErrors()', () => {
            const errorData = { ...editResponseData, errors: [{ code: 'err', info: 'An error' }] };
            const errorResponse = new MediaWikiQueryEditPageResponseClass(errorData);
            expect(errorResponse.hasErrors()).toBe(true);
            expect(errorResponse.getErrors()).toEqual([{ code: 'err', info: 'An error' }]);
            expect(editResponse.hasErrors()).toBe(false);
            expect(editResponse.getErrors()).toBeUndefined();
        });
    });
});

describe('CookieStore Class', () => {
    let store: CookieStore;
    const originHost = 'en.wikipedia.org';
    const fullUrl = 'https://en.wikipedia.org/path';

    beforeEach(() => {
        store = new CookieStore();
    });

    it('parseSetCookie should parse basic cookie', () => {
        store.parseSetCookie('foo=bar', originHost);
        const cookies = store.getCookieHeader(fullUrl);
        expect(cookies.length).toBe(1);
        expect(cookies[0].name).toBe('foo');
        expect(cookies[0].value).toBe('bar');
        expect(cookies[0].domain).toBe(originHost); // HostOnly
        expect(cookies[0].path).toBe('/');
        expect(cookies[0].hostOnly).toBe(true);
    });

    it('parseSetCookie should handle attributes', () => {
        const expiresDate = new Date(Date.now() + 3600000);
        const expectedExpiresTimeInSeconds = Math.floor(expiresDate.getTime() / 1000);

        store.parseSetCookie(`baz=qux; Expires=${expiresDate.toUTCString()}; Path=/path; Domain=.en.wikipedia.org; Secure; HttpOnly; SameSite=Lax`, originHost);
        const cookies = store.getCookieHeader(fullUrl);

        expect(cookies.length).toBe(1);
        const c = cookies[0];
        expect(c.name).toBe('baz');
        expect(c.path).toBe('/path');
        expect(c.domain).toBe('en.wikipedia.org');
        expect(c.hostOnly).toBeUndefined();
        expect(c.secure).toBe(true);
        expect(c.httpOnly).toBe(true);
        expect(c.sameSite).toBe('Lax');

        expect(c.expires).toBeDefined();
        expect(Math.floor(c.expires!.getTime() / 1000)).toBe(expectedExpiresTimeInSeconds);
    });

    it('getCookieHeader should filter by domain', () => {
        store.parseSetCookie('a=1; Domain=en.wikipedia.org', originHost);
        store.parseSetCookie('b=2; Domain=sub.en.wikipedia.org', originHost);
        store.parseSetCookie('c=3; Domain=other.com', originHost);

        expect(store.getCookieHeader('https://en.wikipedia.org/').map(c => c.name)).toEqual(['a']);
        expect(store.getCookieHeader('https://sub.en.wikipedia.org/').map(c => c.name).sort()).toEqual(['a', 'b'].sort());
        expect(store.getCookieHeader('https://another.sub.en.wikipedia.org/').map(c => c.name).sort()).toEqual(['a', 'b'].sort()); // a matches due to domain=.en.wikipedia.org
        expect(store.getCookieHeader('https://other.com/').map(c => c.name)).toEqual(['c']);
    });

    it('getCookieHeader should filter by path', () => {
        store.parseSetCookie('p1=val; Path=/', originHost);
        store.parseSetCookie('p2=val; Path=/path', originHost);
        store.parseSetCookie('p3=val; Path=/path/deep', originHost);

        expect(store.getCookieHeader('https://en.wikipedia.org/').map(c => c.name)).toEqual(['p1']);
        expect(store.getCookieHeader('https://en.wikipedia.org/path').map(c => c.name).sort()).toEqual(['p1', 'p2'].sort());
        expect(store.getCookieHeader('https://en.wikipedia.org/path/deeper').map(c => c.name).sort()).toEqual(['p1', 'p2', 'p3'].sort());
        expect(store.getCookieHeader('https://en.wikipedia.org/other').map(c => c.name)).toEqual(['p1']);
    });

    it('getCookieHeader should filter by secure flag', () => {
        store.parseSetCookie('s1=val; Secure', originHost);
        store.parseSetCookie('s2=val', originHost); // Not secure

        expect(store.getCookieHeader('https://en.wikipedia.org/').map(c => c.name).sort()).toEqual(['s1', 's2'].sort());
        expect(store.getCookieHeader('http://en.wikipedia.org/').map(c => c.name)).toEqual(['s2']); // s1 is secure-only
    });

    it('getCookieHeader should filter expired cookies', () => {
        const pastDate = new Date(Date.now() - 3600000).toUTCString();
        store.parseSetCookie('e1=val; Expires=' + pastDate, originHost);
        store.parseSetCookie('e2=val', originHost); // No expiry
        expect(store.getCookieHeader(fullUrl).map(c => c.name)).toEqual(['e2']);
    });

    it('should update existing cookie', () => {
        store.parseSetCookie('foo=bar; Path=/', originHost);
        store.parseSetCookie('foo=baz; Path=/', originHost); // Same name, domain, path
        const cookies = store.getCookieHeader(fullUrl);
        expect(cookies.length).toBe(1);
        expect(cookies[0].value).toBe('baz');
    });
});

describe('MediaWikiApiError Class', () => {
    it('should refine message with "N/A" code if info is present but code is missing', () => {
        const responseData = { error: { code: undefined, info: 'Some detailed info from API.' } };
        const error = new MediaWikiApiError('Request failed with status 400', 400, JSON.stringify(responseData), responseData);

        expect(error.code).toBeUndefined();
        expect(error.info).toBe('Some detailed info from API.');
        expect(error.message).toBe('Request failed with status 400: Some detailed info from API. (Code: N/A)');
        expect(error.responseData).toEqual(responseData);
    });
    it('should correctly initialize with message, status, and responseText', () => {
        const error = new MediaWikiApiError('Fetch failed', 500, 'Server Error Text');
        expect(error.message).toBe('Fetch failed');
        expect(error.status).toBe(500);
        expect(error.responseText).toBe('Server Error Text');
        expect(error.name).toBe('MediaWikiApiError');
        expect(error.code).toBeUndefined();
        expect(error.info).toBeUndefined();
    });

    it('should parse code and info from responseData if error object exists', () => {
        const responseData = { error: { code: 'badtoken', info: 'Invalid token.' } };
        const error = new MediaWikiApiError('Request failed due to token', 403, JSON.stringify(responseData), responseData);
        expect(error.code).toBe('badtoken');
        expect(error.info).toBe('Invalid token.');
        expect(error.message).toBe('Request failed with status 403: Invalid token. (Code: badtoken)');
        expect(error.responseData).toEqual(responseData);
    });

    it('should refine message with code only if info is missing', () => {
        const responseData = { error: { code: 'somecode' } };
        const error = new MediaWikiApiError('Request failed', 400, JSON.stringify(responseData), responseData);
        expect(error.code).toBe('somecode');
        expect(error.info).toBeUndefined();
        expect(error.message).toBe('Request failed with status 400 (Code: somecode)');
    });

    it('should not override custom message if not starting with "Request failed"', () => {
        const responseData = { error: { code: 'custom', info: 'Custom info' } };
        const error = new MediaWikiApiError('My specific error', 400, JSON.stringify(responseData), responseData);
        expect(error.code).toBe('custom');
        expect(error.info).toBe('Custom info');
        expect(error.message).toBe('My specific error'); // Message is preserved
    });
});