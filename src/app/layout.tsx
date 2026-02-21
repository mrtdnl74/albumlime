import "@/styles/globals.css";

export const metadata = {
    title: "AlbumLime",
    description: "Il tuo album fotografico privato",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="it" suppressHydrationWarning>
            <body suppressHydrationWarning>{children}</body>
        </html>
    );
}
