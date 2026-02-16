import { createMockState } from '../../lib/mock-data'

interface Env {
  GAME_STATE: KVNamespace
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { headers: CORS_HEADERS })
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url)
  const wallet = url.searchParams.get('wallet')
  if (!wallet) {
    return new Response(JSON.stringify({ error: 'wallet required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    })
  }

  let state = await context.env.GAME_STATE.get(`player:${wallet}`, 'json')
  if (!state) {
    state = createMockState()
    await context.env.GAME_STATE.put(`player:${wallet}`, JSON.stringify(state))
  }

  return new Response(JSON.stringify(state), {
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  })
}

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const body = await context.request.json() as { wallet: string; state: any }
  if (!body.wallet || !body.state) {
    return new Response(JSON.stringify({ error: 'wallet and state required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    })
  }

  await context.env.GAME_STATE.put(`player:${body.wallet}`, JSON.stringify(body.state))

  return new Response(JSON.stringify(body.state), {
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  })
}
