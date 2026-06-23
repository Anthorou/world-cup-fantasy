import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { flattenStandings, getWorldCupStandings } from "./lib/worldCup";
import { AppProvider } from "./contexts/worldCupContext";
import { RequirePlayer } from "./components/RequirePlayer";
import { AppShell } from "./components/AppShell";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
	title: "World Cup Fantasy",
	description: "Fantasy World Cup pool tracker",
	appleWebApp: {
		capable: true,
		title: "World Cup Fantasy",
		statusBarStyle: "black-translucent",
	},
	icons: {
		apple: "/apple-touch-icon.png",
	},
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data, fetchedAt } = await getWorldCupStandings();

  const standings = flattenStandings(data);
  
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AppProvider standings={standings} lastRefreshed={fetchedAt}>
          <AppShell>
            <RequirePlayer>{children}</RequirePlayer>
          </AppShell>
        </AppProvider>

        <Analytics />
      </body>
    </html>
  );
}
