"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SyncButton() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSync = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/sync", { method: "POST" });
            const data = await res.json();
            if (data.ok) {
                alert(data.message);
                router.refresh(); // Ricarica la pagina per mostrare le nuove foto
            } else {
                alert("Errore: " + data.error);
            }
        } catch (e: any) {
            alert("Errore di rete: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleSync}
            disabled={loading}
            style={{
                padding: "8px 16px",
                background: loading ? "#ccc" : "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: 20,
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: "bold",
                fontSize: "0.9rem"
            }}
        >
            {loading ? "Sincronizzazione..." : "🔄 Sincronizza da Drive"}
        </button>
    );
}
