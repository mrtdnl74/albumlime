import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
    try {
        const sb = supabaseAdmin();
        const { data, error } = await sb
            .from("photos")
            .select("id,drive_file_id,section_id,filename,mime_type,thumb_url,web_url,created_at")
            .order("created_at", { ascending: false })
            .limit(200);

        if (error) throw error;
        return NextResponse.json({ ok: true, photos: data || [] });
    } catch (e: any) {
        return NextResponse.json({ ok: false, error: e?.message || "Errore" }, { status: 500 });
    }
}
