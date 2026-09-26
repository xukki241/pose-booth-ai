import type { Metadata } from "next";
import { Geist_Mono, Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});


export const metadata: Metadata = {
  title: "Pose-Booth AI — AI Pose Detection Studio",
  description: "Chụp ảnh, thử bộ lọc và ghép dải photobooth từ camera hoặc ảnh có sẵn.",
  keywords: ["pose detection", "AI photobooth", "YOLOv8", "MediaPipe", "pose analysis"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" data-theme="light" style={{ colorScheme: "light" }} className={`${nunito.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
