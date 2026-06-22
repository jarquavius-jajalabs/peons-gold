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
  const { wallet, peonId, mineId, shaft, auth } = await context.request.json() as {
    wallet: string; peonId: string; mineId: string; shaft: number; auth?: SignedActionAuth
  }
  if (!wallet || !peonId || !mineId || shaft === undefined) {
    return new Response(JSON.stringify({ error: 'wallet, peonId, mineId, shaft required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    })
  }

  const authPayload = `${peonId}:${mineId}:${shaft}`
  const authError = await verifySignedAction(context.env.GAME_STATE, wallet, 'assign-peon', authPayload, auth)
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

  const peon = state.peons.find(p => p.id === peonId)
  const mine = state.mines.find(m => m.id === mineId)
  if (!peon || !mine) {
    return new Response(JSON.stringify({ error: 'peon or mine not found' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    })
  }

  if (shaft >= mine.shafts) {
    return new Response(JSON.stringify({ error: 'invalid shaft' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    })
  }

  // Unassign from old mine
  if (peon.assignedMineId) {
    const oldMine = state.mines.find(m => m.id === peon.assignedMineId)
    if (oldMine) {
      oldMine.assignedPeons = oldMine.assignedPeons.filter(id => id !== peonId)
      oldMine.goldPerEpoch = oldMine.assignedPeons.reduce((sum, id) => {
        const p = state.peons.find(pp => pp.id === id)
        return sum + (p?.miningPower || 0)
      }, 0)
    }
  }

  peon.assignedMineId = mineId
  peon.assignedShaft = shaft
  if (!mine.assignedPeons.includes(peonId)) mine.assignedPeons.push(peonId)
  mine.goldPerEpoch = mine.assignedPeons.reduce((sum, id) => {
    const p = state.peons.find(pp => pp.id === id)
    return sum + (p?.miningPower || 0)
  }, 0)

  await context.env.GAME_STATE.put(`player:${wallet}`, JSON.stringify(state))

  return new Response(JSON.stringify({ state }), {
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  })
}
