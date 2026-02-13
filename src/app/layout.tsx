import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "PosterDakwah — AI Islamic Poster & Content Generator",
  description:
    "Buat poster kajian, dakwah, dan konten jualan profesional dengan kekuatan AI. Generate poster berkualitas dalam hitungan detik.",
  keywords: [
    "poster dakwah",
    "poster kajian",
    "AI image generator",
    "poster islam",
    "desain poster",
    "konten jualan",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#1D2940",
              color: "#E2E8F0",
              border: "1px solid #243149",
              borderRadius: "12px",
              fontSize: "14px",
            },
            success: {
              iconTheme: { primary: "#22C55E", secondary: "#fff" },
            },
            error: {
              iconTheme: { primary: "#EF4444", secondary: "#fff" },
            },
          }}
        />
      </body>
    </html>
  );
}
