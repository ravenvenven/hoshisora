// src/app/layout.tsx
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        {/* BERSIH: Hanya children saja, tidak ada Header atau BottomNav */}
        {children}
      </body>
    </html>
  );
}