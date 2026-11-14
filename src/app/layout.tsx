import type { Metadata } from "next";
import { Itim } from "next/font/google";
import "./globals.css";

const itim = Itim({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Wall",
  description: "Greg Wientjes's wall",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${itim.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#fcf9f6] font-sans text-[#1a1a1a]">
        {children}
      </body>
    </html>
  );
}
