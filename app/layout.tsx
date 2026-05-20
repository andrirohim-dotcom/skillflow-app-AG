import type { Metadata } from "next";
import { Poppins, DM_Sans } from "next/font/google";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import { WorkspaceProvider } from "@/lib/contexts/WorkspaceContext";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dmsans",
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
    <html lang="id" className={`${poppins.variable} ${dmSans.variable}`}>
      <body className="font-body">
        <AuthProvider>
          <WorkspaceProvider>{children}</WorkspaceProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
