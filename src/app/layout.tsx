import type { Metadata } from "next";
import Script from "next/script";
import { Playfair_Display, Plus_Jakarta_Sans, Caveat } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { CustomerAuthProvider } from "@/context/CustomerAuthContext";

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const sans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const caveat = Caveat({
  variable: "--font-script",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://nishya.luxury"),
  title: "Nishya — Luxe Handbags & Purses",
  description: "Discover timeless handbags crafted for modern elegance. Haute Maroquinerie in Florentine calfskin.",
  keywords: [
    "luxury handbags",
    "leather purse",
    "designer clutches",
    "Nishya",
    "tote bags",
    "haute maroquinerie",
  ],
  openGraph: {
    title: "Nishya — Luxe Handbags & Purses",
    description: "Discover timeless handbags crafted for modern elegance.",
    type: "website",
    locale: "en_IN",
    siteName: "Nishya",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${playfair.variable} ${sans.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans bg-[#E5B25D] text-luxury-charcoal selection:bg-luxury-charcoal selection:text-white">
        {/* Microsoft Clarity Analytics */}
        <Script
          id="microsoft-clarity"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "yo2ytculno");
            `,
          }}
        />
        <CustomerAuthProvider>
          <CartProvider>{children}</CartProvider>
        </CustomerAuthProvider>
      </body>
    </html>
  );
}
