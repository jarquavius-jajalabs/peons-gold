'use client'
import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import PeonPortrait from '@/components/PeonPortrait'
import { Badge } from '@/components/ui/warcraftcn/badge'
import { getState } from '@/lib/game-store'
import { RARITY_CONFIG, type PlayerState, type Rarity } from '@/lib/mock-data'
import { useWallet } from '@solana/wallet-adapter-react'

export default function RosterPage() {
  const [state, setState] = useState<PlayerState | null>(null)
  const [filter, setFilter] = useState<Rarity | 'all'>('all')
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
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
          <div className="text-amber-400 animate-pulse text-lg">⛏️ Loading roster...</div>
        </div>
      </div>
    )
  }

  const filtered = filter === 'all' ? state.peons : state.peons.filter(p => p.rarity === filter)
  const grouped = (['mythic', 'legendary', 'epic', 'rare', 'uncommon', 'common'] as Rarity[])
    .map(r => ({ rarity: r, peons: filtered.filter(p => p.rarity === r) }))
    .filter(g => g.peons.length > 0)

  return (
    <div className="min-h-screen pb-24 md:pt-16 animate-fade-in">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-amber-300 gold-glow mb-2">Your Roster</h1>
          <p className="text-amber-500/60 text-sm">{state.peons.length} peons in your army</p>
        </div>
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded text-xs transition-all ${filter === 'all' ? 'bg-amber-800/40 text-amber-200' : 'text-amber-500/50 hover:text-amber-400'}`}
          >
            All ({state.peons.length})
          </button>
          {(['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'] as Rarity[]).map(r => {
            const count = state.peons.filter(p => p.rarity === r).length
            if (count === 0) return null
            return (
              <button
                key={r}
                onClick={() => setFilter(r)}
                className={`px-3 py-1 rounded text-xs transition-all ${filter === r ? 'bg-amber-800/40' : 'hover:bg-amber-900/20'}`}
                style={{ color: RARITY_CONFIG[r].color }}
              >
                {r} ({count})
              </button>
            )
          })}
        </div>
        {grouped.map(group => (
          <div key={group.rarity} className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: RARITY_CONFIG[group.rarity].color }}>
              {group.rarity} ({group.peons.length})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {group.peons.map(peon => (
                <div
                  key={peon.id}
                  className={`rounded-lg border p-3 bg-gradient-to-b ${RARITY_CONFIG[peon.rarity].bg} transition-all hover:scale-[1.02] hover:brightness-110 cursor-pointer`}
                  style={{ borderColor: RARITY_CONFIG[peon.rarity].color + '40' }}
                >
                  <div className="flex flex-col items-center">
                    <PeonPortrait peon={peon} size="md" />
                    {peon.assignedMineId ? (
                      <Badge size="sm" className="mt-2 text-[10px]">⛏️ Mining</Badge>
                    ) : (
                      <span className="text-[10px] text-amber-900/40 mt-2 block">Idle</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
