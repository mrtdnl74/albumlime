import { NextResponse } from "next/server";
import { listFilesInFolder } from "@/lib/drive";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST() {
    try {
        const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
        if (!folderId) {
            return NextResponse.json({ ok: false, error: "GOOGLE_DRIVE_FOLDER_ID mancante" }, { status: 500 });
        }

        const files = await listFilesInFolder(folderId);
        const sb = supabaseAdmin();

        // Per ogni file, facciamo un upsert su Supabase
        let synced = 0;
        for (const file of files) {
            if (!file.id || !file.name) continue;

            const photoData = {
                drive_file_id: file.id,
                filename: file.name,
                mime_type: file.mimeType || "image/jpeg",
                drive_modified_time: file.modifiedTime,
                thumb_url: file.thumbnailLink,
                web_url: file.webContentLink,
                // Le foto caricate a mano andranno tutte in "Tutte le foto" per impostazione predefinita
            };

            const { error } = await sb
                .from("photos")
                .upsert(photoData, { onConflict: "drive_file_id" });

            if (!error) synced++;
        }

        return NextResponse.json({ ok: true, message: `Sincronizzate ${synced} foto su ${files.length} trovate su Drive.` });
    } catch (e: any) {
        console.error("Errore sync:", e);
        return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
    }
}
