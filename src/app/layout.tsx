import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vibe Check — AI UI Comparison Arena",
  description:
    "Compare UI outputs from different AI models side by side. Test the latest LLMs head-to-head and see which one builds the best interfaces.",
  openGraph: {
    title: "Vibe Check — AI UI Comparison Arena",
    description:
      "Compare UI outputs from different AI models side by side. Test the latest LLMs head-to-head.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vibe Check — AI UI Comparison Arena",
    description:
      "Compare UI outputs from different AI models side by side. Test the latest LLMs head-to-head.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="bg-mesh" />
        {children}
      </body>
    </html>
  );
}
