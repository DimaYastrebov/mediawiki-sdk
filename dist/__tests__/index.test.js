"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const cookie_store_1 = require("../cookie-store");
const mockFetch = jest.fn();
global.fetch = mockFetch;
const mockFetchResolved = (data, headers) => {
    mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(data),
        text: jest.fn().mockResolvedValue(JSON.stringify(data)),
        headers: new Headers(headers),
    });
};
const mockFetchRejected = (status, errorData, textResponse) => {
    const responseBody = textResponse ?? (errorData ? JSON.stringify({ error: errorData }) : `Error ${status}`);
    mockFetch.mockResolvedValue({
        ok: false,
        status,
        json: jest.fn().mockResolvedValue(errorData ? { error: errorData } : JSON.parse(responseBody)),
        text: jest.fn().mockResolvedValue(responseBody),
        headers: new Headers(),
    });
};
const BASE_URL_WITH_API = 'https://example.com/w/api.php';
const BASE_URL_WITHOUT_API = 'https://example.com/w';
describe('MediaWiki Class', () => {
    beforeEach(() => {
        mockFetch.mockReset();
    });
    describe('Constructor', () => {
        it('should initialize with baseURL ending in /api.php', () => {
            const wiki = new index_1.MediaWiki({ baseURL: BASE_URL_WITH_API });
            expect(wiki.getBaseURL()).toBe(BASE_URL_WITH_API);
        });
        it('should append /api.php if baseURL does not end with it', () => {
            const wiki = new index_1.MediaWiki({ baseURL: BASE_URL_WITHOUT_API });
            expect(wiki.getBaseURL()).toBe(BASE_URL_WITH_API);
        });
        it('should throw error if baseURL is not provided', () => {
            expect(() => new index_1.MediaWiki({})).toThrow('baseURL is required');
        });
        it('should set default params (format, formatversion)', () => {
            const wiki = new index_1.MediaWiki({ baseURL: BASE_URL_WITH_API });
            const params = wiki.getParams();
            expect(params.format).toBe('json');
            expect(params.formatversion).toBe(2);
        });
        it('should override default params if provided', () => {
            const options = {
                baseURL: BASE_URL_WITH_API,
                format: 'json', // format: 'xml' will throw an error now as per code
                formatversion: 1,
                servedby: true,
            };
            const wiki = new index_1.MediaWiki(options);
            const params = wiki.getParams();
            expect(params.format).toBe('json');
            expect(params.formatversion).toBe(1);
            expect(params.servedby).toBe(true);
        });
        it('should throw error for non-json format', () => {
            const options = {
                baseURL: BASE_URL_WITH_API,
                format: 'xml', // Cast to any to bypass type checking for test
            };
            expect(() => new index_1.MediaWiki(options)).toThrow('Expected "json" format but got "xml". The library only speaks JSON...');
        });
    });
    describe('Simple Methods', () => {
        let wiki;
        beforeEach(() => {
            wiki = new index_1.MediaWiki({ baseURL: BASE_URL_WITH_API });
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
            const debugInfo = wiki.getDebugInfo();
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
        });
    });
    describe('client object', () => {
        let wiki;
        beforeEach(() => {
            wiki = new index_1.MediaWiki({ baseURL: BASE_URL_WITHOUT_API });
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
                // Mock getToken first
                mockFetchResolved({ query: { tokens: { csrftoken: 'testtoken' } } });
                await wiki.client.getToken({ type: ['csrf'] }); // This call populates the token
                mockFetch.mockReset(); // Reset for the actual editPage call
                const mockEditResponse = { query: { edit: { result: 'Success' } } };
                mockFetchResolved(mockEditResponse);
                await wiki.client.editPage({ title: 'Test', text: 'Hello' });
                expect(mockFetch).toHaveBeenCalledTimes(1);
                expect(mockFetch.mock.calls[0][1]?.method).toBe('POST');
                expect(mockFetch.mock.calls[0][1]?.headers).toEqual({ "Content-Type": "application/x-www-form-urlencoded" });
                expect(mockFetch.mock.calls[0][1]?.body).toContain('action=edit');
            });
            it('should include default and client-specific params', async () => {
                const customWiki = new index_1.MediaWiki({ baseURL: BASE_URL_WITH_API, requestid: '123' });
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
                const errorResp = { code: 'testerror', info: 'This is a test error' };
                mockFetchRejected(400, errorResp);
                try {
                    await wiki.client.siteInfo();
                }
                catch (e) {
                    expect(e).toBeInstanceOf(index_1.MediaWikiApiError);
                    const mwError = e;
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
                }
                catch (e) {
                    expect(e).toBeInstanceOf(index_1.MediaWikiApiError);
                    const mwError = e;
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
                mockFetchResolved({ query: { tokens: { logintoken: 'fakelogintoken' } } }, { 'Set-Cookie': `${cookieName}=${cookieValue}; Path=/; HttpOnly` });
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
                const headers = mockFetch.mock.calls[0][1]?.headers;
                expect(headers['Cookie']).toBe(`${cookieName}=${cookieValue}`);
            });
        });
        describe('client.query()', () => {
            it('should make a basic query successfully', async () => {
                const mockResponse = { batchcomplete: true, query: { pages: {} } };
                mockFetchResolved(mockResponse);
                const response = await wiki.client.query({ titles: ['Main Page'], prop: ['info'] });
                expect(response).toEqual(mockResponse);
                const calledUrl = new URL(mockFetch.mock.calls[0][0]);
                expect(calledUrl.searchParams.get('action')).toBe('query');
                expect(calledUrl.searchParams.get('titles')).toBe('Main Page');
                expect(calledUrl.searchParams.get('prop')).toBe('info');
            });
            it('should handle list parameter', async () => {
                const mockResponse = { batchcomplete: true, query: { allpages: [] } };
                mockFetchResolved(mockResponse);
                await wiki.client.query({ list: ['allpages'] });
                const calledUrl = new URL(mockFetch.mock.calls[0][0]);
                expect(calledUrl.searchParams.get('list')).toBe('allpages');
            });
            it('should handle meta parameter', async () => {
                const mockResponse = { batchcomplete: true, query: { userinfo: {} } };
                mockFetchResolved(mockResponse);
                await wiki.client.query({ meta: ['userinfo'] });
                const calledUrl = new URL(mockFetch.mock.calls[0][0]);
                expect(calledUrl.searchParams.get('meta')).toBe('userinfo');
            });
            // Error cases for client.query
            const errorTestCases = [
                { name: 'options undefined', opts: undefined, errorMsg: 'Options are required for the query method.' },
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
        });
        describe('client.page()', () => {
            it('should fetch page data and return MediaWikiQueryPageResponseClass instance', async () => {
                const mockPageData = { pageid: 1, ns: 0, title: 'Main Page' };
                const mockResponse = {
                    batchcomplete: true,
                    query: { pages: { '1': mockPageData } }
                };
                mockFetchResolved(mockResponse);
                const response = await wiki.client.page(['Main Page']);
                expect(response).toBeInstanceOf(index_1.MediaWikiQueryPageResponseClass);
                expect(response.query.pages['1'].title).toBe('Main Page');
                const calledUrl = new URL(mockFetch.mock.calls[0][0]);
                expect(calledUrl.searchParams.get('prop')).toContain('info');
                expect(calledUrl.searchParams.get('prop')).toContain('extracts');
            });
            it('should throw error if titles is empty or missing', async () => {
                await expect(wiki.client.page([])).rejects.toThrow("Missing or empty 'titles' - must be a non-empty.");
                await expect(wiki.client.page(undefined)).rejects.toThrow("Missing or empty 'titles' - must be a non-empty.");
            });
        });
        describe('client.search()', () => {
            it('should perform a search', async () => {
                const mockResponse = {
                    batchcomplete: true,
                    query: {
                        searchinfo: { totalhits: 1 },
                        search: [{ ns: 0, title: 'Result' }]
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
        });
        describe('client.siteInfo()', () => {
            it('should fetch site info and populate internal siteInfo property', async () => {
                const mockSiteInfo = {
                    batchcomplete: true,
                    query: { general: { sitename: 'MyWiki' } },
                };
                mockFetchResolved(mockSiteInfo);
                const response = await wiki.client.siteInfo();
                expect(response).toEqual(mockSiteInfo);
                expect(wiki.siteInfo).toEqual(mockSiteInfo.query); // Check internal property
                const calledUrl = new URL(mockFetch.mock.calls[0][0]);
                expect(calledUrl.searchParams.get('meta')).toBe('siteinfo');
            });
        });
        describe('client.opensearch()', () => {
            const opensearchOpts = { search: 'hello', limit: 5, namespace: [0] };
            it('should perform an opensearch query', async () => {
                const mockResponse = ['hello', ['Hello Page'], ['Description'], ['url']]; // Simplified mock
                mockFetchResolved(mockResponse);
                const response = await wiki.client.opensearch(opensearchOpts);
                expect(response[0]).toBe('hello');
                const calledUrl = new URL(mockFetch.mock.calls[0][0]);
                expect(calledUrl.searchParams.get('action')).toBe('opensearch');
                expect(calledUrl.searchParams.get('search')).toBe('hello');
                expect(calledUrl.searchParams.get('limit')).toBe('5');
            });
            it('should throw if options is missing', async () => {
                await expect(wiki.client.opensearch(undefined)).rejects.toThrow('Options are required for the opensearch method.');
            });
            it('should throw if options.search is missing', async () => {
                await expect(wiki.client.opensearch({})).rejects.toThrow('A search is required for the opensearch method.');
            });
        });
        describe('client.parse()', () => {
            const parseOpts = { page: 'TestPage' };
            it('should parse page content and return MediaWikiQueryParseResponseClass', async () => {
                const mockResponse = { parse: { title: 'TestPage', text: '<p>Content</p>' } };
                mockFetchResolved(mockResponse);
                const response = await wiki.client.parse(parseOpts);
                expect(response).toBeInstanceOf(index_1.MediaWikiQueryParseResponseClass);
                expect(response.parse.title).toBe('TestPage');
                const calledUrl = new URL(mockFetch.mock.calls[0][0]);
                expect(calledUrl.searchParams.get('action')).toBe('parse');
                expect(calledUrl.searchParams.get('page')).toBe('TestPage');
            });
            it('should work with text option', async () => {
                const mockResponse = { parse: { title: 'Dynamic Content', text: 'parsed text' } };
                mockFetchResolved(mockResponse);
                await wiki.client.parse({ text: 'some wikitext', title: 'Dynamic Content' }); // title is required with text for context
                const calledUrl = new URL(mockFetch.mock.calls[0][0]);
                expect(calledUrl.searchParams.get('text')).toBe('some wikitext');
            });
            it('should throw if options missing', async () => {
                await expect(wiki.client.parse(undefined)).rejects.toThrow('Options are required for the parse method.');
            });
            it('should throw if page, pageid, and text are all missing', async () => {
                await expect(wiki.client.parse({})).rejects.toThrow('You must provide either "page", "pageid" or "text" for the parse method.');
            });
        });
        describe('client.categories()', () => {
            it('should fetch categories for a page', async () => {
                const mockPageDetails = {
                    pageid: 1, ns: 0, title: 'Test Page',
                    categories: [{ ns: 14, title: 'Category:TestCat' }]
                };
                const mockResponse = {
                    batchcomplete: true,
                    query: {
                        normalized: [{ from: 'test page', to: 'Test Page' }],
                        pages: { '1': mockPageDetails }
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
                await expect(wiki.client.categories({})).rejects.toThrow('Missing or invalid "title" - must be a non-empty string.');
                await expect(wiki.client.categories(undefined)).rejects.toThrow('Missing or invalid "title" - must be a non-empty string.');
            });
        });
        describe('client.revisions()', () => {
            it('should fetch revisions for a page', async () => {
                const mockPageDetails = {
                    pageid: 1, ns: 0, title: 'Test Page',
                    revisions: [{ revid: 123, user: 'UserA', timestamp: 'ts' }]
                };
                const mockResponse = {
                    batchcomplete: true,
                    query: {
                        normalized: [{ from: 'test page', to: 'Test Page' }],
                        pages: { '1': mockPageDetails }
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
                await expect(wiki.client.revisions({})).rejects.toThrow('Missing or invalid "title" - must be a non-empty string.');
            });
        });
        describe('client.summary()', () => {
            it('should fetch summary for a page and return MediaWikiQuerySummaryResponseClass', async () => {
                const mockPageDetails = {
                    pageid: 1, ns: 0, title: 'Test Page', extract: 'This is a summary.'
                };
                const mockResponse = {
                    batchcomplete: true,
                    query: {
                        normalized: [{ from: 'test page', to: 'Test Page' }],
                        pages: { '1': mockPageDetails }
                    }
                };
                mockFetchResolved(mockResponse);
                const response = await wiki.client.summary({ title: 'test page' });
                expect(response).toBeInstanceOf(index_1.MediaWikiQuerySummaryResponseClass);
                expect(response.text()).toBe('This is a summary.');
                const calledUrl = new URL(mockFetch.mock.calls[0][0]);
                expect(calledUrl.searchParams.get('prop')).toBe('extracts');
                expect(calledUrl.searchParams.get('exintro')).toBe('true');
            });
            it('should throw if title is missing', async () => {
                await expect(wiki.client.summary({})).rejects.toThrow('Missing or invalid "title" - must be a non-empty string.');
            });
        });
        describe('client.userInfo()', () => {
            it('should fetch user info and return MediaWikiQueryUserInfoResponseClass', async () => {
                const mockUserInfo = { id: 1, name: 'TestUser' };
                const mockResponse = {
                    batchcomplete: true,
                    query: { userinfo: mockUserInfo }
                };
                mockFetchResolved(mockResponse);
                const response = await wiki.client.userInfo();
                expect(response).toBeInstanceOf(index_1.MediaWikiQueryUserInfoResponseClass);
                expect(response.getUserName()).toBe('TestUser');
                const calledUrl = new URL(mockFetch.mock.calls[0][0]);
                expect(calledUrl.searchParams.get('meta')).toBe('userinfo');
                expect(calledUrl.searchParams.get('uiprop')).toBe('*');
            });
        });
        describe('client.getToken()', () => {
            it('should fetch tokens and return MediaWikiQueryTokensResponseClass', async () => {
                const mockTokens = { csrftoken: 'testtoken123' };
                const mockResponse = {
                    batchcomplete: true,
                    query: { tokens: mockTokens }
                };
                mockFetchResolved(mockResponse);
                const response = await wiki.client.getToken({ type: ['csrf'] });
                expect(response).toBeInstanceOf(index_1.MediaWikiQueryTokensResponseClass);
                expect(response.getCsrfToken()).toBe('testtoken123');
                const calledUrl = new URL(mockFetch.mock.calls[0][0]);
                expect(calledUrl.searchParams.get('meta')).toBe('tokens');
                expect(calledUrl.searchParams.get('type')).toBe('csrf');
            });
        });
        describe('client.editPage()', () => {
            const editOptions = { title: 'EditThis', text: 'New content' };
            const csrfToken = 'samplecsrftoken';
            beforeEach(() => {
                // Mock the getToken call that editPage makes internally
                mockFetchResolved({
                    batchcomplete: true,
                    query: { tokens: { csrftoken: csrfToken } }
                });
            });
            it('should edit a page and return MediaWikiQueryEditPageResponseClass', async () => {
                // After getToken resolves, editPage makes its own fetch
                // So, we need to reset mockFetch and set up the response for the edit action
                await wiki.client.getToken({ type: ['csrf'] }); // Prime the internal token fetch
                mockFetch.mockClear(); // Clear the getToken fetch call
                const mockEditDetails = { result: 'Success', pageid: 123, title: 'EditThis', newrevid: 456 };
                const mockEditResponse = {
                    batchcomplete: true,
                    query: { edit: mockEditDetails }
                };
                mockFetchResolved(mockEditResponse);
                const response = await wiki.client.editPage(editOptions);
                expect(response).toBeInstanceOf(index_1.MediaWikiQueryEditPageResponseClass);
                expect(response.getResult()).toBe('Success');
                expect(response.getPageId()).toBe(123);
                expect(mockFetch).toHaveBeenCalledTimes(1); // Only the edit call
                const calledUrlString = mockFetch.mock.calls[0][0];
                const bodyParams = new URLSearchParams(mockFetch.mock.calls[0][1]?.body);
                expect(calledUrlString).toBe(BASE_URL_WITH_API);
                expect(bodyParams.get('action')).toBe('edit');
                expect(bodyParams.get('title')).toBe('EditThis');
                expect(bodyParams.get('text')).toBe('New content');
                expect(bodyParams.get('token')).toBe(csrfToken);
            });
            it('should throw if options missing', async () => {
                await expect(wiki.client.editPage(undefined)).rejects.toThrow('Options are required for the editpage method.');
            });
            it('should throw if title/pageid and text are missing', async () => {
                await expect(wiki.client.editPage({})).rejects.toThrow('You must provide either "page", "pageid" or "text" for the editpage method.');
            });
        });
    });
});
describe('Response Wrapper Classes', () => {
    const mockWikiInstance = new index_1.MediaWiki({ baseURL: BASE_URL_WITH_API });
    mockWikiInstance.client.editPage = jest.fn(); // Mock internal call for page.edit()
    describe('MediaWikiQueryPageResponseClass', () => {
        const pageDetails = {
            pageid: 1, ns: 0, title: 'Test Page', extract: '<p>Hello</p>',
            categories: [{ ns: 14, title: 'Category:A' }, { '*': 'Category:B' }] // Mixed type for test
        };
        const responseData = {
            batchcomplete: true,
            query: { pages: { '1': pageDetails } }
        };
        const pageResponse = new index_1.MediaWikiQueryPageResponseClass(responseData, mockWikiInstance);
        it('html() should return extract', () => {
            expect(pageResponse.html()).toBe('<p>Hello</p>');
        });
        it('html() should return empty string if no extract', () => {
            const noExtractData = {
                batchcomplete: true, query: { pages: { '1': { ...pageDetails, extract: undefined } } }
            };
            const resp = new index_1.MediaWikiQueryPageResponseClass(noExtractData, mockWikiInstance);
            expect(resp.html()).toBe('');
        });
        it('title() should return title', () => {
            expect(pageResponse.title()).toBe('Test Page');
        });
        it('title() should return empty string if no title', () => {
            const noTitleData = {
                batchcomplete: true, query: { pages: { '1': { ...pageDetails, title: undefined } } }
            };
            const resp = new index_1.MediaWikiQueryPageResponseClass(noTitleData, mockWikiInstance);
            expect(resp.title()).toBe('');
        });
        it('categories() should return category titles', () => {
            // Note: The current code in MediaWikiQueryPageResponseClass.categories() is `this.query?.pages[0]?.categories?.map((c: any) => c["*"]) ?? [];`
            // It expects `pages[0]` which might not be robust if page IDs are not sequential or if `indexpageids` is not used.
            // Assuming for this test that pageDetails is effectively pages[0] due to single page response.
            const specificResponseData = {
                batchcomplete: true,
                query: {
                    pages: {
                        // Using a specific key 'somePageId' to simulate real API if indexpageids is not used,
                        // but the current class implementation relies on Object.keys(pages)[0]
                        '1': {
                            ...pageDetails,
                            categories: [{ ns: 14, title: "Category:RealTitle", "*": "Category:StarTitle" }]
                        }
                    }
                }
            };
            const resp = new index_1.MediaWikiQueryPageResponseClass(specificResponseData, mockWikiInstance);
            expect(resp.categories()).toEqual(["Category:StarTitle"]);
        });
        it('categories() should return empty array if no categories', () => {
            const noCatData = {
                batchcomplete: true, query: { pages: { '1': { ...pageDetails, categories: undefined } } }
            };
            const resp = new index_1.MediaWikiQueryPageResponseClass(noCatData, mockWikiInstance);
            expect(resp.categories()).toEqual([]);
        });
        describe('edit() method', () => {
            const editOpts = { text: 'new content for edit', summary: 'test edit' };
            it('should call wiki.client.editPage with correct params', async () => {
                mockWikiInstance.client.editPage.mockResolvedValueOnce({}); // Mock successful edit
                await pageResponse.edit(editOpts);
                expect(mockWikiInstance.client.editPage).toHaveBeenCalledWith({
                    pageid: pageDetails.pageid, // Uses pageid from the page data
                    ...editOpts
                });
            });
            it('should use title if pageid is not available', async () => {
                const noPageIdDetails = { ...pageDetails, pageid: undefined, title: "FallbackTitle" };
                const noPageIdResponseData = {
                    batchcomplete: true,
                    query: { pages: { 'somekey': noPageIdDetails } }
                };
                const noPageIdPageResponse = new index_1.MediaWikiQueryPageResponseClass(noPageIdResponseData, mockWikiInstance);
                mockWikiInstance.client.editPage.mockResolvedValueOnce({});
                await noPageIdPageResponse.edit(editOpts);
                expect(mockWikiInstance.client.editPage).toHaveBeenCalledWith({
                    title: "FallbackTitle",
                    ...editOpts
                });
            });
            it('should throw if page details are not available', async () => {
                const noPageDetailsData = { batchcomplete: true, query: { pages: {} } }; // Empty pages
                const resp = new index_1.MediaWikiQueryPageResponseClass(noPageDetailsData, mockWikiInstance);
                await expect(resp.edit(editOpts)).rejects.toThrow("Page details not available for editing.");
            });
            it('should throw if page title or ID is missing for editing', async () => {
                const noIdentifiersData = {
                    batchcomplete: true, query: { pages: { '1': { ...pageDetails, title: undefined, pageid: undefined } } }
                };
                const resp = new index_1.MediaWikiQueryPageResponseClass(noIdentifiersData, mockWikiInstance);
                await expect(resp.edit(editOpts)).rejects.toThrow("Page title or ID is required for editing.");
            });
            it('should throw if text is not a string', async () => {
                await expect(pageResponse.edit({ text: 123 })).rejects.toThrow("Parameter 'text' is required for editing.");
            });
        });
    });
    describe('MediaWikiQueryParseResponseClass', () => {
        const parseData = {
            parse: { title: 'Parsed Page', text: 'HTML Content', pageid: 10, categories: [{ '*': 'Cat1' }] }
        };
        const parseResponse = new index_1.MediaWikiQueryParseResponseClass(parseData);
        it('text() should return parsed text', () => expect(parseResponse.text()).toBe('HTML Content'));
        it('html() should return parsed text (as per current code)', () => expect(parseResponse.html()).toBe('HTML Content'));
        it('title() should return title', () => expect(parseResponse.title()).toBe('Parsed Page'));
        it('categories() should return category star values', () => expect(parseResponse.categories()).toEqual(['Cat1']));
        it('categories() should return empty array if no categories', () => {
            const noCatData = { parse: { ...parseData.parse, categories: undefined } };
            const resp = new index_1.MediaWikiQueryParseResponseClass(noCatData);
            expect(resp.categories()).toEqual([]);
        });
    });
    describe('MediaWikiQuerySummaryResponseClass', () => {
        const summaryData = {
            batchcomplete: true,
            query: { pages: [{ pageid: 1, ns: 0, title: 'Summary Page', extract: 'This is the summary.' }] }
        };
        const summaryResponse = new index_1.MediaWikiQuerySummaryResponseClass(summaryData);
        it('text() should return extract from the first page', () => expect(summaryResponse.text()).toBe('This is the summary.'));
        it('text() should return empty string if no pages or extract', () => {
            const noExtractData = { batchcomplete: true, query: { pages: [{ ...summaryData.query.pages[0], extract: undefined }] } };
            const resp = new index_1.MediaWikiQuerySummaryResponseClass(noExtractData);
            expect(resp.text()).toBe('');
            const noPagesData = { batchcomplete: true, query: { pages: [] } };
            const resp2 = new index_1.MediaWikiQuerySummaryResponseClass(noPagesData);
            expect(resp2.text()).toBe('');
        });
    });
    describe('MediaWikiQueryUserInfoResponseClass', () => {
        const userInfo = { id: 123, name: 'TestUser', options: {} };
        const anonInfo = { id: 0, name: '1.2.3.4', anon: true, options: {} };
        const userData = { batchcomplete: true, query: { userinfo: userInfo } };
        const anonData = { batchcomplete: true, query: { userinfo: anonInfo } };
        const userResponse = new index_1.MediaWikiQueryUserInfoResponseClass(userData);
        const anonResponse = new index_1.MediaWikiQueryUserInfoResponseClass(anonData);
        it('isAnonymous() should return true for anonymous user', () => expect(anonResponse.isAnonymous()).toBe(true));
        it('isAnonymous() should return false for logged-in user (id != 0 and anon is false/undefined)', () => {
            expect(userResponse.isAnonymous()).toBe(false); // anon is undefined
            const userExplicitlyNotAnon = new index_1.MediaWikiQueryUserInfoResponseClass({
                batchcomplete: true, query: { userinfo: { ...userInfo, anon: false } }
            });
            expect(userExplicitlyNotAnon.isAnonymous()).toBe(false); // anon is false
        });
        it('getUserId() should return user ID', () => expect(userResponse.getUserId()).toBe(123));
        it('getUserName() should return user name', () => expect(userResponse.getUserName()).toBe('TestUser'));
        it('getUserInfo() should return full user info object', () => expect(userResponse.getUserInfo()).toEqual(userInfo));
        it('getUserOptions() should return user options', () => expect(userResponse.getUserOptions()).toEqual(userInfo.options));
    });
    describe('MediaWikiQueryTokensResponseClass', () => {
        const tokens = {
            csrftoken: 'csrf1', watchtoken: 'watch1', patroltoken: 'patrol1',
            rollbacktoken: 'roll1', userrightstoken: 'user1', logintoken: 'login1',
            createaccounttoken: 'create1'
        };
        const tokensData = { batchcomplete: true, query: { tokens } };
        const tokensResponse = new index_1.MediaWikiQueryTokensResponseClass(tokensData);
        it('getCsrfToken()', () => expect(tokensResponse.getCsrfToken()).toBe('csrf1'));
        it('getWatchToken()', () => expect(tokensResponse.getWatchToken()).toBe('watch1'));
        it('getPatrolToken()', () => expect(tokensResponse.getPatrolToken()).toBe('patrol1'));
        it('getRollbackToken()', () => expect(tokensResponse.getRollbackToken()).toBe('roll1'));
        it('getUserRightsToken()', () => expect(tokensResponse.getUserRightsToken()).toBe('user1'));
        it('getLoginToken()', () => expect(tokensResponse.getLoginToken()).toBe('login1'));
        it('getCreateAccountToken()', () => expect(tokensResponse.getCreateAccountToken()).toBe('create1'));
        it('getEditToken() (alias for csrf)', () => expect(tokensResponse.getEditToken()).toBe('csrf1'));
    });
    describe('MediaWikiQueryEditPageResponseClass', () => {
        const editDetails = {
            result: 'Success', pageid: 1, title: 'Edited Page', contentmodel: 'wikitext',
            oldrevid: 10, newrevid: 11, newtimestamp: '2023Z', watched: false
        };
        const editResponseData = { batchcomplete: true, query: { edit: editDetails } };
        const editResponse = new index_1.MediaWikiQueryEditPageResponseClass(editResponseData);
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
            const warnResponse = new index_1.MediaWikiQueryEditPageResponseClass(warnData);
            expect(warnResponse.hasWarnings()).toBe(true);
            expect(warnResponse.getWarnings()).toEqual({ main: { '*': 'A warning' } });
            expect(editResponse.hasWarnings()).toBe(false);
            expect(editResponse.getWarnings()).toBeUndefined();
        });
        it('hasErrors() and getErrors()', () => {
            const errorData = { ...editResponseData, errors: [{ code: 'err', info: 'An error' }] };
            const errorResponse = new index_1.MediaWikiQueryEditPageResponseClass(errorData);
            expect(errorResponse.hasErrors()).toBe(true);
            expect(errorResponse.getErrors()).toEqual([{ code: 'err', info: 'An error' }]);
            expect(editResponse.hasErrors()).toBe(false);
            expect(editResponse.getErrors()).toBeUndefined();
        });
    });
});
describe('CookieStore Class', () => {
    let store;
    const originHost = 'example.com';
    const fullUrl = 'https://example.com/path';
    beforeEach(() => {
        store = new cookie_store_1.CookieStore();
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
        const expires = new Date(Date.now() + 3600000); // 1 hour from now
        store.parseSetCookie(`baz=qux; Expires=${expires.toUTCString()}; Path=/path; Domain=.example.com; Secure; HttpOnly; SameSite=Lax`, originHost);
        const cookies = store.getCookieHeader(fullUrl); // Secure matches https
        expect(cookies.length).toBe(1);
        const c = cookies[0];
        expect(c.name).toBe('baz');
        expect(c.path).toBe('/path');
        expect(c.domain).toBe('example.com'); // Leading dot removed
        expect(c.hostOnly).toBeUndefined();
        expect(c.secure).toBe(true);
        expect(c.httpOnly).toBe(true);
        expect(c.sameSite).toBe('Lax');
        expect(c.expires?.getTime()).toBeCloseTo(expires.getTime());
    });
    it('getCookieHeader should filter by domain', () => {
        store.parseSetCookie('a=1; Domain=example.com', originHost);
        store.parseSetCookie('b=2; Domain=sub.example.com', originHost);
        store.parseSetCookie('c=3; Domain=other.com', originHost);
        expect(store.getCookieHeader('https://example.com/').map(c => c.name)).toEqual(['a']);
        expect(store.getCookieHeader('https://sub.example.com/').map(c => c.name).sort()).toEqual(['a', 'b'].sort());
        expect(store.getCookieHeader('https://another.sub.example.com/').map(c => c.name)).toEqual(['a']); // a matches due to domain=.example.com
        expect(store.getCookieHeader('https://other.com/').map(c => c.name)).toEqual(['c']);
    });
    it('getCookieHeader should filter by path', () => {
        store.parseSetCookie('p1=val; Path=/', originHost);
        store.parseSetCookie('p2=val; Path=/path', originHost);
        store.parseSetCookie('p3=val; Path=/path/deep', originHost);
        expect(store.getCookieHeader('https://example.com/').map(c => c.name)).toEqual(['p1']);
        expect(store.getCookieHeader('https://example.com/path').map(c => c.name).sort()).toEqual(['p1', 'p2'].sort());
        expect(store.getCookieHeader('https://example.com/path/deeper').map(c => c.name).sort()).toEqual(['p1', 'p2', 'p3'].sort());
        expect(store.getCookieHeader('https://example.com/other').map(c => c.name)).toEqual(['p1']);
    });
    it('getCookieHeader should filter by secure flag', () => {
        store.parseSetCookie('s1=val; Secure', originHost);
        store.parseSetCookie('s2=val', originHost); // Not secure
        expect(store.getCookieHeader('https://example.com/').map(c => c.name).sort()).toEqual(['s1', 's2'].sort());
        expect(store.getCookieHeader('http://example.com/').map(c => c.name)).toEqual(['s2']); // s1 is secure-only
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
    it('should correctly initialize with message, status, and responseText', () => {
        const error = new index_1.MediaWikiApiError('Fetch failed', 500, 'Server Error Text');
        expect(error.message).toBe('Fetch failed');
        expect(error.status).toBe(500);
        expect(error.responseText).toBe('Server Error Text');
        expect(error.name).toBe('MediaWikiApiError');
        expect(error.code).toBeUndefined();
        expect(error.info).toBeUndefined();
    });
    it('should parse code and info from responseData if error object exists', () => {
        const responseData = { error: { code: 'badtoken', info: 'Invalid token.' } };
        const error = new index_1.MediaWikiApiError('Request failed due to token', 403, JSON.stringify(responseData), responseData);
        expect(error.code).toBe('badtoken');
        expect(error.info).toBe('Invalid token.');
        expect(error.message).toBe('Request failed with status 403: Invalid token. (Code: badtoken)');
        expect(error.responseData).toEqual(responseData);
    });
    it('should refine message with code only if info is missing', () => {
        const responseData = { error: { code: 'somecode' } };
        const error = new index_1.MediaWikiApiError('Request failed', 400, JSON.stringify(responseData), responseData);
        expect(error.code).toBe('somecode');
        expect(error.info).toBeUndefined();
        expect(error.message).toBe('Request failed with status 400 (Code: somecode)');
    });
    it('should not override custom message if not starting with "Request failed"', () => {
        const responseData = { error: { code: 'custom', info: 'Custom info' } };
        const error = new index_1.MediaWikiApiError('My specific error', 400, JSON.stringify(responseData), responseData);
        expect(error.code).toBe('custom');
        expect(error.info).toBe('Custom info');
        expect(error.message).toBe('My specific error'); // Message is preserved
    });
});
