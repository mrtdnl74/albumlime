import { supabaseAdmin } from "./supabaseAdmin";
import { getFileMetadata } from "./drive";

export async function ingestPhoto(driveFileId: string, sectionId?: string) {
    try {
        const meta = await getFileMetadata(driveFileId);
        const sb = supabaseAdmin();

        const photoData = {
            drive_file_id: meta.id,
            filename: meta.name,
            mime_type: meta.mimeType,
            drive_modified_time: meta.modifiedTime,
            thumb_url: meta.thumbnailLink,
            web_url: meta.webContentLink,
            section_id: sectionId || null,
        };

        const { data, error } = await sb
            .from("photos")
            .upsert(photoData, { onConflict: "drive_file_id" })
            .select()
            .single();

        if (error) throw error;

        // Log event
        await sb.from("events").insert({
            type: "ingest",
            status: "ok",
            payload: { drive_file_id: driveFileId, photo_id: data.id }
        });

        return data;
    } catch (err: any) {
        console.error("Ingestion error:", err);
        const sb = supabaseAdmin();
        await sb.from("events").insert({
            type: "ingest",
            status: "error",
            payload: { drive_file_id: driveFileId },
            error: err.message
        });
        throw err;
    }
}
