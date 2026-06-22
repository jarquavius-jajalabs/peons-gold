import type { PlayerState } from '../../lib/mock-data'
import { verifySignedAction, type SignedActionAuth } from './auth'

interface Env {
  GAME_STATE: KVNamespace
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { headers: CORS_HEADERS })
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { wallet, auth } = await context.request.json() as { wallet: string; auth?: SignedActionAuth }
  if (!wallet) {
    return new Response(JSON.stringify({ error: 'wallet required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    })
  }

  const authError = await verifySignedAction(context.env.GAME_STATE, wallet, 'claim', '', auth)
  if (authError) {
    return new Response(JSON.stringify({ error: authError }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    })
  }

  const state = await context.env.GAME_STATE.get(`player:${wallet}`, 'json') as PlayerState | null
  if (!state) {
    return new Response(JSON.stringify({ error: 'player not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    })
  }

  // Calculate unclaimed gold based on time elapsed and mining power
  const now = Date.now()
  const elapsed = now - state.lastClaimTime
  const epochMs = 1000 * 60 * 60 // 1 hour epoch
  const epochs = elapsed / epochMs

  // Total gold per epoch from all mines
  const totalGoldPerEpoch = state.mines.reduce((sum, mine) => sum + mine.goldPerEpoch, 0)
  const accumulated = totalGoldPerEpoch * epochs

  const claimed = state.unclaimedGold + accumulated
  state.gold += claimed
  state.unclaimedGold = 0
  state.lastClaimTime = now

  await context.env.GAME_STATE.put(`player:${wallet}`, JSON.stringify(state))

  return new Response(JSON.stringify({ state, claimed }), {
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  })
}
