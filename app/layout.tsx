import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NavBar } from "./components/NavBar";
import { flattenStandings, getWorldCupStandings } from "./lib/worldCup";
import { AppProvider } from "./contexts/worldCupContext";
import { RequirePlayer } from "./components/RequirePlayer";
import { AppShell } from "./components/AppShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "World Cup Fantasy",
  description: "Fantasy App For 2026 World Cup",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const data = await getWorldCupStandings();

  const standings = flattenStandings(data);
  
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AppProvider standings={standings}>
          <AppShell>
            <RequirePlayer>{children}</RequirePlayer>
          </AppShell>
        </AppProvider>
      </body>
    </html>
  );
}
