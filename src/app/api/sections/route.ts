import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
    try {
        const sb = supabaseAdmin();
        const { data, error } = await sb
            .from("sections")
            .select("id,name,sort_order")
            .order("sort_order", { ascending: true });

        if (error) throw error;
        return NextResponse.json({ ok: true, sections: data || [] });
    } catch (e: any) {
        return NextResponse.json({ ok: false, error: e?.message || "Errore" }, { status: 500 });
    }
}
