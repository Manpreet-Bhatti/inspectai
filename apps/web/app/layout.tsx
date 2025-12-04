import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InspectAI - AI-Powered Property Inspections",
  description:
    "Transform photos and voice notes into structured inspection reports with AI-identified issues, severity ratings, and cost estimates.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
