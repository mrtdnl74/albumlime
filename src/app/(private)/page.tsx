import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { Photo, Section } from "@/lib/types";
import SyncButton from "@/components/SyncButton";

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

export default async function HomePage() {
    const { photos, sections } = await getData();

    return (
        <main>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <h3 style={{ margin: 0 }}>Galleria</h3>
                    <SyncButton />
                </div>
                <span style={{ fontSize: "0.9rem", color: "#666" }}>{photos.length} foto</span>
            </div>

            {sections.length > 0 && (
                <div style={{ display: "flex", gap: 8, marginBottom: 24, overflowX: "auto", paddingBottom: 8 }}>
                    <button style={{ padding: "6px 16px", background: "#333", color: "white", borderRadius: 20 }}>Tutte</button>
                    {sections.map((s: Section) => (
                        <button key={s.id} style={{
                            padding: "6px 16px",
                            background: "#eee",
                            color: "#333",
                            borderRadius: 20,
                            whiteSpace: "nowrap"
                        }}>
                            {s.name}
                        </button>
                    ))}
                </div>
            )}

            {photos.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px 0", border: "1px dashed #ccc", borderRadius: 8 }}>
                    <p>Nessuna foto ancora caricata.</p>
                    <p style={{ fontSize: "0.8rem", color: "#888" }}>Invia una foto al bot di Telegram per vederla qui.</p>
                </div>
            ) : (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                    gap: 16
                }}>
                    {photos.map((p) => {
                        const isVideo = p.mime_type?.startsWith("video/");
                        return (
                            <a key={p.id} href={p.web_url || "#"} target="_blank" rel="noopener noreferrer" style={{
                                borderRadius: 8,
                                overflow: "hidden",
                                background: "#eee",
                                aspectRatio: "1/1",
                                position: "relative",
                                display: "block",
                                cursor: "pointer"
                            }}>
                                {p.thumb_url ? (
                                    <img
                                        src={p.thumb_url.replace("=s220", "=s600")}
                                        alt={p.filename}
                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    />
                                ) : (
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                                        <span style={{ fontSize: "0.8rem", textAlign: "center", padding: "8px" }}>{p.filename}</span>
                                    </div>
                                )}

                                {isVideo && (
                                    <div style={{
                                        position: "absolute",
                                        top: "50%",
                                        left: "50%",
                                        transform: "translate(-50%, -50%)",
                                        background: "rgba(0,0,0,0.6)",
                                        borderRadius: "50%",
                                        width: 48,
                                        height: 48,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "white",
                                        fontSize: "24px"
                                    }}>
                                        ▶
                                    </div>
                                )}

                                <div style={{
                                    position: "absolute",
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    padding: "8px",
                                    background: "rgba(0,0,0,0.4)",
                                    color: "white",
                                    fontSize: "0.7rem",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    backdropFilter: "blur(4px)"
                                }}>
                                    {p.filename}
                                </div>
                            </a>
                        )
                    })}
                </div>
            )}
        </main>
    );
}
