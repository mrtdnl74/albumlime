import { NextResponse } from "next/server";
import { Telegraf } from "telegraf";
import { uploadToDrive } from "@/lib/drive";
import { ingestPhoto } from "@/lib/ingest";
import { Readable } from "stream";

// Inizializziamo il bot (senza polling, lo usiamo solo per gestire l'update)
const token = process.env.TELEGRAM_BOT_TOKEN || "";
const bot = new Telegraf(token);

export async function POST(req: Request) {
    try {
        const secretInput = req.headers.get("x-telegram-bot-api-secret-token");
        const secretExpected = process.env.TELEGRAM_WEBHOOK_SECRET;

        if (secretExpected && secretInput !== secretExpected) {
            return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();

        // Gestiamo manualmente l'aggiornamento per semplicità in Next.js
        const message = body.message;
        if (!message) return NextResponse.json({ ok: true });

        // Cerchiamo una foto o un documento (immagine/video)
        const photo = message.photo?.pop(); // Prende la versione più grande
        const document = message.document?.mime_type?.startsWith("image/") || message.document?.mime_type?.startsWith("video/") ? message.document : null;
        const video = message.video;

        const fileId = photo?.file_id || document?.file_id || video?.file_id;
        if (!fileId) return NextResponse.json({ ok: true });

        // Otteniamo il link del file da Telegram
        const fileLink = await bot.telegram.getFileLink(fileId);

        // Scarichiamo il file
        const fileResponse = await fetch(fileLink.toString());
        const arrayBuffer = await fileResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const stream = Readable.from(buffer);

        // Carichiamo su Google Drive
        const driveFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
        const filename = document?.file_name || video?.file_name || `media_${Date.now()}.${video ? 'mp4' : 'jpg'}`;
        const mimeType = document?.mime_type || video?.mime_type || (video ? "video/mp4" : "image/jpeg");

        const driveFile = await uploadToDrive(stream, filename, mimeType, driveFolderId);

        // Ingestione su Supabase
        await ingestPhoto(driveFile.id!);

        return NextResponse.json({ ok: true });
    } catch (err: any) {
        console.error("Webhook error:", err);
        return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
    }
}
