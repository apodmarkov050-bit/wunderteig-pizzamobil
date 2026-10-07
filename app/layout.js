import "./globals.css";

export const metadata = {
  title: "Wunderteig | Pizzamobil",
  description: "Pizza aus dem mobilen Holzofen – frisch, direkt und unkompliziert.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}