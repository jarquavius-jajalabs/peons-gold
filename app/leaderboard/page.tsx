'use client'
import Navigation from '@/components/Navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/warcraftcn/card'
import { Badge } from '@/components/ui/warcraftcn/badge'
import { MOCK_LEADERBOARD } from '@/lib/mock-data'

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen pb-24 md:pt-16 animate-fade-in">
      <Navigation />
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-amber-300 gold-glow mb-2">🏆 Leaderboard</h1>
          <p className="text-amber-500/60 text-sm">Top miners by total $GOLD earned</p>
        </div>

        {/* Top 3 podium */}
        <div className="flex items-end justify-center gap-3 mb-8">
          {[MOCK_LEADERBOARD[1], MOCK_LEADERBOARD[0], MOCK_LEADERBOARD[2]].map((entry, i) => {
            const heights = ['h-24', 'h-32', 'h-20']
            const medals = ['🥈', '🥇', '🥉']
            const sizes = ['text-base', 'text-lg', 'text-base']
            return (
              <div key={entry.rank} className="text-center flex-1 max-w-[120px]">
                <div className="text-2xl mb-1">{medals[i]}</div>
                <div className={`${sizes[i]} text-amber-200 font-bold truncate`}>{entry.name}</div>
                <div className="text-gold text-xs font-bold">{(entry.totalGold / 1000).toFixed(1)}K</div>
                <div className={`${heights[i]} bg-gradient-to-t from-amber-900/40 to-amber-800/20 rounded-t-lg mt-2 border border-amber-900/30 border-b-0 flex items-center justify-center`}>
                  <span className="text-amber-500/60 text-xs">{entry.mines} mines</span>
                </div>
              </div>
            )
          })}
        </div>

        <Card>
          <CardHeader><CardTitle>All Rankings</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {MOCK_LEADERBOARD.map(entry => {
                const isYou = entry.name === 'You'
                return (
                  <div
                    key={entry.rank}
                    className={`flex items-center justify-between py-3 px-3 rounded-lg transition-all ${
                      isYou ? 'bg-amber-800/20 border border-amber-600/30' : 'hover:bg-amber-900/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-8 text-center font-bold ${
                        entry.rank <= 3 ? 'text-gold text-lg' : 'text-amber-500/50'
                      }`}>
                        {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : `#${entry.rank}`}
                      </span>
                      <div>
                        <div className={`font-bold ${isYou ? 'text-amber-300' : 'text-amber-200'}`}>
                          {entry.name} {isYou && <Badge size="sm" className="ml-1">YOU</Badge>}
                        </div>
                        <div className="text-amber-500/40 text-xs font-mono">{entry.address}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-gold font-bold">{entry.totalGold.toLocaleString()}</div>
                      <div className="text-amber-500/50 text-xs">{entry.mines} mines</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
