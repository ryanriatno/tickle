import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { GoogleTag } from "@/components/google-tag"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Tickle - Pomodoro Timer with Task Management",
  description: "A Pomodoro timer app with task management features",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <GoogleTag />
      </head>
      <body className={inter.className}>
        <ThemeProvider 
          attribute="class" 
          defaultTheme="system" 
          enableSystem 
          disableTransitionOnChange
          storageKey="tickle-theme"
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
