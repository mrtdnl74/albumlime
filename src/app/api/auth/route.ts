import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, makeAuthCookie } from "@/lib/auth";

export async function POST(req: Request) {
    const { password } = await req.json().catch(() => ({ password: "" }));

    const expected = process.env.ALBUM_PASSWORD || "";
    const secret = process.env.ALBUM_SECRET || "";

    if (!expected || !secret) {
        return NextResponse.json({ ok: false, error: "Server non configurato" }, { status: 500 });
    }

    if (password !== expected) {
        return NextResponse.json({ ok: false, error: "Password errata" }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set(AUTH_COOKIE_NAME, await makeAuthCookie(secret), {
        httpOnly: true,
        sameSite: "lax",
        secure: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 giorni
    });
    return res;
}
