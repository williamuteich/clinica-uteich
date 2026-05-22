import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Uteich Odontologia | Clínica Odontológica em Cachoeirinha - RS",
  description: "Clínica odontológica em Cachoeirinha com atendimento 24h. Especialidades: implantes, ortodontia, clareamento dental e muito mais. Dr. Lenon Uteich - CRO 32301. Agende sua avaliação gratuita!",
  keywords: "dentista cachoeirinha, clínica odontológica 24h, implante dentário, ortodontia, clareamento dental, emergência dentista, Dr Lenon Uteich",
  authors: [{ name: "Uteich Odontologia" }],
  robots: "index, follow",
  verification: {
    google: "UBvpEWAYNvtwjhEJ_IFvO-1Kj_FxolKE9eTnXFILqkU",
  },
  alternates: {
    canonical: "https://uteichodontologia.com.br",
  },
  openGraph: {
    title: "Uteich Odontologia | Clínica Odontológica em Cachoeirinha - RS",
    description: "Clínica odontológica em Cachoeirinha com atendimento 24h. Implantes, ortodontia, clareamento dental e mais. Agende sua avaliação gratuita!",
    type: "website",
    url: "https://uteichodontologia.com.br",
    images: [
      {
        url: "https://uteichodontologia.com.br/og-image.png?v=2",
      },
    ],
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Uteich Odontologia | Clínica Odontológica em Cachoeirinha - RS",
    description: "Clínica odontológica em Cachoeirinha com atendimento 24h. Agende sua avaliação gratuita!",
    images: ["https://uteichodontologia.com.br/og-image.png?v=2"],
  },
  icons: {
    icon: "/logoHeader.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-br"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PWMT557M"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}

        {/* Google Tag Manager */}
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-PWMT557M');
            `,
          }}
        />
        {/* End Google Tag Manager */}

        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
