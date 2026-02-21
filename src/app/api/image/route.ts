import { NextResponse } from "next/server";
import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/drive"];

function getAuth() {
    const jsonStr = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if (!jsonStr) {
        throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON non configurato");
    }
    const credentials = JSON.parse(jsonStr);
    return new google.auth.JWT({
        email: credentials.client_email,
        key: credentials.private_key.replace(/\\n/g, "\n"),
        scopes: SCOPES
    });
}

const drive = google.drive({ version: "v3", auth: getAuth() });

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const fileId = searchParams.get("id");

        if (!fileId) {
            return new NextResponse("Manca l'ID del file", { status: 400 });
        }

        const response = await drive.files.get(
            { fileId, alt: "media" },
            { responseType: "stream" }
        );

        const mimeType = response.headers["content-type"];
        const stream = response.data;

        return new NextResponse(stream as any, {
            headers: {
                "Content-Type": mimeType,
                "Cache-Control": "public, max-age=86400, immutable", // Cache 24h
            },
        });
    } catch (e: any) {
        console.error("Image proxy error:", e.message);
        return new NextResponse("Errore caricamento immagine", { status: 500 });
    }
}
