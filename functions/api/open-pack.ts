import { rollPeon, type PlayerState } from '../../lib/mock-data'

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
  const { wallet } = await context.request.json() as { wallet: string }
  if (!wallet) {
    return new Response(JSON.stringify({ error: 'wallet required' }), {
      status: 400,
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

  const newPeons = [rollPeon(), rollPeon(), rollPeon()]
  state.peons.push(...newPeons)
  state.totalPacksOpened = (state.totalPacksOpened || 0) + 1

  await context.env.GAME_STATE.put(`player:${wallet}`, JSON.stringify(state))

  return new Response(JSON.stringify({ state, newPeons }), {
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  })
}
