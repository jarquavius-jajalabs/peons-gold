'use client'
import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import PeonPortrait from '@/components/PeonPortrait'
import { Button } from '@/components/ui/warcraftcn/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/warcraftcn/card'
import { Badge } from '@/components/ui/warcraftcn/badge'
import { getState, assignPeon, getCachedState } from '@/lib/game-store'
import { RARITY_CONFIG, type PlayerState } from '@/lib/mock-data'
import { useSound } from '@/lib/sound-context'
import { useToast } from '@/lib/toast-context'
import { useWallet } from '@solana/wallet-adapter-react'
import Link from 'next/link'

function MiningShaft({ occupied, peon, selected, onClick }: {
  occupied: boolean
  peon?: PlayerState['peons'][0]
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`relative aspect-square rounded-lg border-2 flex flex-col items-center justify-center transition-all text-center p-2 overflow-hidden ${
        occupied
          ? 'border-amber-600/50 bg-amber-900/20'
          : selected
            ? 'border-amber-400 bg-amber-800/30 ring-2 ring-amber-400/50 animate-glow-pulse'
            : 'border-amber-900/30 bg-black/20 hover:border-amber-700/50 cursor-pointer hover:bg-amber-900/10'
      }`}
    >
      {occupied && peon ? (
        <>
          <div className="absolute top-1 right-1 text-xs animate-pickaxe-mini">⛏️</div>
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-gold rounded-full animate-gold-float"
                style={{
                  left: `${30 + Math.random() * 40}%`,
                  bottom: '0%',
                  animationDelay: `${i * 0.7}s`,
                  animationDuration: `${1.5 + Math.random()}s`,
                }}
              />
            ))}
          </div>
          <PeonPortrait peon={peon} size="sm" showPower={true} />
        </>
      ) : (
        <>
          <span className="text-2xl text-amber-900/40">+</span>
          <span className="text-[10px] text-amber-900/40">Empty Shaft</span>
        </>
      )}
    </button>
  )
}

export default function MineClient({ id }: { id: string }) {
  const [state, setState] = useState<PlayerState | null>(null)
  const [selectedShaft, setSelectedShaft] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const { play } = useSound()
  const { toast } = useToast()
  const { publicKey, connected } = useWallet()

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (mounted && connected && publicKey) {
      setLoading(true)
      getState(publicKey.toBase58()).then(s => {
        setState(s)
        setLoading(false)
      }).catch(() => setLoading(false))
    }
  }, [mounted, connected, publicKey])

  if (!mounted) return <div className="min-h-screen" />

  if (loading || !state) {
    return (
      <div className="min-h-screen pb-24 md:pt-16">
        <Navigation />
        <div className="flex items-center justify-center h-64">
          <div className="text-amber-400 animate-pulse text-lg">⛏️ Loading mine...</div>
        </div>
      </div>
    )
  }

  const mine = state.mines.find(m => m.id === id)
  if (!mine) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-amber-400 text-xl mb-4">Mine not found</p>
          <Link href="/dashboard"><Button variant="frame" className="text-amber-100">← Back</Button></Link>
        </div>
      </div>
    )
  }

  const assignedPeons = state.peons.filter(p => p.assignedMineId === mine.id)
  const unassignedPeons = state.peons.filter(p => !p.assignedMineId)
  const fillPercent = (assignedPeons.length / mine.shafts) * 100

  const handleAssign = async (peonId: string) => {
    if (selectedShaft === null || !publicKey) return
    const success = await assignPeon(publicKey.toBase58(), peonId, mine.id, selectedShaft)
    if (success) {
      play('peon_assign')
      const peon = state.peons.find(p => p.id === peonId)
      toast(`${peon?.name || 'Peon'} assigned to shaft #${selectedShaft + 1}!`, 'success')
      setSelectedShaft(null)
      setState(getCachedState())
    } else {
      toast('Failed to assign peon', 'info')
    }
  }

  return (
    <div className="min-h-screen pb-24 md:pt-16 animate-fade-in">
      <Navigation />
      <div className="max-w-3xl mx-auto px-4 py-6">
        <Link href="/dashboard" className="text-amber-500/60 text-sm hover:text-amber-400 mb-4 inline-block transition-colors">← Back to Dashboard</Link>
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-amber-300 gold-glow">⛏️ {mine.name}</h1>
          <div className="flex items-center justify-center gap-3 mt-2">
            <Badge>Level {mine.level}</Badge>
            <span className="text-gold font-bold">{mine.goldPerEpoch.toFixed(1)} $GOLD/epoch</span>
          </div>
          <div className="w-full max-w-xs mx-auto h-2 bg-amber-900/30 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-600 to-gold rounded-full transition-all" style={{ width: `${fillPercent}%` }} />
          </div>
          <div className="text-amber-500/50 text-xs mt-1">{assignedPeons.length}/{mine.shafts} shafts filled</div>
        </div>
        <Card className="mb-6">
          <CardHeader><CardTitle>Mine Shafts</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {Array.from({ length: mine.shafts }).map((_, i) => {
                const peon = assignedPeons.find(p => p.assignedShaft === i)
                const isSelected = selectedShaft === i
                return (
                  <MiningShaft key={i} occupied={!!peon} peon={peon} selected={isSelected} onClick={() => !peon && setSelectedShaft(isSelected ? null : i)} />
                )
              })}
            </div>
          </CardContent>
        </Card>
        {selectedShaft !== null && (
          <Card className="mb-6 animate-fade-in">
            <CardHeader><CardTitle>Assign to Shaft #{selectedShaft + 1}</CardTitle></CardHeader>
            <CardContent>
              {unassignedPeons.length === 0 ? (
                <p className="text-amber-500/60 text-sm text-center py-4">No unassigned peons. Open packs to get more!</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {unassignedPeons.map(peon => (
                    <button
                      key={peon.id}
                      onClick={() => handleAssign(peon.id)}
                      className="p-3 rounded border border-amber-900/30 bg-black/20 hover:bg-amber-900/20 hover:border-amber-600/50 transition-all text-left flex items-center gap-2"
                    >
                      <PeonPortrait peon={peon} size="sm" showName={false} showPower={false} />
                      <div>
                        <div className="text-sm" style={{ color: RARITY_CONFIG[peon.rarity].color }}>{peon.name}</div>
                        <div className="text-xs text-amber-400/60">×{peon.miningPower} power</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
        <div className="text-center">
          <Button variant="frame" className="text-amber-100 hover:scale-[1.02] transition-transform">
            ⬆️ Upgrade Mine (500 $GOLD) → +1 Shaft
          </Button>
        </div>
      </div>
    </div>
  )
}
