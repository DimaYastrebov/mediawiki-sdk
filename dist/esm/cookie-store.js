export class CookieStore {
    constructor() {
        this.store = [];
    }
    parseSetCookie(setCookieHeader, originHost) {
        const parts = setCookieHeader.split(";").map(p => p.trim());
        const [name, value] = parts[0].split("=");
        const cookie = {
            name,
            value,
            domain: "",
            path: "/",
            creationTime: new Date(),
        };
        for (const attr of parts.slice(1)) {
            const [k, v] = attr.includes("=") ? attr.split("=") : [attr, ""];
            const key = k.toLowerCase();
            switch (key) {
                case "expires":
                    const date = new Date(v);
                    if (!isNaN(date.getTime()))
                        cookie.expires = date;
                    break;
                case "path":
                    cookie.path = v;
                    break;
                case "domain":
                    cookie.domain = v.startsWith(".") ? v.slice(1) : v;
                    break;
                case "secure":
                    cookie.secure = true;
                    break;
                case "httponly":
                    cookie.httpOnly = true;
                    break;
                case "samesite":
                    cookie.sameSite = v;
                    break;
            }
        }
        if (!cookie.domain) {
            cookie.domain = originHost;
            cookie.hostOnly = true;
        }
        this.storeCookie(cookie);
    }
    storeCookie(cookie) {
        this.store = this.store.filter(c => !(c.name === cookie.name &&
            c.domain === cookie.domain &&
            c.path === cookie.path));
        this.store.push(cookie);
    }
    getCookieHeader(url) {
        const u = new URL(url);
        const now = new Date();
        const validCookies = this.store.filter(cookie => {
            if (cookie.expires && cookie.expires < now)
                return false;
            if (cookie.secure && u.protocol !== "https:")
                return false;
            const domainMatch = cookie.hostOnly
                ? u.hostname === cookie.domain
                : u.hostname === cookie.domain || u.hostname.endsWith("." + cookie.domain);
            const pathMatch = u.pathname.startsWith(cookie.path);
            return domainMatch && pathMatch;
        });
        return validCookies;
    }
}
