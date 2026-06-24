import type { Metadata } from "next";
import { Fraunces, Spectral, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";
import { getAllWork, getAllWriting } from "@/lib/content";
import { Providers } from "@/app/providers";
import type { SearchItem } from "@/components/command-palette";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

/* Athanor type core: Fraunces (display, incised — opsz/SOFT/WONK axes),
   Spectral (body & long-form serif), JetBrains Mono (the readout voice). */
const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
  variable: "--font-fraunces",
  display: "swap",
});

const spectral = Spectral({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-spectral",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s · ${site.name}` },
  description: site.description,
  openGraph: {
    title: site.name,
    description: site.description,
    url: site.url,
    siteName: site.name,
    type: "website",
  },
  alternates: { types: { "application/rss+xml": "/feed.xml" } },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const searchItems: SearchItem[] = [
    ...site.nav.map((n) => ({ title: n.title, href: n.href, group: "Pages" })),
    ...getAllWork().map((d) => ({
      title: d.frontmatter.title,
      href: `/work/${d.slug}`,
      group: "Work",
      description: d.frontmatter.summary,
    })),
    ...getAllWriting().map((d) => ({
      title: d.frontmatter.title,
      href: `/writing/${d.slug}`,
      group: "Writing",
      description: d.frontmatter.description,
    })),
  ];

  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${fraunces.variable} ${spectral.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Providers searchItems={searchItems}>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
