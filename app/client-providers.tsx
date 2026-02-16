'use client'
import dynamic from 'next/dynamic'
import { type ReactNode } from 'react'

const WalletContextProvider = dynamic(
  () => import('@/lib/wallet-provider'),
  { ssr: false }
)

export default function ClientProviders({ children }: { children: ReactNode }) {
  return <WalletContextProvider>{children}</WalletContextProvider>
}
