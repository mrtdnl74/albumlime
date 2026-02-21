import { NextResponse } from "next/server";
import { uploadToDrive } from "@/lib/drive";
import { ingestPhoto } from "@/lib/ingest";
import { Readable } from "stream";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function sendMessage(chatId: number, text: string) {
    await fetch(`${TELEGRAM_API}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text }),
    });
}

async function getFileLink(fileId: string): Promise<string> {
    const res = await fetch(`${TELEGRAM_API}/getFile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_id: fileId }),
    });
    const data = await res.json();
    const filePath = data.result.file_path;
    return `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;
}

export async function POST(req: Request) {
    try {
        const secretInput = req.headers.get("x-telegram-bot-api-secret-token");
        const secretExpected = process.env.TELEGRAM_WEBHOOK_SECRET;

        if (secretExpected && secretInput !== secretExpected) {
            return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const message = body.message;
        if (!message) return NextResponse.json({ ok: true });

        const chatId = message.chat?.id;

        // Comando /start
        if (message.text === "/start") {
            if (chatId) {
                await sendMessage(chatId, "Benvenuto! 👋\nInviami foto e video e li salverò automaticamente nell'AlbumLime! 🍋📸");
            }
            return NextResponse.json({ ok: true });
        }

        // Cerchiamo una foto o un documento (immagine/video)
        const photo = message.photo?.pop();
        const document = (message.document?.mime_type?.startsWith("image/") || message.document?.mime_type?.startsWith("video/")) ? message.document : null;
        const video = message.video;

        const fileId = photo?.file_id || document?.file_id || video?.file_id;
        if (!fileId) {
            if (chatId && message.text !== "/start") {
                await sendMessage(chatId, "❌ Formato non supportato. Inviami solo foto o video.");
            }
            return NextResponse.json({ ok: true });
        }

        // Otteniamo il link del file da Telegram
        const fileUrl = await getFileLink(fileId);

        // Scarichiamo il file
        const fileResponse = await fetch(fileUrl);
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

        if (chatId) {
            await sendMessage(chatId, `✅ ${video ? 'Video' : 'Foto'} salvato nell'Album! 🍋`);
        }

        return NextResponse.json({ ok: true });
    } catch (err: any) {
        console.error("Webhook error:", err);
        return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
    }
}
