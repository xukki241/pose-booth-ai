import type { Metadata } from "next";
import Script from "next/script";
import { Geist_Mono, Nunito } from "next/font/google";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
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

const themeBootstrap = `(() => {
  try {
    const raw = localStorage.getItem('pose-booth-theme');
    const saved = raw ? JSON.parse(raw)?.state?.theme : 'system';
    const theme = ['light', 'dark', 'system'].includes(saved) ? saved : 'system';
    const resolved = theme === 'system'
      ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme;
    document.documentElement.classList.toggle('dark', resolved === 'dark');
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = resolved;
  } catch {}
})();`;

export const metadata: Metadata = {
  title: "Pose-Booth AI — AI Pose Detection Studio",
  description: "Real-time AI pose guidance with glassmorphism photobooth. EXE101 · FPT University 2026.",
  keywords: ["pose detection", "AI photobooth", "YOLOv8", "MediaPipe", "pose analysis"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning className={`${nunito.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased">
        <Script id="theme-bootstrap" strategy="beforeInteractive">
          {themeBootstrap}
        </Script>
        <ThemeProvider>
          {children}
          <ThemeToggle />
        </ThemeProvider>
      </body>
    </html>
  );
}
