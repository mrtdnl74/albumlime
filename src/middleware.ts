import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, verifyAuthCookie } from "./lib/auth";

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Consenti sempre login + asset
    if (
        pathname.startsWith("/login") ||
        pathname.startsWith("/api/auth") ||
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon")
    ) {
        return NextResponse.next();
    }

    const secret = process.env.ALBUM_SECRET || "";
    const cookie = req.cookies.get(AUTH_COOKIE_NAME)?.value;
    const ok = secret && (await verifyAuthCookie(cookie, secret));

    if (!ok) {
        const url = req.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api/telegram/webhook).*)"], // il webhook lo lasciamo libero (poi lo proteggiamo con secret header)
};
