import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { Photo, Section } from "@/lib/types";
import GalleryClient from "@/components/GalleryClient";

async function getData(): Promise<{ photos: Photo[], sections: Section[] }> {
    try {
        const sb = supabaseAdmin();
        const [pRes, sRes] = await Promise.all([
            sb.from("photos")
                .select("id,drive_file_id,section_id,filename,mime_type,thumb_url,web_url,created_at")
                .order("created_at", { ascending: false })
                .limit(200),
            sb.from("sections")
                .select("id,name,sort_order")
                .order("sort_order", { ascending: true })
        ]);

        const photos = pRes.data || [];
        const sections = sRes.data || [];

        return { photos, sections };
    } catch (e) {
        console.error("Fetch data error:", e);
        return { photos: [], sections: [] };
    }
}

export const dynamic = "force-dynamic";

export default async function HomePage() {
    const { photos, sections } = await getData();

    return (
        <main>
            <GalleryClient photos={photos} sections={sections} />
        </main>
    );
}
