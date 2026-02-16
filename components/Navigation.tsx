'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useSolBalance } from '@/lib/use-solana'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Mines', icon: '⚒️' },
  { href: '/packs', label: 'Packs', icon: '📦' },
  { href: '/roster', label: 'Roster', icon: '👥' },
  { href: '/economy', label: 'Economy', icon: '📊' },
  { href: '/leaderboard', label: 'Ranks', icon: '🏆' },
]

export default function Navigation() {
  const pathname = usePathname()
  const { publicKey, disconnect } = useWallet()
  const { setVisible } = useWalletModal()
  const { balance } = useSolBalance()

  const truncated = publicKey ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}` : null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#1a0f0a]/95 backdrop-blur border-t-2 border-amber-900/50 md:top-0 md:bottom-auto md:border-t-0 md:border-b-2">
      <div className="max-w-5xl mx-auto flex items-center justify-around md:justify-center md:gap-1 px-2 py-1">
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center px-3 py-1.5 text-xs transition-all rounded gap-0.5 ${
                active
                  ? 'text-amber-300 bg-amber-900/30 gold-glow'
                  : 'text-amber-100/60 hover:text-amber-200 hover:bg-amber-900/20'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span className="text-[10px] md:text-xs">{item.label}</span>
            </Link>
          )
        })}
        {/* Wallet button */}
        {publicKey ? (
          <button
            onClick={() => disconnect()}
            className="flex flex-col items-center px-3 py-1.5 text-xs transition-all rounded gap-0.5 text-amber-100/60 hover:text-amber-200 hover:bg-amber-900/20"
          >
            <span className="text-base">👛</span>
            <span className="text-[10px] md:text-xs">{truncated}</span>
            {balance !== null && <span className="text-[9px] text-gold">{balance.toFixed(2)} SOL</span>}
          </button>
        ) : (
          <button
            onClick={() => setVisible(true)}
            className="flex flex-col items-center px-3 py-1.5 text-xs transition-all rounded gap-0.5 text-amber-400 hover:text-amber-200 hover:bg-amber-900/20 animate-pulse"
          >
            <span className="text-base">👛</span>
            <span className="text-[10px] md:text-xs">Connect</span>
          </button>
        )}
      </div>
    </nav>
  )
}
