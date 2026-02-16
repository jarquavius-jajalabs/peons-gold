import type { Metadata } from 'next'
import './globals.css'
import { SoundProvider } from '@/lib/sound-context'
import { ToastProvider } from '@/lib/toast-context'
import ClientProviders from './client-providers'

export const metadata: Metadata = {
  title: "Peon's Gold",
  description: 'Work complete! Mine gold like a true peon.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClientProviders>
          <SoundProvider>
            <ToastProvider>
              <div className="animate-fade-in">
                {children}
              </div>
            </ToastProvider>
          </SoundProvider>
        </ClientProviders>
      </body>
    </html>
  )
}
