import "./globals.css";
import localFont from "next/font/local";

const dmSans = localFont({
  src: [
    { path: "./fonts/dm-sans-400.ttf", weight: "400" },
    { path: "./fonts/dm-sans-500.ttf", weight: "500" },
    { path: "./fonts/dm-sans-600.ttf", weight: "600" },
    { path: "./fonts/dm-sans-700.ttf", weight: "700" },
  ],
  variable: "--font-dm-sans",
  display: "swap",
});

const dmSerifDisplay = localFont({
  src: [
    { path: "./fonts/dm-serif-display-regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/dm-serif-display-italic.ttf", weight: "400", style: "italic" },
  ],
  variable: "--font-dm-serif-display",
  display: "swap",
});

export const metadata = {
  title: "OrderPilot Platform | Restaurants entdecken",
  description: "Entdecke Restaurants, stöbere durch ihre Menüs und bestelle direkt.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "OrderPilot",
  },
  icons: {
    icon: "/orderpilot-icon.svg",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#19854b",
};

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body className={`${dmSans.variable} ${dmSerifDisplay.variable}`}>{children}</body>
    </html>
  );
}
