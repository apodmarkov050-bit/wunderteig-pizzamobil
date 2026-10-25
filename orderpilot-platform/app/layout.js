import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}
