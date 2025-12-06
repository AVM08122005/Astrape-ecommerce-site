import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Astrape E-commerce",
  description: "Shop for clothing, electronics, accessories and more",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  icons: {
    icon: [{ url: "/tshirt.jpg", type: "image/jpeg" }],
  },
  openGraph: {
    title: "Astrape E-commerce",
    description: "Shop for clothing, electronics, accessories and more",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://example.com",
    siteName: "Astrape",
    images: [{ url: "/tshirt.jpg", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Astrape E-commerce",
    description: "Shop for clothing, electronics, accessories and more",
    images: ["/tshirt.jpg"],
    creator: "@astrape"
  },
};

export const viewport = {
  themeColor: "#0a0a0a",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar />
        <div className="container mx-auto px-4 min-h-[65vh]">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
