export default function PrivateLayout({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
            <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <h2 style={{ margin: 0 }}>AlbumLime</h2>
                <small>Privato</small>
            </header>
            <hr style={{ margin: "16px 0" }} />
            {children}
        </div>
    );
}
