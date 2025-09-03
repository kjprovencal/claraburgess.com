import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "../contexts/AuthContext";
import Navigation from "../components/Navigation";
import PageTransition from "../components/PageTransition";
import "./globals.css";

const tgnd = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Clara's Baby Registry",
  description: "Welcome to Clara&apos;s world! Baby registry and photo gallery.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${tgnd.className} antialiased`}>
        <AuthProvider>
          <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Navigation />
              <PageTransition>
                <div className="w-full max-w-6xl mx-auto">
                  {children}
                </div>
              </PageTransition>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
