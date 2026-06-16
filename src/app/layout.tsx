import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";
import { getAllWork, getAllWriting } from "@/lib/content";
import { Providers } from "@/app/providers";
import type { SearchItem } from "@/components/command-palette";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
    { title: "Home", href: "/", group: "Pages" },
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
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
