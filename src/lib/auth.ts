const COOKIE_NAME = "album_auth";

async function hmac(value: string, secret: string) {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const data = encoder.encode(value);

    const key = await crypto.subtle.importKey(
        "raw",
        keyData,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );

    const signature = await crypto.subtle.sign("HMAC", key, data);
    return Array.from(new Uint8Array(signature))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

export async function makeAuthCookie(secret: string) {
    const payload = "1";
    const sig = await hmac(payload, secret);
    return `${payload}.${sig}`;
}

export async function verifyAuthCookie(cookieValue: string | undefined, secret: string) {
    if (!cookieValue) return false;
    const [payload, sig] = cookieValue.split(".");
    if (payload !== "1" || !sig) return false;
    const expectedSig = await hmac(payload, secret);
    return expectedSig === sig;
}

export const AUTH_COOKIE_NAME = COOKIE_NAME;
