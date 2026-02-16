'use client'
import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import ClaimTimer from '@/components/ClaimTimer'
import PeonPortrait from '@/components/PeonPortrait'
import { Button } from '@/components/ui/warcraftcn/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/warcraftcn/card'
import { Badge } from '@/components/ui/warcraftcn/badge'
import { getState, claimGold, buyMine, getCachedState } from '@/lib/game-store'
import { RARITY_CONFIG, MOCK_ACTIVITY, type Mine, type PlayerState, type Rarity } from '@/lib/mock-data'
import { useSound } from '@/lib/sound-context'
import { useToast } from '@/lib/toast-context'
import { useWallet } from '@solana/wallet-adapter-react'
import { useSolBalance, useSolTransfer } from '@/lib/use-solana'
import { explorerUrl } from '@/lib/solana-utils'
import Link from 'next/link'

function AnimatedGold({ value }: { value: number }) {
  const [display, setDisplay] = useState(value)
  useEffect(() => {
    const start = display
    const diff = value - start
    if (Math.abs(diff) < 0.1) { setDisplay(value); return }
    const duration = 500
    const startTime = Date.now()
    const tick = () => {
      const progress = Math.min((Date.now() - startTime) / duration, 1)
      setDisplay(start + diff * progress)
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [value])
  return <>{display.toFixed(1)}</>
}

function ActivityFeed() {
  const [visibleIndex, setVisibleIndex] = useState(0)

  useEffect(() => {
    const i = setInterval(() => {
      setVisibleIndex(prev => (prev + 1) % MOCK_ACTIVITY.length)
    }, 4000)
    return () => clearInterval(i)
  }, [])

  return (
    <div className="h-6 overflow-hidden relative">
      {MOCK_ACTIVITY.map((item, i) => (
        <div
          key={i}
          className={`absolute inset-x-0 transition-all duration-500 text-xs text-center truncate ${
            i === visibleIndex ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ color: item.rarity !== 'common' ? RARITY_CONFIG[item.rarity].color : 'rgba(251,191,36,0.5)' }}
        >
          {item.text}
        </div>
      ))}
    </div>
  )
}

function MineCard({ mine, peons }: { mine: Mine, peons: PlayerState['peons'] }) {
  const assignedPeons = peons.filter(p => p.assignedMineId === mine.id)
  const fillPercent = (assignedPeons.length / mine.shafts) * 100

  return (
    <Link href={`/mine/${mine.id}`}>
      <Card className="hover:brightness-110 transition-all cursor-pointer group" data-size="sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="text-amber-200 group-hover:text-amber-100 transition-colors">⛏️ {mine.name}</span>
            <Badge size="sm">Lv.{mine.level}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-amber-400/70">Shafts</span>
            <span className="text-amber-200">{assignedPeons.length}/{mine.shafts}</span>
          </div>
          <div className="w-full h-1.5 bg-amber-900/30 rounded-full mb-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-600 to-gold rounded-full transition-all"
              style={{ width: `${fillPercent}%` }}
            />
          </div>
          <div className="flex gap-1 mb-2">
            {Array.from({ length: mine.shafts }).map((_, i) => {
              const peon = assignedPeons.find(p => p.assignedShaft === i)
              return (
                <div key={i} className="flex-1">
                  {peon ? (
                    <PeonPortrait peon={peon} size="sm" showName={false} showPower={false} />
                  ) : (
                    <div className="w-12 h-12 rounded-lg border border-amber-900/30 bg-black/20 flex items-center justify-center">
                      <span className="text-amber-900/40 text-xs">+</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-amber-400/70">Output</span>
            <span className="text-gold font-bold">{mine.goldPerEpoch.toFixed(1)} $GOLD/epoch</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export default function Dashboard() {
  const [state, setLocalState] = useState<PlayerState | null>(null)
  const [loading, setLoading] = useState(true)
  const [claimFlash, setClaimFlash] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { play } = useSound()
  const { toast } = useToast()
  const { connected, publicKey } = useWallet()
  const { balance, refresh: refreshBalance } = useSolBalance()
  const { transfer, loading: txLoading } = useSolTransfer()
  const router = useRouter()

  useEffect(() => { setMounted(true) }, [])

  // Gate behind wallet
  useEffect(() => {
    if (mounted && !connected) {
      router.push('/')
    }
  }, [mounted, connected, router])

  // Load state from server
  useEffect(() => {
    if (mounted && connected && publicKey) {
      setLoading(true)
      getState(publicKey.toBase58()).then(s => {
        setLocalState(s)
        setLoading(false)
      }).catch(() => setLoading(false))
    }
  }, [mounted, connected, publicKey])

  const handleClaim = useCallback(async () => {
    if (!publicKey) return
    const amount = await claimGold(publicKey.toBase58())
    play('gold_claim')
    setClaimFlash(true)
    toast(`+${amount.toFixed(1)} $GOLD claimed!`, 'gold')
    setTimeout(() => setClaimFlash(false), 500)
    setLocalState(getCachedState())
  }, [play, toast, publicKey])

  const handleBuyMine = useCallback(async () => {
    if (txLoading || !publicKey || !state) return
    if (state.mines.length >= 15) { toast('Max mines reached', 'info'); return }
    
    toast('Confirm transaction in your wallet...', 'info')
    const result = await transfer(0.01)
    
    if ('error' in result) {
      toast(result.error, 'info')
      return
    }

    toast('Verifying transaction...', 'info')
    const mine = await buyMine(publicKey.toBase58(), result.signature)
    if (mine) {
      play('mine_purchase')
      toast(`${mine.name} purchased! View tx`, 'success')
      window.open(explorerUrl(result.signature), '_blank')
    } else {
      toast('Failed to verify mine purchase', 'info')
    }
    await refreshBalance()
    setLocalState(getCachedState())
  }, [play, toast, transfer, txLoading, state, publicKey, refreshBalance])

  if (!mounted || !connected) return <div className="min-h-screen" />

  if (loading || !state) {
    return (
      <div className="min-h-screen pb-24 md:pt-16">
        <Navigation />
        <div className="flex items-center justify-center h-64">
          <div className="text-amber-400 animate-pulse text-lg">⛏️ Loading your empire...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24 md:pt-16 animate-fade-in">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Network stats banner */}
        <div className="flex items-center justify-center gap-4 text-[10px] md:text-xs text-amber-500/50 mb-4 flex-wrap">
          <span>Total Mines: <span className="text-amber-400">1,247</span></span>
          <span className="text-amber-900/30">|</span>
          <span>Active Peons: <span className="text-amber-400">8,432</span></span>
          <span className="text-amber-900/30">|</span>
          <span>$GOLD Mined Today: <span className="text-gold">2.4M</span></span>
        </div>

        {/* Header stats */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-amber-300 gold-glow mb-1">⛏️ Your Empire</h1>
          <div className={`text-3xl md:text-4xl font-bold text-gold transition-all ${claimFlash ? 'scale-110' : ''}`}>
            <AnimatedGold value={state.gold} /> $GOLD
          </div>
          <div className="text-amber-500/60 text-sm">{balance !== null ? balance.toFixed(4) : '...'} SOL</div>
        </div>

        {/* Activity feed */}
        <div className="mb-4">
          <ActivityFeed />
        </div>

        {/* Claim timer */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <ClaimTimer lastClaimTime={state.lastClaimTime} unclaimedGold={state.unclaimedGold} />
            <div className="flex justify-center mt-3">
              <Button
                variant="frame"
                onClick={handleClaim}
                className={`text-amber-100 transition-all ${state.unclaimedGold > 0 ? 'animate-glow-pulse' : ''}`}
              >
                ⚡ Claim $GOLD
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Mines grid */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-amber-300">Your Mines ({state.mines.length}/15)</h2>
          <Button variant="default" onClick={handleBuyMine} disabled={txLoading} className="text-sm text-amber-100 hover:scale-[1.02] transition-transform">
            {txLoading ? '⏳ Confirming...' : '+ Buy Mine (0.01 SOL)'}
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {state.mines.map(mine => (
            <MineCard key={mine.id} mine={mine} peons={state.peons} />
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/packs">
            <Button variant="frame" className="w-full text-amber-100 hover:scale-[1.01] transition-transform">
              📦 Open Packs {state.packs > 0 && `(${state.packs})`}
            </Button>
          </Link>
          <Link href="/roster">
            <Button variant="frame" className="w-full text-amber-100 hover:scale-[1.01] transition-transform">
              👥 Roster ({state.peons.length})
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
