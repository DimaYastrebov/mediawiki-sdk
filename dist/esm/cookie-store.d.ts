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
