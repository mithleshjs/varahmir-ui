import { Geist_Mono, Inter, Geist } from "next/font/google"
import type { Metadata } from "next"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Kundali Generator — Vedic Birth Chart",
  description: "Generate a detailed Vedic birth chart with divisional charts, dashas, and ashtakvarga from birth details.",
}

const interHeading = Inter({subsets:['latin'],variable:'--font-heading'});

const inter = Inter({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", inter.variable, interHeading.variable)}
    >
      <body>
        <ThemeProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{ unstyled: true, classNames: { toast: "w-full" } }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
