"use client";

import { useState } from "react";

export default function LoginPage() {
    const [password, setPassword] = useState("");
    const [err, setErr] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function submit() {
        setLoading(true);
        setErr(null);
        const r = await fetch("/api/auth", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ password }),
        });

        const j = await r.json().catch(() => ({}));
        setLoading(false);

        if (!r.ok) {
            setErr(j?.error || "Errore");
            return;
        }

        window.location.href = "/";
    }

    return (
        <main style={{ maxWidth: 420, margin: "10vh auto", padding: 24 }}>
            <h1>AlbumLime</h1>
            <p>Inserisci la password.</p>
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                style={{ width: "100%", padding: 12, marginTop: 12 }}
            />
            <button
                onClick={submit}
                disabled={loading || !password}
                style={{ width: "100%", padding: 12, marginTop: 12 }}
            >
                {loading ? "Accesso..." : "Entra"}
            </button>
            {err && <p style={{ marginTop: 12 }}>{err}</p>}
        </main>
    );
}
