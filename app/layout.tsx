import { Metadata } from 'next'
import './globals.css'
import { AmplifyProvider } from '@/src/components/AmplifyProvider'

export const metadata: Metadata = {
  title: 'Philosophy Quiz',
  description: 'A multiplayer philosophy quiz game',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AmplifyProvider>
          {children}
        </AmplifyProvider>
      </body>
    </html>
  )
}
