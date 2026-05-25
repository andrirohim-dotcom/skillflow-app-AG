import type { Metadata } from "next";
import { Outfit, Inter, JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import { WorkspaceProvider } from "@/lib/contexts/WorkspaceContext";
import { CelebrationProvider } from "@/context/CelebrationContext";
import { XPToastProvider } from "@/components/gamification/XPToast";
import CelebrationModal from "@/components/gamification/CelebrationModal";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-outfit",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "SkillFlow",
  description: "Ubah Pengetahuan Jadi Keahlian",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${outfit.variable} ${inter.variable} ${jetbrainsMono.variable} dark`}>
      <body className="font-body antialiased">
        <AuthProvider>
          <WorkspaceProvider>
            <CelebrationProvider>
              <XPToastProvider>
                {children}
                <CelebrationModal />
              </XPToastProvider>
            </CelebrationProvider>
          </WorkspaceProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
