"use client";

import { Photo, Section } from "@/lib/types";
import { useState } from "react";
import SyncButton from "@/components/SyncButton";

export default function GalleryClient({ photos, sections }: { photos: Photo[], sections: Section[] }) {
    const [activeSection, setActiveSection] = useState<string | null>(null);

    const filtered = activeSection
        ? photos.filter(p => p.section_id === activeSection)
        : photos;

    return (
        <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <h3 style={{ margin: 0 }}>Galleria</h3>
                    <SyncButton />
                </div>
                <span style={{ fontSize: "0.9rem", color: "#666" }}>{filtered.length} foto</span>
            </div>

            {sections.length > 0 && (
                <div style={{ display: "flex", gap: 8, marginBottom: 24, overflowX: "auto", paddingBottom: 8 }}>
                    <button
                        onClick={() => setActiveSection(null)}
                        style={{
                            padding: "6px 16px",
                            background: activeSection === null ? "#333" : "#eee",
                            color: activeSection === null ? "white" : "#333",
                            borderRadius: 20,
                            border: "none",
                            cursor: "pointer",
                            fontWeight: activeSection === null ? "bold" : "normal",
                        }}
                    >
                        Tutte
                    </button>
                    {sections.map((s: Section) => (
                        <button
                            key={s.id}
                            onClick={() => setActiveSection(s.id)}
                            style={{
                                padding: "6px 16px",
                                background: activeSection === s.id ? "#333" : "#eee",
                                color: activeSection === s.id ? "white" : "#333",
                                borderRadius: 20,
                                whiteSpace: "nowrap",
                                border: "none",
                                cursor: "pointer",
                                fontWeight: activeSection === s.id ? "bold" : "normal",
                            }}
                        >
                            {s.name}
                        </button>
                    ))}
                </div>
            )}

            {filtered.length === 0 ? (
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
                    {filtered.map((p) => {
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
                                <img
                                    src={`/api/image?id=${p.drive_file_id}`}
                                    alt={p.filename}
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    onError={(e) => {
                                        const el = e.target as HTMLImageElement;
                                        el.style.display = "none";
                                    }}
                                />

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
        </>
    );
}
